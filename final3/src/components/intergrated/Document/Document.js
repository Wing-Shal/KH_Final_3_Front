import { useCallback, useEffect, useRef, useState } from "react";
import { loginIdState, loginLevelState } from '../../../components/utils/RecoilData';
import { useRecoilState } from 'recoil';
import Jumbotron from "../../Jumbotron";
import { FaSquareXmark } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { TbPencilCancel } from "react-icons/tb";
import axios from "../../utils/CustomAxios";
import { Modal } from "bootstrap";
import { Link, useParams } from 'react-router-dom';
import { FaSearch } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { IoPeopleSharp } from "react-icons/io5";
import { FaXmark } from "react-icons/fa6";
import '@radix-ui/themes/styles.css';

const Document = () => {
    const { projectNo } = useParams();
    const [loginId, setLoginId] = useRecoilState(loginIdState);
    const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);
    const [documents, setDocuments] = useState([]);
    const [project, setProjects] = useState([]);
    //파일첨부
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    // 검색창
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isApprovalMode, setIsApprovalMode] = useState(false); // 결재 모드 여부 상태
    const [projectName, setProjectName] = useState(""); // projectName 상태 추가
    const [emps, setEmps] = useState([]);
    const [invitations, setInvitations] = useState(false);
    const [selectedEmps, setSelectedEmps] = useState([]);

    const [input, setInput] = useState({
        documentTitle: "",
        documentContent: "",
        documentWriteTime: "",
        documentLimitTime: "",
        projectNo: projectNo,
        documentApprover: "",
        empNo: "",
        documentStatus:""
    });

    const [empInput, setEmpInput] = useState({
        projectNo: "",
        empNo: "",
        empName: "",
        deptName: "",
        gradeName: ""
    });

    //결재자 사원 목록
    const [selectedApprover, setSelectedApprover] = useState("");
    const removeSelectedEmp = useCallback((empName) => {
        setSelectedEmps(prev => prev.filter(name => name !== empName));
    }, []);

    const [backup, setBackup] = useState(null);//수정 시 복원을 위한 백업

    const performSearch = useCallback(async () => {
        // 검색을 수행하는 로직을 구현합니다. searchKeyword 상태를 사용하여 검색합니다.
        // 검색 결과를 searchResults 상태로 업데이트합니다.
    }, [searchKeyword]);

    const handleSearchClick = useCallback(() => {
        performSearch(); // 검색 아이콘이 클릭될 때 performSearch 함수 호출
    }, [performSearch]);

    const handleSearchChange = useCallback((e) => {
        setSearchKeyword(e.target.value); // 입력이 변경될 때 searchKeyword 상태를 업데이트합니다.
    }, []);

    const filterDocuments = useCallback(() => {
        return documents.filter(document =>
            (document.documentNo && document.documentNo.toString().toLowerCase().includes(searchKeyword.toLowerCase())) ||
            (document.documentTitle && typeof document.documentTitle === 'string' && document.documentTitle.toLowerCase().includes(searchKeyword.toLowerCase())) ||
            (document.documentContent && typeof document.documentContent === 'string' && document.documentContent.toLowerCase().includes(searchKeyword.toLowerCase())) ||
            (document.documentStatus && typeof document.documentStatus === 'string' && document.documentStatus.toLowerCase().includes(searchKeyword.toLowerCase())) ||
            (document.documentWriteTime && typeof document.documentWriteTime === 'string' && document.documentWriteTime.toLowerCase().includes(searchKeyword.toLowerCase())) ||
            (document.documentLimitTime && typeof document.documentLimitTime === 'string' && document.documentLimitTime.toLowerCase().includes(searchKeyword.toLowerCase())) ||
            (document.documentApprover && typeof document.documentApprover === 'string' && document.documentApprover.toLowerCase().includes(searchKeyword.toLowerCase()))
            // Add other attributes for search here
        );
    }, [documents, searchKeyword]);

    const filteredDocuments = filterDocuments();

    useEffect(() => {
        loadData();
    }, []);

    const fileInputRef = useRef();

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    useEffect(() => {
        const fetchProjectInfo = async () => {
            const response = await axios.get(`/project/${projectNo}`);
            setProjectName(response.data.projectName);
        };
        fetchProjectInfo();
    }, [projectNo]);

    const loadData = useCallback(async () => {
        const resp = await axios.get("/document/" + projectNo);
        setDocuments(resp.data);
    }, [projectNo]);

    const projectEmpLoadData = useCallback(async () => {
        const response = await axios.post("/project/projectEmp");
    }, []);

    const deleteDocument = useCallback(async (target) => {
        const choice = window.confirm("정말 삭제하시겠습니까?");
        if (choice === false) return;

        const resp = await axios.delete("/document/" + target.documentNo);
        loadData();
    }, [documents]);

    const changeInput = useCallback((e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

    const changeEmpInput = useCallback((e) => {
        setEmpInput({
            ...empInput,
            [e.target.name]: e.target.value
        });
    }, [empInput]);

    const bsModal = useRef();
    const openModal = useCallback(() => {
        const modal = new Modal(bsModal.current);
        setInput({
            ...input,
            empNo: loginId,
            documentApprover: selectedApprover
        });
        modal.show();
    }, [bsModal, loginId, selectedApprover]);

    const closeModal = useCallback(() => {
        const modal = Modal.getInstance(bsModal.current);
        modal.hide();
    }, [bsModal]);

    const clearInput = useCallback(() => {
        setInput({
            projectNo: "",
            empNo: "",
            documentTitle: "",
            documentContent: "",
            documentWriteTime: "",
            documentLimitTime: "",
            documentApprover: "",
        });
    }, [input]);

    const saveInput = useCallback(async () => {
        try {
            const resp = await axios.post("/document/", input);
            const savedDocument = resp.data;

            if (file) {
                const formData = new FormData();
                formData.append('attach', file);
                const uploadResp = await axios.post(`/document/upload/${savedDocument.documentNo}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                console.log('파일 업로드 결과:', uploadResp.data);
            }

            loadData();
            clearInput();
            closeModal();
        } catch (error) {
            console.error('문서 저장 또는 파일 업로드 중 오류 발생:', error);
        } finally {
            setFile(null);
        }
    }, [input, file, loadData, clearInput, closeModal]);

    const cancelInput = useCallback(() => {
        const choice = window.confirm("작성을 취소하시겠습니까?");
        if (choice === false) return;
        clearInput();
        closeModal();
    }, [input]);

    const [checkedState, setCheckedState] = useState({});
    const [allChecked, setAllChecked] = useState(false);

    const handleCheckAll = useCallback(() => {
        const newState = !allChecked;
        setAllChecked(newState);
        setCheckedState(emps.reduce((state, emp, index) => ({
            ...state,
            [index]: newState
        }), {}));
        if (newState) {
            setSelectedEmps(emps.map(emp => emp.empName));
        } else {
            setSelectedEmps([]);
        }
    }, [allChecked, emps]);

    const handleCheck = useCallback((index) => {
        setCheckedState(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
        if (checkedState[index]) {
            setSelectedEmps(prev => prev.filter((_, i) => i !== index));
        } else {
            setSelectedEmps(prev => [...prev, emps[index].empName]);
        }
    }, [checkedState, emps]);

    const uploadSelected = useCallback(async () => {
        const selectedEmps = emps.filter((emp, index) => checkedState[index]);
        if (selectedEmps.length === 0) {
            return;
        }
        const resp = await axios.post("/project/projectEmp", {
            projectNo: projectNo,
            empNoList: selectedEmps.map(emp => emp.empNo)
        });
        const newEmps = emps.filter((emp, index) => !checkedState[index]);
        setEmps(newEmps);
        setCheckedState({});
        setAllChecked(false);
    }, [checkedState, emps]);

    useEffect(() => {
        const fetchProjectInfo = async () => {
            const response = await axios.get(`/project/getProjectName/${projectNo}`);
            setProjects(response.data);
        };
        fetchProjectInfo();
    }, [projectNo]);

    useEffect(() => {
        const empList = async () => {
            const resp = await axios.get("/project/companyEmployees");
            setEmps(resp.data);
        };
        empList();
    }, [invitations]);

    useEffect(() => { }, [emps]);

    const editDocument = useCallback((target) => {
        const copy = [...documents];
        const recover = copy.map(document => {
            if (document.edit === true) {
                return { ...backup, edit: false };
            } else {
                return { ...document };
            }
        });
        setBackup({ ...target });
        const copy2 = recover.map(document => {
            if (target.documentNo === document.documentNo) {
                return {
                    ...document,
                    edit: true,
                };
            } else {
                return { ...document };
            }
        });
        setDocuments(copy2);
    }, [documents]);

    const cancelEditDocument = useCallback((target) => {
        const copy = [...documents];
        const copy2 = copy.map(document => {
            if (target.documentNo === document.documentNo) {
                return {
                    ...backup,
                    edit: false,
                };
            } else {
                return { ...document };
            }
        });
        setDocuments(copy2);
    }, [documents]);

    const changeDocument = useCallback((e, target) => {
        const copy = [...documents];
        const copy2 = copy.map(document => {
            if (target.documentNo === document.documentNo) {
                return {
                    ...document,
                    [e.target.name]: e.target.value
                };
            } else {
                return { ...document };
            }
        });
        setDocuments(copy2);
    }, [documents]);

    const saveEditDocument = useCallback(async (target) => {
        const resp = await axios.put("/document/", target);
        loadData();
    }, [documents]);


    return (
        <>
            <Jumbotron title={`${projectNo} 번 프로젝트`} style={{ backgroundColor: 'rgb(240, 174, 203)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IoPeopleSharp style={{ fontSize: '2.5em', marginRight: '8px', color: 'hotpink' }} />
                    <div style={{ padding: '10px 12px', borderRadius: '15px', backgroundColor: 'rgb(240, 211, 52)', display: 'inline-block', marginBottom: '10px', fontWeight: 'bold' ,fontSize:'15px', color: '#007bff'}}>
                          프로젝트 참여자 :


                        {selectedEmps.map((emp, index) => (
                            <span key={index} style={{ marginLeft: '10px', display: 'inline-flex', alignItems: 'center' }}>
                                {emp}
                                <FaXmark
                                    style={{ marginLeft: '5px', cursor: 'pointer', color: 'red', fontSize: '1em' }}
                                    onClick={() => removeSelectedEmp(emp)}
                                />
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    {invitations ? (
                        <>
                            <button className="btn btn-primary" style={{ backgroundColor: 'pink', border: 'none' }} onClick={uploadSelected}>
                                등록
                            </button>
                            &nbsp; &nbsp;
                            <button className="btn btn-primary" style={{ backgroundColor: 'pink', border: 'none' }} onClick={() => setInvitations(false)}>
                                취소
                            </button>
                        </>
                    ) : (
                        <button
                        className="btn btn-primary"
                        style={{
                            width:'160px',height:'40px',
                            color:'white',
                            fontSize:'16px',
                            backgroundColor: 'pink',
                            border: 'none',
                            transition: 'background-color 0.3s, color 0.3s', 
                            cursor: 'pointer', 
                            padding: '5px 10px',
                            borderRadius: '5px',
                        }}
                        onMouseEnter={(e) => { e.target.style.backgroundColor = 'hotpink'; e.target.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.target.style.backgroundColor = 'pink'; e.target.style.color = 'white'; }} // 호버하기 전에도 폰트색을 화이트로 유지
                        onClick={() => setInvitations(true)}
                    >
                        프로젝트 초대하기
                    </button>
                    
                    )}
                </div>
            </div>
     
    


            <div className="row mt-4 justify-content-center">
                <div className="col-8 col-md-9 d-flex align-items-center">
                    <input
                        style={{ border: '2.5px solid pink', boxShadow: '0 4px 6px rgba(0, 0, 0.1, 0.2)' }}
                        type="text"
                        className="form-control me-2"
                        placeholder="검색어를 입력하세요..."
                        value={searchKeyword}
                        onChange={handleSearchChange}
                    />
                    <button className="btn btn-outline-secondary" type="button" onClick={handleSearchClick}
                        style={{ backgroundColor: 'rgb(255,192,203,0.5)' }}>
                        <FaSearch />
                    </button>
                </div>
                <div className="col-md-3 text-end">
                    <button className="btn btn-primary"
                        style={{
                            width:'160px',height:'40px',
                            color:'white',
                            fontSize:'16px',
                            backgroundColor: 'pink',
                            border: 'none',
                            transition: 'background-color 0.3s, color 0.3s', 
                            cursor: 'pointer', 
                            padding: '5px 10px',
                            borderRadius: '5px',
                        }}
                        onMouseEnter={(e) => { e.target.style.backgroundColor = 'hotpink'; e.target.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.target.style.backgroundColor = 'pink'; e.target.style.color = 'white'; }}  onClick={e => openModal()}>
                        <IoMdAdd />
                        새 문서
                    </button>
                </div>
            </div>

            {invitations && (
                <div className="row mt-4">
                    <div className="col-md-3 text-end"></div>
                    <div className="row">
                        <div className="col">
                            <table className="table">
                            <thead>
    <tr>
        <th>
            <input
                type="checkbox"
                checked={allChecked}
                onChange={handleCheckAll}
            />
        </th>
        <th>이름</th>
        <th>부서</th>
        <th>직급</th>
      
    </tr>
</thead>
<tbody>
    {emps.map((emp, index) => (
        <tr key={emp.empNo}>
            <td>
                <input
                    type="checkbox"
                    checked={checkedState[index] || false}
                    onChange={() => handleCheck(index)}
                />
            </td>
            <td>{emp.empName}</td>
            <td>{emp.deptName}</td>
            <td>{emp.gradeName}</td>
          
        </tr>
    ))}
</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

{filteredDocuments.map(document => (
    <div key={document.documentNo} className="row mt-4">
        <div className="col">
            <div className="card mb-3" style={{ border: '2px solid pink', boxShadow: '0 4px 6px rgba(0, 0, 0.1, 0.2)', borderRadius: '10px' }}>
                <div className="card-body" style={{ border: '2px solid pink', boxShadow: '0 4px 6px rgba(0, 0, 0.1, 0.2)' }}>
                    <div className="card-body d-flex flex-wrap justify-content-between">
                        <div className="d-flex justify-content-center" style={{ marginBottom: "10px" }}>
                        <div className="rounded  p-2 mb-2 shadow-sm bg-danger-subtle  border-danger-subtle" style={{ width: "160px", marginRight: "20px", backgroundColor: 'rgb(255,192,203,0.5)', border: 'none' }}>프로젝트 번호: {document.projectNo}</div>
                        <div className="rounded  p-2 mb-2 shadow-sm bg-danger-subtle  border-danger-subtle" style={{ width: "130px", marginRight: "2px", backgroundColor: 'rgb(255,192,203,0.5)' }}>문서 번호: {document.documentNo}</div>
                        </div>
                        <div className={`rounded border border bg-${document.documentStatus === '요청' ? 'primary-subtle' : document.documentStatus === '진행' ? 'success-subtle' : document.documentStatus === '보류' ? 'warning' : document.documentStatus === '반려' ? 'danger' : 'success'} p-2 d-flex justify-content-center align-items-center`} style={{ width: "80px", height: "40px", color: document.documentStatus === '반려' || document.documentStatus === '승인' ? 'white' : 'initial' }}>

                            {document.edit ? (
                                <select
                                    value={document.documentStatus}
                                    name="documentStatus"
                                    onChange={(e) => changeDocument(e, document)}
                                    className="documentStatus"
                                    style={{ textAlign: 'center' }}
                                >
                                    <option value="요청">요청</option>
                                    <option value="진행">진행</option>
                                    <option value="보류">보류</option>
                                    <option value="반려">반려</option>
                                    <option value="승인">승인</option>
                                </select>
                            ) : (
                                <div style={{ textAlign: 'center' }}>{document.documentStatus}</div>
                            )}
                        </div>

                        <div className="d-flex justify-content-between">
                        <div className="d-flex align-items-center">
    <FaCalendarAlt style={{ fontSize: '1.9em', marginRight: '8px', color: '#A99AB8' }} />
    <div className="rounded p-2 mb-2 shadow-sm bg-warning-subtle">시작일: {document.edit ? <input type="date" name="documentWriteTime" value={document.documentWriteTime} onChange={(e) => changeDocument(e, document)} /> : document.documentWriteTime}</div>
</div> &nbsp;&nbsp;&nbsp;&nbsp;
<div className="d-flex align-items-center">
    <FaCalendarAlt style={{ fontSize: '1.9em', marginRight: '8px', color: '#A99AB8' }} />
    <div className="rounded p-2 mb-2 shadow-sm bg-warning-subtle">마감일: {document.edit ? <input type="date" name="documentLimitTime" value={document.documentLimitTime} onChange={(e) => changeDocument(e, document)} /> : document.documentLimitTime}</div>
</div>
                        </div>
                    </div>
                    <div style={{ borderBottom: '2px solid pink', marginBottom: '20px', marginTop:'20px' }}>
                        {document.documentTitle.toLowerCase().includes(searchKeyword.toLowerCase()) ? (
                            <span>
                                {document.documentTitle.split(new RegExp(`(${searchKeyword})`, 'ig')).map((text, index) => (
                                    text.toLowerCase() === searchKeyword.toLowerCase() ? (
                                        <span key={index} style={{ backgroundColor: 'yellow' }}>{text}</span>
                                    ) : (
                                        <span key={index}>{text}</span>
                                    )
                                ))}
                            </span>
                        ) : (
                            document.documentTitle
                        )}
                    </div>
                    <div className="card-text" style={{ border: '2px solid pink', borderRadius: '10px', marginBottom: '20px', marginTop: '20px' }}>
    {document.edit ? (
        <textarea
            value={document.documentContent}
            name="documentContent"
            onChange={(e) => changeDocument(e, document)}
            className="form-control"
            rows={7}
        />
    ) : (
        <div className="rounded border p-2 bg-white" style={{ borderRadius: '10px', height: "200px" }}>
            {document.documentContent.toLowerCase().includes(searchKeyword.toLowerCase()) ? (
                <span>
                    {document.documentContent.split(new RegExp(`(${searchKeyword})`, 'ig')).map((text, index) => (
                        text.toLowerCase() === searchKeyword.toLowerCase() ? (
                            <span key={index} style={{ backgroundColor: 'yellow', borderRadius: '10px' }}>{text}</span>
                        ) : (
                            <span key={index}>{text}</span>
                        )
                    ))}
                </span>
            ) : (
                document.documentContent
            )}
        </div>
    )}
</div>

                  {/*  */}
<div className="card-title">
    <div className="card-text d-flex justify-content-between">
        <div className="rounded  p-2 mb-2 shadow-sm bg-danger-subtle  border-danger-subtle" style={{ borderRadius: '10px', boderColor: 'pink' }}>
            결재자: {document.documentApprover ? (
                document.documentApprover.toLowerCase().includes(searchKeyword.toLowerCase()) ? (
                    <span>
                        {document.documentApprover.split(new RegExp(`(${searchKeyword})`, 'ig')).map((text, index) => (
                            text.toLowerCase() === searchKeyword.toLowerCase() ? (
                                <span key={index} style={{ backgroundColor: 'yellow', borderRadius: '10px' }}>{text}</span>
                            ) : (
                                <span key={index}>{text}</span>
                            )
                        ))}
                    </span>
                ) : (
                    document.documentApprover
                )
            ) : null}
        </div>
        <div className="rounded  p-2 mb-2 shadow-sm bg-danger-subtle  border-danger-subtle" style={{ borderRadius: '10px', borderColor: 'pink' }}>
            작성자: {document.documentWriter ? (
                document.documentWriter.toLowerCase().includes(searchKeyword.toLowerCase()) ? (
                    <span>
                        {document.documentWriter.split(new RegExp(`(${searchKeyword})`, 'ig')).map((text, index) => (
                            text.toLowerCase() === searchKeyword.toLowerCase() ? (
                                <span key={index} style={{ backgroundColor: 'yellow', borderRadius: '10px' }}>{text}</span>
                            ) : (
                                <span key={index}>{text}</span>
                            )
                        ))}
                    </span>
                ) : (
                    document.documentWriter
                )
            ) : null}
        </div>
        <div className="text-end">
            {document.edit ? (
                <>
                    <FaCheck className="text-success me-2" onClick={() => saveEditDocument(document)} style={{ fontSize: "40px" }} />
                    <TbPencilCancel className="text-danger" onClick={() => cancelEditDocument(document)} style={{ fontSize: "40px" }} />
                </>
            ) : (
                <>
                    <FaEdit className="text-warning me-2" onClick={() => editDocument(document)} style={{ fontSize: "40px" }} />
                    <FaSquareXmark className="text-danger" onClick={() => deleteDocument(document)} style={{ fontSize: "40px" }}/>
                </>
            )}
        </div>
    </div>
</div>

                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <div ref={bsModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">새문서</h1>
                            <button type="button" className="btn-close" aria-label="Close" onClick={cancelInput}></button>
                        </div>
                        <div className="modal-body">
                            <button className={`btn btn-secondary me-2`} style={{ backgroundColor: !isApprovalMode ? 'white' : 'pink' }} onClick={() => setIsApprovalMode(true)}>일반</button>
                            <button className={`btn btn-secondary me-2`} style={{ backgroundColor: isApprovalMode ? 'white' : 'pink' }} onClick={() => setIsApprovalMode(false)}>결재</button>
                            <div>
                                <p>프로젝트 번호: {input.projectNo}</p>
                            </div>
                            <div>
                                <p>사원 번호: {input.empNo}</p>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <label>시작일</label>
                                    <input type="date" name="documentWriteTime"
                                        value={input.documentWriteTime}
                                        onChange={changeInput}
                                        className="form-control" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <label>마감일</label>
                                    <input type="date" name="documentLimitTime"
                                        value={input.documentLimitTime}
                                        onChange={changeInput}
                                        className="form-control" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <label>문서 제목</label>
                                    <input type="text" name="documentTitle"
                                        value={input.documentTitle}
                                        onChange={changeInput}
                                        className="form-control" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <label>내용</label>
                                    <textarea name="documentContent"
                                        value={input.documentContent}
                                        onChange={changeInput}
                                        className="form-control"
                                        rows={5} />
                                </div>
                            </div>
                            <div className="row" style={{ display: isApprovalMode ? 'none' : 'block' }}>
                                <div className="row mt-4">
                                    <div className="col">
                                        <label htmlFor="approver">결재자 선택:</label>
                                        <select id="approver" className="form-select" value={input.documentApprover} onChange={(e) => setInput({ ...input, documentApprover: e.target.value })}>
                                            <option value="">결재자를 선택하세요</option>
                                            {emps.map((emp) => (
                                                <option key={emp.empNo} value={emp.empName}>{emp.empNo}  {emp.empName}  {emp.deptName}   {emp.gradeName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div>
                                        <input type="file" className="form-control form-control-sm"
                                            id="upload" aria-label="upload" style={{ display: 'none' }} ref={fileInputRef}
                                            onChange={handleFileChange} />
                                        <br />
                                    </div>
                                    <button onClick={handleUploadClick}>파일 선택</button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className='btn btn-success me-2' onClick={saveInput}>
                                등록
                            </button>
                            <button className='btn btn-danger' onClick={cancelInput}>
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Document;
