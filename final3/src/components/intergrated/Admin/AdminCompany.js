import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaPenToSquare } from "react-icons/fa6";
import { IoIosSave } from "react-icons/io";
import { GiCancel } from "react-icons/gi";
import { Modal } from 'bootstrap';
import { format, parseISO } from 'date-fns';
import Jumbotron from "../../Jumbotron";
import axios from "../../utils/CustomAxios";
import './AdminCompany.css';

const AdminCompany = () => {
    const [companies, setCompanies] = useState([]);
    const [showUncheckedOnly, setShowUncheckedOnly] = useState(false);
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

    const clearInput = useCallback(()=>{
        setInput({
            companyNo: "",
            companyPw: "",
            companyName: "",
            companyBn: "",
            companyContact: "",
            companyEmail: "",
            companyZipcode: "",
            companyAddress1: "",
            companyAddress2: "",
            companyChecked: ""
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
        if(choice === false) return;

        clearInput();

        closeEditModal();
    }, [input]);

    //목록 불러오기
    const loadData = useCallback(async () => {
        const resp = await axios.get("/admin/company/");
        setCompanies(resp.data);
        console.log(resp.data);
    }, []);

    const handleCheckboxChange = (e) => {
        setShowUncheckedOnly(e.target.checked); 
    };

    const handleColumnChange = (e) => {
        setSearchColumn(e.target.value);
    };

    const handleKeywordChange = (e) => {
        setSearchKeyword(e.target.value);
    };

    const filteredCompanies = companies.filter((company) => {
        // 인증 여부 필터링
        if (showUncheckedOnly && company.companyChecked) {
            return false; // 인증된 회사는 제외
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
        modal.hide();
    }, [editModal]);

    //가입 승인
    const approveCompany = useCallback(async (company)=>{
        const check = window.confirm("사업자등록증을 확인하셨나요?");
        if(!check) {
            return;
        } else {
            const doubleCheck = window.confirm("회사의 가입을 승인하겠습니까?")
            if(!doubleCheck) return;
        }
        const resp = await axios.patch("/admin/company/approve/" + company.companyNo);
        console.log("Approve response:", resp); // 응답 확인

        loadData(); // 데이터 로딩
        console.log("Data reloaded after approval"); // 로딩 확인
    });

    return (
        <>
            <Jumbotron title="회사 목록 관리" />

            <div className="form-check">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id="showUncheckedOnly"
                    checked={showUncheckedOnly}
                    onChange={handleCheckboxChange} 
                />
                <label className="form-check-label" htmlFor="showUncheckedOnly">
                    인증되지 않은 회사만 보기
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
                                <th className='tw-1'>상세/관리</th>
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
                                            <td style={{color: 'red'}}>
                                                <p className='pointer' onClick={(e)=> approveCompany(company)}>N</p>
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
                            {/* 등록 화면 */}
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
             <div ref={editModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">회사 정보 수정</h1>
                            <button type="button" className="btn-close" aria-label="Close" onClick={e => cancelInput()}></button>
                        </div>
                        <div className="modal-body">
                            {/* 등록 화면 */}
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
        </>
    );
};

export default AdminCompany;
