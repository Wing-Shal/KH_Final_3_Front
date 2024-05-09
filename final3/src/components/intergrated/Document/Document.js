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



const Document = () => {
    const { projectNo } = useParams();



    //state
    // const documentName = 'Your document Name'; // 예시로 고정값 사용, 실제로는 상태나 변수로 가져와야 함
    const [loginId, setLoginId] = useRecoilState(loginIdState);
    const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);
    const [documents, setDocuments] = useState([]);
    const [project, setProjects] = useState([]);
    // 검색창
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const [isApprovalMode, setIsApprovalMode] = useState(false); // 결재 모드 여부 상태


    const [projectName, setProjectName] = useState(""); // projectName 상태 추가

    const [input, setInput] = useState({
        documentTitle: "",
        documentContent: "",
        documentWriteTime: "",
        documentLimitTime: "",
        projectNo: projectNo,
        documentApprover: "",
    });

    const [backup, setBackup] = useState(null);//수정 시 복원을 위한 백업

    // //통합 검색  
    // performSearch 함수 정의
    const performSearch = useCallback(async () => {
        // 검색을 수행하는 로직을 구현합니다. searchKeyword 상태를 사용하여 검색합니다.
        // 검색 결과를 searchResults 상태로 업데이트합니다.
    }, [searchKeyword]);

    // 검색 아이콘 클릭 핸들러 함수 정의
    const handleSearchClick = useCallback(() => {
        performSearch(); // 검색 아이콘이 클릭될 때 performSearch 함수 호출
    }, [performSearch]);

    // 검색 입력 변경 핸들러 함수 정의
    const handleSearchChange = useCallback((e) => {
        setSearchKeyword(e.target.value); // 입력이 변경될 때 searchKeyword 상태를 업데이트합니다.
    }, []);

    // 문서 필터링 함수 정의
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



    // 검색 키워드에 따라 문서 필터링
    const filteredDocuments = filterDocuments();



    //effect
    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const fetchProjectInfo = async () => {
            const response = await axios.get(`/project/${projectNo}`); // 서버에서 프로젝트 정보 가져오기
            setProjectName(response.data.projectName);
        };// 가져온 프로젝트 정보 중에서 프로젝트 이름 설정
        fetchProjectInfo();
    }, [projectNo]);

    const loadData = useCallback(async () => {
        let resp;

        resp = await axios.get("/document/" + projectNo);
        console.log(resp)
        setDocuments(resp.data);
    }, [projectNo, loginId]);

    //삭제
    const deleteDocument = useCallback(async (target) => {
        const choice = window.confirm("정말 삭제하시겠습니까?");
        if (choice === false) return;

        //target에 있는 내용을 서버에 지워달라고 요청하고 목록을 다시 불러온다
        const resp = await axios.delete("/document/" + target.documentNo);
        loadData();
    }, [documents]);

    //신규 등록 화면 입력값 변경
    const changeInput = useCallback((e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

    //등록
    const saveInput = useCallback(async () => {
        const resp = await axios.post("/document/", input);
        loadData();
        clearInput();
        closeModal();
    }, [input]);

    //등록 취소
    const cancelInput = useCallback(() => {
        const choice = window.confirm("작성을 취소하시겠습니까?");
        if (choice === false) return;
        clearInput();
        closeModal();
    }, [input]);

    //입력값 초기화
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

    useEffect(() => {
        const fetchProjectInfo = async () => {
            const response = await axios.get(`/project/getProjectName/${projectNo}`); // 서버에서 프로젝트 정보 가져오기
            setProjects(response.data); // 가져온 프로젝트 정보 설정

        };

        fetchProjectInfo(); // 프로젝트 정보 가져오는 함수 호출
    }, [projectNo]); // projectNo가 변경될 때마다 useEffect가 실행됨


    //수정
    const editDocument = useCallback((target) => {
        //복제
        const copy = [...documents];


        const recover = copy.map(document => {
            if (document.edit === true) {//수정중인 항목을 발견하면
                return { ...backup, edit: false };//백업으로 갱신 + 수정모드 취소
            }
            else {
                return { ...document };//그대로
            }
        });
        setBackup({ ...target }); //백업

        const copy2 = recover.map(document => {
            if (target.documentNo === document.documentNo) {//원하는 정보일 경우
                return {
                    ...document,//나머지 정보는 유지하되
                    edit: true,//edit 관련된 처리를 추가하여 반환
                };
            }
            else {//원하는 정보가 아닐 경우
                return { ...document };//데이터를 그대로 복제하여 반환
            }
        });



        setDocuments(copy2);
    }, [documents]);

    const cancelEditDocument = useCallback((target) => {
        //1. 복제한다
        const copy = [...documents];

        const copy2 = copy.map(document => {

            if (target.documentNo === document.documentNo) {//원하는 정보일 경우
                return {
                    ...backup,//백업 정보를 전달
                    edit: false,//edit 관련된 처리를 추가하여 반환
                };
            }
            else {//원하는 정보가 아닐 경우
                return { ...document };//데이터를 그대로 복제하여 반환
            }
        });

        //덮어씌우기
        setDocuments(copy2);
    }, [documents]);

    const changeDocument = useCallback((e, target) => {

        const copy = [...documents];
        const copy2 = copy.map(document => {
            if (target.documentNo === document.documentNo) {
                return {
                    ...document,//나머지 정보는 유지
                    [e.target.name]: e.target.value//단, 입력항목만 교체
                };
            }
            else {
                return { ...document };//현상유지
            }
        });
        setDocuments(copy2);
    }, [documents]);

    //수정된 결과를 저장 + 목록갱신 + 수정모드 해제
    const saveEditDocument = useCallback(async (target) => {
        //서버에 target을 전달하여 수정 처리
        const resp = await axios.put("/document/", target);
        //목록 갱신
        loadData();
    }, [documents]);

    // const handleFileChange = (e) => {
    //     const file = e.target.files[0];
    //     // 파일 처리 로직 추가
    // };

    // 일반버튼 클릭시 참조자,결재자 숨기기 기능


    //ref + modal
    const bsModal = useRef();
    const openModal = useCallback(() => {
        const modal = new Modal(bsModal.current);
        console.log(modal);
        setInput({
            ...input,
            empNo: loginId,
            // projectName //모달 열릴때 플젝이름보이기
        });
        modal.show();
    }, [bsModal, loginId]);
    // }, [bsModal, loginId, projectName]);

    const closeModal = useCallback(() => {
        const modal = Modal.getInstance(bsModal.current);
        modal.hide();
    }, [bsModal]);




    {/* 검색창 */ }

    //view
    return (
        <>
            {/* 제목 */}
            <Jumbotron title={`${projectNo} 번 프로젝트`} style={{ backgroundColor: 'rgb(255, 192, 203)' }} />
            <div className="row mt-4 justify-content-center"> {/* justify-content-center를 추가하여 가로 가운데 정렬 */}
                <div className="col-8 col-md-9 d-flex align-items-center"> {/* col-md-6으로 변경, d-flex와 align-items-center를 추가하여 내용을 세로 중앙 정렬 */}
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
                <div className="col-md-3 text-end"> {/* 새 문서 버튼을 새로운 col-md-6으로 배치 */}
                    <button className="btn btn-primary" style={{ backgroundColor: 'pink', border: 'none' }} onClick={e => openModal()}>
                        <IoMdAdd />
                        새 문서
                    </button>
                </div>
            </div>






            {/* 문서목록... */}
            {filteredDocuments.map(document => (
                <div key={document.documentNo} className="row mt-4">
                    <div className="col">
                        <div className="card mb-3" style={{ border: '2px solid pink', boxShadow: '0 4px 6px rgba(0, 0, 0.1, 0.2)' }}>
                            <div className="card-body" style={{ border: '2px solid pink', boxShadow: '0 4px 6px rgba(0, 0, 0.1, 0.2)' }}>
                                <div className="card-body d-flex flex-wrap justify-content-between">
                                    {/* 플젝 번호, 문서 번호, 상태 */}
                                    <div className="d-flex justify-content-between" style={{ marginBottom: "10px" }} >
                                        <div className="rounded border p-2 shadow-sm" style={{ width: "150px", marginRight: "10px", backgroundColor: 'rgb(255,192,203,0.5)', border: 'none' }}>플젝 번호: {document.projectNo}</div>
                                        <div className="rounded border p-2 shadow-sm" style={{ width: "150px", marginRight: "10px", backgroundColor: 'rgb(255,192,203,0.5)' }}>문서 번호: {document.documentNo}</div>
                                        <div className="rounded border p-2 shadow-sm bg-light" style={{ width: "150px" }}>상태: {document.documentStatus}</div>
                                    </div>
                                    {/* 시작일, 마감일 */}
                                    <div className="d-flex justify-content-between">
                                        <div className="rounded border p-2 shadow-sm bg-light" style={{ width: "250px", marginRight: "10px", backgroundColor: 'rgb(255,192,203,0.5)' }}>프로젝트 이름: {document.projectName}</div>
                                        <div className="rounded border p-2 mb-2 shadow-sm bg-light">시작일: {document.edit ? <input type="date" name="documentWriteTime" value={document.documentWriteTime} onChange={(e) => changeDocument(e, document)} /> : document.documentWriteTime}</div>
                                        <div className="rounded border p-2 mb-2 shadow-sm bg-light">마감일: {document.edit ? <input type="date" name="documentLimitTime" value={document.documentLimitTime} onChange={(e) => changeDocument(e, document)} /> : document.documentLimitTime}</div>
                                    </div>
                                </div>
                                <div className="card-title" >
                                    <div className="card-text" >
                                        {/* 제목 */}
                                        {document.edit ? (
                                            <input
                                                type="text"
                                                value={document.documentTitle}
                                                name="documentTitle"
                                                onChange={(e) => changeDocument(e, document)}
                                                className="form-control"
                                            />
                                        ) : (
                                            <div className="rounded border p-2 mb-2 shadow-sm bg-light">
                                                {/* 검색어 강조 */}
                                                제목: {document.documentTitle.toLowerCase().includes(searchKeyword.toLowerCase()) ? (
                                                    <span>
                                                        {document.documentTitle.split(new RegExp(`(${searchKeyword})`, 'ig')).map((text, index) => (
                                                            text.toLowerCase() === searchKeyword.toLowerCase() ? (
                                                                <span key={index} style={{ backgroundColor: 'pink' }}>{text}</span>
                                                            ) : (
                                                                <span key={index}>{text}</span>
                                                            )
                                                        ))}
                                                    </span>
                                                ) : (
                                                    document.documentTitle
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card-text">
                                    {/* 내용 */}
                                    {document.edit ? (
                                        <textarea
                                            value={document.documentContent}
                                            name="documentContent"
                                            onChange={(e) => changeDocument(e, document)}
                                            className="form-control"
                                            rows={7}
                                        />
                                    ) : (
                                        <div className="rounded border p-2 mb-2 shadow-sm bg-light" style={{ height: "200px" }}>
                                            {/* 검색어 강조 */}
                                            {document.documentContent.toLowerCase().includes(searchKeyword.toLowerCase()) ? (
                                                <span>
                                                    {document.documentContent.split(new RegExp(`(${searchKeyword})`, 'ig')).map((text, index) => (
                                                        text.toLowerCase() === searchKeyword.toLowerCase() ? (
                                                            <span key={index} style={{ backgroundColor: 'pink' }}>{text}</span>
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
                                <div className="card-title">
                                    <div className="card-text d-flex justify-content-between">
                                        {/* 참조자, 결재자, 작성자 */}

                                        <div className="rounded border p-2 mb-2 shadow-sm bg-light">
                                            {/* 참조자 */}
                                            참조자: {document.documentApprover ? (
                                                document.documentApprover.toLowerCase().includes(searchKeyword.toLowerCase()) ? (
                                                    <span>
                                                        {document.documentApprover.split(new RegExp(`(${searchKeyword})`, 'ig')).map((text, index) => (
                                                            text.toLowerCase() === searchKeyword.toLowerCase() ? (
                                                                <span key={index} style={{ backgroundColor: 'pink' }}>{text}</span>
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
                                        <div className="rounded border p-2 mb-2 shadow-sm bg-light">
                                            {/* 결재자 */}

                                            결재자: {document.documentApprover ? (
                                                document.documentApprover.toLowerCase().includes(searchKeyword.toLowerCase()) ? (
                                                    <span>
                                                        {document.documentApprover.split(new RegExp(`(${searchKeyword})`, 'ig')).map((text, index) => (
                                                            text.toLowerCase() === searchKeyword.toLowerCase() ? (
                                                                <span key={index} style={{ backgroundColor: 'pink' }}>{text}</span>
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

                                        <div className="rounded border p-2 mb-2 shadow-sm bg-light">
                                            {/* 작성자 */}
                                            작성자: {document.documentWriter ? (
                                                document.documentWriter.toLowerCase().includes(searchKeyword.toLowerCase()) ? (
                                                    <span>
                                                        {document.documentWriter.split(new RegExp(`(${searchKeyword})`, 'ig')).map((text, index) => (
                                                            text.toLowerCase() === searchKeyword.toLowerCase() ? (
                                                                <span key={index} style={{ backgroundColor: 'pink' }}>{text}</span>
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
                                            {/* 편집 및 삭제 버튼 */}
                                            {document.edit ? (
                                                <>
                                                    <FaCheck className="text-success me-2" onClick={() => saveEditDocument(document)} style={{ fontSize: "40px" }} />
                                                    <TbPencilCancel className="text-danger" onClick={() => cancelEditDocument(document)} style={{ fontSize: "40px" }} />
                                                </>
                                            ) : (
                                                <>
                                                    <FaEdit className="text-warning me-2" onClick={() => editDocument(document)} style={{ fontSize: "40px" }} />
                                                    <FaSquareXmark className="text-danger" onClick={() => deleteDocument(document)} style={{ fontSize: "40px" }} />
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





            {/* Modal */}
            <div ref={bsModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">내문서</h1>
                            <button type="button" className="btn-close" aria-label="Close"
                                onClick={e => cancelInput()}></button>
                        </div>
                        <div className="modal-body">
                            {/* 등록 화면 */}
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
                                        onChange={e => changeInput(e)}
                                        className="form-control" />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col">
                                    <label>마감일</label>
                                    <input type="date" name="documentLimitTime"
                                        value={input.documentLimitTime}
                                        onChange={e => changeInput(e)}
                                        className="form-control" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <label>문서 제목</label>
                                    <input type="text" name="documentTitle"
                                        value={input.documentTitle}
                                        onChange={e => changeInput(e)}
                                        className="form-control" />
                                </div>
                            </div>



                            <div className="row">
                                <div className="col">
                                    <label>내용</label>
                                    <textarea name="documentContent"
                                        value={input.documentContent}
                                        onChange={e => changeInput(e)}
                                        className="form-control"
                                        rows={5} />
                                </div>
                            </div>

                            <div className="row" style={{ display: isApprovalMode ? 'none' : 'block' }}>
                                <div className="col">
                                    <label>참조자</label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            name="documentApprover"
                                            value={input.documentApprover}
                                            onChange={e => changeInput(e)}
                                            className="form-control"
                                        /><button className="btn btn-outline-secondary" type="button" onClick={handleSearchClick}
                                            style={{ backgroundColor: 'rgb(255,192,203,0.5)' }}>
                                            <FaSearch />
                                        </button>

                                    </div>
                                </div>
                            </div>
                            <div className="row" style={{ display: isApprovalMode ? 'none' : 'block' }}>

                                <div className="col">
                                    <label>결재자</label>
                                    <div className="input-group">
                                        <input
                                            type="search"
                                            name="documentApprover"
                                            value={input.documentApprover}
                                            onChange={e => changeInput(e)}
                                            className="form-control"
                                        /><button className="btn btn-outline-secondary" type="button" onClick={handleSearchClick}
                                            style={{ backgroundColor: 'rgb(255,192,203,0.5)' }}>
                                            <FaSearch /></button>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <label>첨부파일</label>
                                    <input type="file" name="attachment"
                                        value={input.documentFile}
                                        // onChange={handleFileChange}
                                        className="form-control" />

                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className='btn btn-success me-2' onClick={e => saveInput()}>
                                등록
                            </button>
                            <button className='btn btn-danger' onClick={e => cancelInput()}>
                                취소
                            </button>
                        </div>
                    </div>
                </div>



            </div>
        </>
    );
};

export default Document;
