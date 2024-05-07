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
// import { TbMoodSearch } from "react-icons/tb";
// import { FaSearch } from "react-icons/fa";


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
    const [input, setInput] = useState({
        projectNo: "",
        projectName: "",
        empNo: "",
        documentTitle: "",
        documentContent: "",
        documentWriteTime: "",
        documentLimitTime: "",
    });

    const [backup, setBackup] = useState(null);//수정 시 복원을 위한 백업

    // //통합 검색  
    // const SearchChange = useCallback((e) => {
    //     setSearchKeyword(e.target.value);
    // }, []);

    // //검색실행 함수
    // const performSearch = useCallback(async () => {

    //     //검색어 서버로 보내기
    //     const response = await axios.get(`/document/search?keyword=${searchKeyword}`);
    //     setSearchResults(response.data);
    // }, [searchKeyword]);

    // //검색어가 변결될 때마다 검색 실행
    // useEffect(() => {
    //     performSearch();

    // }, [searchKeyword, performSearch]);

    //effect
    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(async () => {
        let resp;      
            //const projectNo = document.projectNo;
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
            projectName: "",
            empNo: "",
            documentTitle: "",
            documentContent: "",
            documentWriteTime: "",
            documentLimitTime: "",
        });
    }, [input]);


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





    //ref + modal
    const bsModal = useRef();
    const openModal = useCallback(() => {
        const modal = new Modal(bsModal.current);
        setInput({
            ...input,
            empNo: loginId,
        });


        modal.show();
    }, [bsModal]);
    const closeModal = useCallback(() => {
        const modal = Modal.getInstance(bsModal.current);
        modal.hide();
    }, [bsModal]);

    {/* 검색창 */ }

    //view
    return (
        <>

            {/* 제목 */}
            <Jumbotron title="내 문서" />
              {/* 검색창
              <div className="row mt-4">
                <div className="col">
                    <div className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="검색어를 입력하세요.."
                            value={searchKeyword}
                            onChange={SearchChange} // 검색어 입력 핸들러 연결
                        />
                        <button className="btn btn-outline-secondary" type="button" onClick={performSearch}>
                            검색
                        </button>
                    </div>
                </div>
            </div> */}

            {/* 추가 버튼 */}
            <div className="row mt-4">
                <div className="col text-end">
                    <button className="btn btn-primary"
                        onClick={e => openModal()}>
                        <IoMdAdd />
                        새 문서

                        


                    </button>
                </div>
            </div>


            {/* 문서목록... */}
            {documents.map(document => (
                <div key={document.documentNo} className="row mt-4">
                    <div className="col">
                        <div className="card mb-3">
                            <div className="card-body">
                                <div className="card-body d-flex flex-wrap justify-content-between">
                                    <div className="card-text">
                                        {/* 플젝 번호, 문서 번호, 상태 */}
                                        <div className="d-flex justify-content-between" style={{ marginBottom: "10px" }}>
                                            <div className="rounded border p-2 shadow-sm bg-light" style={{ width: "150px", marginRight: "10px" }}>플젝 번호: {document.projectNo}</div>
                                            <div className="rounded border p-2 shadow-sm bg-light" style={{ width: "150px", marginRight: "10px" }}>문서 번호: {document.documentNo}</div>
                                            <div className="rounded border p-2 shadow-sm bg-light" style={{ width: "150px" }}>상태: {document.documentStatus}</div>
                                        </div>
                                        {/* 시작일, 마감일 */}
                                        <div className="d-flex justify-content-between">
                                            <div className="rounded border p-2 mb-2 shadow-sm bg-light">시작일: {document.edit ? <input type="date" name="documentWriteTime" value={document.documentWriteTime} onChange={(e) => changeDocument(e, document)} /> : document.documentWriteTime}</div>
                                            <div className="rounded border p-2 mb-2 shadow-sm bg-light">마감일: {document.edit ? <input type="date" name="documentLimitTime" value={document.documentLimitTime} onChange={(e) => changeDocument(e, document)} /> : document.documentLimitTime}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-title">
                                    <div className="card-text">
                                        {/* 수정 버튼 클릭 여부에 따라서 제목이 input 또는 그냥 텍스트로 표시됨 */}
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
                                                제목: {document.documentTitle}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card-text">
                                    {/* 수정 버튼 클릭 여부에 따라서 내용이 textarea 또는 그냥 텍스트로 표시됨 */}
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
                                            내용: {document.documentContent}
                                        </div>
                                    )}
                                </div>

                                <div className="card-title">
                                    <div className="card-text d-flex justify-content-between">
                                        {/* 수정 버튼 클릭 여부에 따라서 제목이 input 또는 그냥 텍스트로 표시됨 */}
                                        {document.edit ? (
                                            <input
                                                type="text"
                                                value={document.documentApprover}
                                                name="documentApprover"
                                                onChange={(e) => changeDocument(e, document)}
                                                className="form-control"
                                            />
                                        ) : (
                                            <div className="rounded border p-2 mb-2 shadow-sm bg-light text-end">
                                                참조자: {document.documentApprover}
                                            </div>
                                        )}

                                        {/* 수정 버튼 클릭 여부에 따라서 제목이 input 또는 그냥 텍스트로 표시됨 */}
                                        {document.edit ? (
                                            <input
                                                type="text"
                                                value={document.documentApprover}
                                                name="documentApprover"
                                                onChange={(e) => changeDocument(e, document)}
                                                className="form-control"
                                            />
                                        ) : (
                                            <div className="rounded border p-2 mb-2 shadow-sm bg-light text-end">
                                                결재자: {document.documentApprover}
                                            </div>
                                        )}

                                        <div className="rounded border p-2 mb-2 shadow-sm bg-light text-end">작성자: {document.documentWriter}</div>
                                    </div>

                                    <div className="card-text">
                                        {/* 수정 버튼 클릭 여부에 따라서 제목이 input 또는 그냥 텍스트로 표시됨 */}
                                        {document.edit ? (
                                            <input
                                                type="text"
                                                value={document.dComment}
                                                name="dComment"
                                                onChange={(e) => changeDocument(e, document)}
                                                className="form-control"
                                                style={{ height: "50px" }}

                                            />
                                        ) : (
                                            <div className="rounded border p-2 mb-2 shadow-sm bg-light" style={{ height: "50px" }}>
                                                {document.dComment}
                                            </div>
                                        )}
                                    </div>

                                </div>

                                {/* <div className="text-end">
                                    {document.edit ? (
                                        <>
                                            <button className="text-success me-2" onClick={() => saveEditDocument(document)}>
                                                comment</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="text-warning me-2" onClick={() => editDocument(document)} >
                                                comment</button>
                                        </>
                                    )}
                                </div> */}
                                {/* 편집 및 삭제 버튼 */}
                                <div className="text-end">
                                    {document.edit ? (
                                        <>
                                            <FaCheck className="text-success me-2" onClick={() => saveEditDocument(document)} />
                                            <TbPencilCancel className="text-danger" onClick={() => cancelEditDocument(document)} />
                                        </>
                                    ) : (
                                        <>
                                            <FaEdit className="text-warning me-2" onClick={() => editDocument(document)} />
                                            <FaSquareXmark className="text-danger" onClick={() => deleteDocument(document)} />

                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}





            {/* Modal */}
            {documents.map(document => (
                <div ref={bsModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="staticBackdropLabel">내문서</h1>
                                <button type="button" className="btn-close" aria-label="Close"
                                    onClick={e => cancelInput()}></button>
                            </div>
                            <div className="modal-body" >

                                {/* 등록 화면 */}
                                {/* 프로젝트 정보 표시 */}
                                <button className='btn btn-success me-2'>
                                    일반
                                </button>
                                <button className='btn btn-success me-2'>
                                    결재
                                </button>
                                <div>
                                    <p>플젝 번호: {document.projectNo}</p>
                                    <p>플젝 이름: {document.projectName}</p>
                                </div>
                                <div>
                                    <p>사원 번호: {input.empNo}</p>
                                </div>
                                {/* <div>
                                <p>회사이름: {input.projectName}</p>
                            </div>
                            <div> 
                               <p>회사번호: {input.projectNo}</p>
                            </div> */}

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

                                {/* <div className="row"> */}

                                {/* <div className="col">
    <label>참조자</label>
    <div className="input-group">
        <input
            type="text"
            name="documentApprover"
            value={input.documentApprover}
            onChange={e => changeInput(e)}
            className="form-control"
        />
        <span className="input-group-text">
            <TbMoodSearch />
        </span>
    </div>
</div>
</div>
<div className="row">
                           
<div className="col">
    <label>결재자</label>
    <div className="input-group">
        <input
            type="search"
            name="documentApprover"
            value={input.documentApprover}
            onChange={e => changeInput(e)}
            className="form-control"
        />
        <span className="input-group-text">
            <TbMoodSearch />
        </span>
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
                            </div> */}
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
            ))}
        </>
    );
};

export default Document;