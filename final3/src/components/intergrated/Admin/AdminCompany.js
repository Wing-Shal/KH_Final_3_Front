import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaPenToSquare } from "react-icons/fa6";
import { IoIosSave } from "react-icons/io";
import { GiCancel } from "react-icons/gi";
import { Modal } from 'bootstrap';
import { format, parseISO } from 'date-fns';
import Jumbotron from "../../Jumbotron";
import axios from "../../utils/CustomAxios";
import DaumPostcode from 'react-daum-postcode';
import './AdminCompany.css';

const AdminCompany = () => {
    const [companies, setCompanies] = useState([]);
    const [statusHistories, setStatusHistories] = useState([]);
    const [showUnauthenticatedOnly, setShowUnauthenticatedOnly] = useState(false);
    const [showInactiveOnly, setShowInactiveOnly] = useState(false);
    const [searchColumn, setSearchColumn] = useState("companyName");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [input, setInput] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    //callback
    const changeInput = useCallback((e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

    const clearInput = useCallback(() => {
        setInput({
            companyNo: "",
            companyName: "",
            companyBn: "",
            companyContact: "",
            companyEmail: "",
            companyZipcode: "",
            companyAddress1: "",
            companyAddress2: "",
            companyChecked: "",
            paymentStatus: ""
        });
    }, [input]);

    const saveInput = useCallback(async () => {
        const resp = await axios.patch("/admin/company/", input);

        //정보 다시 로딩
        loadData();

        // 입력 폼 초기화
        clearInput();

        // 모달 닫기
        closeEditModal();
    }, [input]);

    const cancelInput = useCallback(() => {
        const choice = window.confirm("작성을 취소하시겠습니까?");
        if (choice === false) return;

        clearInput();

        closeEditModal();
    }, [input]);

    //목록 불러오기
    const loadData = useCallback(async () => {
        const resp = await axios.get("/admin/company/");
        setCompanies(resp.data);
    }, []);

    const handleUnauthenticatedChange = (e) => {
        setShowUnauthenticatedOnly(e.target.checked);
    };
    const handleInactiveChange = (e) => {
        setShowInactiveOnly(e.target.checked);
    };

    const handleColumnChange = (e) => {
        setSearchColumn(e.target.value);
    };

    const handleKeywordChange = (e) => {
        setSearchKeyword(e.target.value);
    };

    const filteredCompanies = companies.filter((company) => {
        // 인증 여부 필터링
        if (showUnauthenticatedOnly && company.companyChecked) {
            return false; // 인증된 회사는 제외
        }
        if (showInactiveOnly && company.paymentStatus === 'ACTIVE') {
            return false; // 결제중인 회사는 제외
        }

        // 검색 키워드 필터링
        if (searchKeyword.trim() !== "") {
            const field = company[searchColumn];
            return field && field.toLowerCase().includes(searchKeyword.toLowerCase());
        }

        return true; // 필터링하지 않음
    });

    //정보 수정 모달
    const editModal = useRef();
    const openEditModal = useCallback((company) => {
        const modal = new Modal(editModal.current);
        setInput(company)
        modal.show();
    }, [editModal]);
    const closeEditModal = useCallback(() => {
        const modal = Modal.getInstance(editModal.current);
        setIsOpen(false);
        modal.hide();
    }, [editModal]);

    const statusModal = useRef();
    const openStatusModal = useCallback((company) => {
        const modal = new Modal(statusModal.current);

        (async () => {
            const resp = await axios.get("admin/company/paymentHistory/" + company.companyNo);
            setStatusHistories(resp.data)
            modal.show();
        })();
    }, [statusModal, setStatusHistories]);
    const closeStatusModal = useCallback(() => {
        const modal = Modal.getInstance(statusModal.current);
        modal.hide();
    }, [statusModal]);

    //가입 승인
    const approveCompany = useCallback(async (company) => {
        const check = window.confirm("사업자등록증을 확인하셨나요?");
        if (!check) {
            return;
        } else {
            const doubleCheck = window.confirm("회사의 가입을 승인하겠습니까?")
            if (!doubleCheck) return;
        }
        const resp = await axios.patch("/admin/company/approve/" + company.companyNo);

        loadData(); // 데이터 로딩
    });

    //주소 입력
    const [isOpen, setIsOpen] = useState(false);
    const postCodeStyle = {
        
      };
    const completeHandler = (data) => {
        const { address, zonecode } = data;
        setInput({
            ...input,
            companyAddress1: address,
            companyZipcode: zonecode,
        })
    };
    const closeHandler = (state) => {
        if (state === 'FORCE_CLOSE') {
            setIsOpen(false);
        } else if (state === 'COMPLETE_CLOSE') {
            setIsOpen(false);
        }
    };
    const toggleHandler = () => {
        setIsOpen((prevOpenState) => !prevOpenState);
    };
    return (
        <>
            <Jumbotron title="회사 목록/관리" />

            <div className="form-check">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id="showUnauthenticatedOnly"
                    checked={showUnauthenticatedOnly}
                    onChange={handleUnauthenticatedChange}
                />
                <label className="form-check-label" htmlFor="showUnauthenticatedOnly">
                    인증되지 않은 회사만 보기
                </label>
                <br />
                <input
                    type="checkbox"
                    className="form-check-input"
                    id="showInactiveOnly"
                    checked={showInactiveOnly}
                    onChange={handleInactiveChange}
                />
                <label className="form-check-label" htmlFor="showInactiveOnly">
                    결제 중이지 않은 회사만 보기
                </label>
            </div>

            <div className="search-container mt-3">
                <select
                    className="form-select"
                    onChange={handleColumnChange}
                    value={searchColumn}
                >
                    <option value="companyName">사명</option>
                    <option value="companyContact">전화번호</option>
                    <option value="companyEmail">이메일</option>
                </select>
                <input
                    type="text"
                    className="form-control"
                    placeholder="검색어 입력"
                    value={searchKeyword}
                    onChange={handleKeywordChange}
                />
            </div>

            <div className='row mt-4'>
                <div className='col'>
                    <table className='table'>
                        <thead className='text-center'>
                            <tr>
                                <th className='tw-1'>구분번호</th>
                                <th className='tw-2'>사명</th>
                                <th className='tw-2'>전화번호</th>
                                <th className='tw-2'>이메일</th>
                                <th className='tw-2'>인증여부</th>
                                <th className='tw-2'>결제상태</th>
                                <th className='tw-1'>관리</th>
                            </tr>
                        </thead>
                        <tbody className='text-center'>
                            {filteredCompanies.map(company => (
                                <tr key={company.companyNo} height="55" className='align-items-center'>
                                    <td>{company.companyNo}</td>
                                    <td>{company.companyName}</td>
                                    <td>{company.companyContact}</td>
                                    <td>{company.companyEmail}</td>
                                    {company.companyChecked ? (
                                        <>
                                            <td>
                                                {format(parseISO(company.companyChecked), 'yyyy-MM-dd')}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td style={{ color: 'red' }}>
                                                <p className='pointer' onClick={(e) => approveCompany(company)}>N</p>
                                            </td>
                                        </>
                                    )}
                                    {company.paymentStatus === 'INACTIVE' ? (
                                        <>
                                            <td style={{ color: 'red' }}>
                                                <p>{company.paymentStatus}</p>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className='pointer'>
                                                <p onClick={(e) => openStatusModal(company)}>{company.paymentStatus}</p>
                                            </td>
                                        </>
                                    )}
                                    
                                    <td>
                                        <FaPenToSquare className='text-warning me-2 pointer'
                                            onClick={(e) => openEditModal(company)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <div ref={editModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">회사 정보 수정</h1>
                            <button type="button" className="btn-close" aria-label="Close" onClick={e => cancelInput()}></button>
                        </div>
                        <div className="modal-body">
                            {/* 수정 화면 */}
                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>사번</label>
                                    <input type="text" name="companyNo"
                                        value={input.companyNo}
                                        readOnly
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>사명</label>
                                    <input type="text" name="companyName"
                                        value={input.companyName}
                                        onChange={e => changeInput(e)}
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>사업자등록번호</label>
                                    <input type="text" name="companyBn"
                                        value={input.companyBn}
                                        onChange={e => changeInput(e)}
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>전화번호</label>
                                    <input type="text" name="companyContact"
                                        value={input.companyContact}
                                        onChange={e => changeInput(e)}
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>이메일</label>
                                    <input type="text" name="companyEmail"
                                        value={input.companyEmail}
                                        onChange={e => changeInput(e)}
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>우편번호</label>
                                    <input type="text" name="companyZipcode"
                                        value={input.companyZipcode}
                                        readOnly
                                        className='form-control' />
                                </div>
                            </div>
                            <button className='btn btn-dark' type='button' onClick={() => toggleHandler()}>우편번호 찾기</button>
                            {isOpen && (
                                <div>                                    
                                    <DaumPostcode
                                        style={postCodeStyle}
                                        onComplete={completeHandler}
                                        onClose={closeHandler}
                                    />
                                </div>
                            )}
                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>주소</label>
                                    <input type="text" name="companyAddress1"
                                        value={input.companyAddress1}
                                        readOnly
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>보완주소</label>
                                    <input type="text" name="companyAddress2"
                                        value={input.companyAddress2}
                                        onChange={e => changeInput(e)}
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>인증여부</label>
                                    <input type="text" name="companyChecked"
                                        value={input.companyChecked}
                                        readOnly
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>결제상태</label>
                                    <input type="text" name="paymentStatus"
                                        value={input.paymentStatus}
                                        readOnly
                                        className='form-control' />
                                </div>
                            </div>


                        </div>
                        <div className="modal-footer">
                            <button className='btn btn-danger'
                                onClick={e => cancelInput()}>
                                <GiCancel />
                                &nbsp;
                                취소
                            </button>
                            <button className='btn btn-success me-2'
                                onClick={e => saveInput()}>
                                <IoIosSave />
                                &nbsp;
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <div ref={statusModal} className="modal fade modal-lg" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">결제기록</h1>
                            <button type="button" className="btn-close" aria-label="Close" onClick={e => closeStatusModal()}></button>
                        </div>
                        <div className="modal-body">
                            {/* 결제 내역 */}
                            <div className='row mt-4'>
                                <div className='col'>
                                    <table className='table'>
                                        <thead>
                                            <tr>
                                                <th>결제/취소 시각</th>
                                                <th>상품명</th>
                                                <th>금액</th>
                                                <th>상태</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statusHistories.map(statusHistory => (
                                                <tr>
                                                    <td>{format(parseISO(statusHistory.paymentTime), 'yyyy-MM-dd HH:mm:ss')}</td>
                                                    <td>{statusHistory.paymentName}</td>
                                                    <td>{statusHistory.paymentTotal}</td>
                                                    <td>{statusHistory.paymentStatus}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminCompany;
