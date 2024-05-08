import { useCallback, useEffect, useRef, useState, startTransition } from "react";
import { loginIdState } from '../../../components/utils/RecoilData';
import { useRecoilState } from 'recoil';
import Jumbotron from "../../Jumbotron";
import { IoMdAdd } from "react-icons/io";
import axios from "../../utils/CustomAxios";
import { Modal } from "bootstrap";
import { Link, useParams } from 'react-router-dom';


function BoardBlind() {
    const { blindWriterCompany } = useParams();
    // state
    const [boardBlinds, setBoardBlinds] = useState([]);
    // const [blindEmpNo, setblindEmpNo] = useRecoilState(loginIdState); // 사용자의 blindEmpNo를 저장합니다.
    const [loginId, setLoginId] = useRecoilState(loginIdState);
    // useState 훅을 사용하여 회사 정보를 저장할 상태 추가
    const [companyInfo, setCompanyInfo] = useState({});

    const [input, setInput] = useState({
        // blindNo:"",
        blindTitle: "",
        blindContent: "",
        blindWriterNick: "",
        // blindWriterCompany:"",
        // blindWtime:"",
        // blindEtime:"",
        // blindView:"",
        blindPassword: "",
        // blindEmpNo:""
    });

    //기존 effect
    // useEffect(() => {
    //     loadData();
    // }, []);

    //변경된 effect

    useEffect(() => {
        loadData();
        //fetchCompanyInfo(); // 회사 정보 가져오기 호출
    }, [blindWriterCompany]);

    // blind_emp

    const loadData = useCallback(async () => {
        const blindEmpNo = loginId;
        const blindWriterCompany = companyInfo;
        const resp = await axios.get("/boardBlind/");
        setBoardBlinds(resp.data);
    }, [loginId, companyInfo]);

    // 회사 정보 가져오기 함수
    // const fetchCompanyInfo = useCallback(async () => {
    //     const response = await axios.get("/boardBlind/"+loginId);
    //     setCompanyInfo(response.data);
    // }, [loginId]);

    //신규 등록 화면 입력값 변경
    const changeInput = useCallback((e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

    //기존 등록
    // const saveInput = useCallback(async () => {
    //     const resp = await axios.post("/boardBlind/", input);
    //     loadData();
    //     clearInput();
    //     closeModal();
    // }, [input, loadData]);

    // saveInput 함수 내부에서 필요한 값만 서버에 전달하도록 수정
    const saveInput = useCallback(async () => {
        const resp = await axios.post("/boardBlind/", input);
        loadData();
        clearInput();
        closeModal();
    }, [input]);

    //입력값 초기화
    const clearInput = useCallback(() => {
        setInput({
            blindTitle: "",
            blindContent: "",
            blindWriterNick: "",
            blindPassword: ""
        });
    }, []);


    //ref + modal
    const bsModal = useRef();

    const esModal = useRef();
    // const asModal = useRef();
    // const openBModal = useCallback(() => {
    //     const modal = new Modal(asModal.current);
    //     modal.show();
    // }, [asModal]);

    // const closeBModal = useCallback(() => {
    //     const modal = Modal.getInstance(asModal.current);
    //     if (modal) { // 모달이 초기화되었는지 확인
    //         modal.hide();
    //     }
    // }, [asModal]);

    const changeOpenModal = useCallback(() => {
        const modal = new Modal(esModal.current);
        modal.show();
    }, [esModal]);

    const closeChangeModal = useCallback(() => {
        const modal = Modal.getInstance(bsModal.current);
        modal.hide();
    }, [esModal]);

    const openModal = useCallback(() => {
        const modal = new Modal(bsModal.current);
        modal.show();
    }, [bsModal]);

    const closeModal = useCallback(() => {
        const modal = Modal.getInstance(bsModal.current);
        modal.hide();
    }, [bsModal]);

    // 수정 버튼 클릭 이벤트 핸들러
    const editBlind = useCallback((boardBlind) => {
        setInput({
            blindTitle: boardBlind.blindTitle,
            blindContent: boardBlind.blindContent,
            blindWriterNick: boardBlind.blindWriterNick,
            blindPassword: boardBlind.blindPassword
        });
        openModal(); // 모달 열기
    }, [openModal]);

    //등록 취소
    const cancelInput = useCallback(() => {
        // const choice = window.confirm("작성을 취소하시겠습니까?");
        // if (choice === false) return;
        clearInput();
        closeModal();
        // closeBModal();
        // }, [clearInput, closeModal, closeBModal]);
    }, [clearInput, closeModal]);



    return (
        <>
            {/* 블라인드 게시판 */}
            <Jumbotron title="블라인드 게시판"></Jumbotron>

            {/* 추가 버튼 */}
            <div className="row mt-4">
                <div className="col text-end">
                    <button className="btn btn-primary"
                        onClick={openModal}>
                        <IoMdAdd />
                        글쓰기
                    </button>
                </div>
            </div>

            {/* 데이터 출력 */}
            <div className="row mt-4">
                {boardBlinds.map(boardBlind => (
                    <div className="col-12 mb-4" key={boardBlind.blindNo}>
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="card-title">{boardBlind.blindTitle}</h5>
                                <p className="card-text">작성자: {boardBlind.blindWriterNick}</p>
                                <p className="card-text">회사명: {boardBlind.blindWriterCompany}</p>
                                <p className="card-text">작성일: {boardBlind.blindWtime}</p>
                                <p className="card-text">조회수: {boardBlind.blindView}</p>
                                <p className="card-text">내용: {boardBlind.blindContent}</p>
                                {/* 추가 버튼 */}
                                <div className="row">
                                    <div className="col text-end">
                                        <button className="btn btn-primary"
                                            onClick={changeOpenModal}>
                                            <IoMdAdd />
                                            수정하기
                                        </button>
                                    </div>
                                </div>


                                <div className="row">
                                    <div className="col-md-6">
                                        {/* 내용 출력 */}
                                    </div>
                                    <div className="col-md-6">
                                        <div className="row">
                                            <div className="col-md-12">
                                                {/* 댓글 입력란 */}
                                                <input type="text" className="form-control mb-2" placeholder="댓글을 입력하세요" />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-12">
                                                {/* 댓글 출력란 */}
                                                {/* {boardBlind.comments.map(comment => (
                                        <div key={comment.commentId} className="bg-light p-2 mb-2">
                                            <p className="mb-0"><strong>{comment.commentAuthor}</strong></p>
                                            <p className="mb-0">{comment.commentContent}</p>
                                        </div>
                                    ))} */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>






            {/* Modal */}
            {boardBlinds.map(document => (
                <div ref={bsModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="staticBackdropLabel">글쓰기</h1>
                                <button type="button" className="btn-close" aria-label="Close"
                                    onClick={e => cancelInput()}></button>
                            </div>
                            <div className="modal-body">
                                {/* 등록 화면 */}
                                {/* 프로젝트 정보 표시 */}
                                <div>
                                    <p>사원 번호: {loginId}</p>
                                    {/* <p>회사: {companyInfo.companyName}</p> */}
                                    <p>회사: {boardBlinds.blindWriterCompany}</p>
                                </div>
                                <form>
                                    <div className="row">
                                        <div className="col">
                                            <label>제목</label>
                                            <input type="text" name="blindTitle"
                                                value={input.blindTitle}
                                                onChange={e => changeInput(e)}
                                                className="form-control" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col">
                                            <label>내용</label>
                                            <textarea name="blindContent"
                                                value={input.blindContent}
                                                onChange={e => changeInput(e)}
                                                className="form-control" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col">
                                            <label>작성자 닉네임</label>
                                            <input type="text" name="blindWriterNick"
                                                value={input.blindWriterNick}
                                                onChange={e => changeInput(e)}
                                                className="form-control" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col">
                                            <label>비밀번호</label>
                                            <input type="password" name="blindPassword"
                                                value={input.blindPassword}
                                                onChange={e => changeInput(e)}
                                                className="form-control" />
                                        </div>
                                    </div>
                                </form>
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


            {/* Modal */}
            {boardBlinds.map(document => (
                <div ref={esModal} className="modal fade" id="editModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="staticBackdropLabel">수정하기</h1>
                                <button type="button" className="btn-close" aria-label="Close"
                                    onClick={e => cancelInput()}></button>
                            </div>
                            <div className="modal-body">
                                {/* 수정 화면 */}
                                {/* 프로젝트 정보 표시 */}
                                <div>
                                    <p>사원 번호: {loginId}</p>
                                    {/* <p>회사: {companyInfo.companyName}</p> */}
                                    <p>회사: {boardBlinds.blindWriterCompany}</p>
                                </div>
                                <form>
                                    <div className="row">
                                        <div className="col">
                                            <label>제목</label>
                                            <input type="text" name="blindTitle"
                                                value={input.blindTitle}
                                                onChange={e => changeInput(e)}
                                                className="form-control" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col">
                                            <label>내용</label>
                                            <textarea name="blindContent"
                                                value={input.blindContent}
                                                onChange={e => changeInput(e)}
                                                className="form-control" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col">
                                            <label>작성자 닉네임</label>
                                            <input type="text" name="blindWriterNick"
                                                value={input.blindWriterNick}
                                                onChange={e => changeInput(e)}
                                                className="form-control" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col">
                                            <label>비밀번호</label>
                                            <input type="password" name="blindPassword"
                                                value={input.blindPassword}
                                                onChange={e => changeInput(e)}
                                                className="form-control" />
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="modal-footer">
                                <button className='btn btn-success me-2' onClick={e => saveInput()}>
                                    등록
                                </button>
                                <button className='btn btn-danger' onClick={e => closeChangeModal()}>
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

export default BoardBlind;