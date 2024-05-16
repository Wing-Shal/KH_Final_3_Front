import { useCallback, useEffect, useRef, useState, startTransition } from "react";
import { loginIdState } from '../../../components/utils/RecoilData';
import { useRecoilState } from 'recoil';
import Jumbotron from "../../Jumbotron";
import { IoMdAdd } from "react-icons/io";
import axios from "../../utils/CustomAxios";
import { Modal } from "bootstrap";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link, useParams } from 'react-router-dom';
import { FaEdit, FaTrash } from "react-icons/fa";
import { IoMdHammer } from "react-icons/io";
import { FaXmark } from "react-icons/fa6";
import { FaSearch } from 'react-icons/fa';



function BoardBlind() {
    const { blindWriterCompany } = useParams();
    // state
    const [boardBlinds, setBoardBlinds] = useState([]);
    // const [blindEmpNo, setblindEmpNo] = useRecoilState(loginIdState); // 사용자의 blindEmpNo를 저장합니다.
    const [loginId, setLoginId] = useRecoilState(loginIdState);
    // useState 훅을 사용하여 회사 정보를 저장할 상태 추가
    const [companyInfo, setCompanyInfo] = useState({});

    const [backup, setBackup] = useState(null);//수정 시 복원을 위한 백업

    // 검색창
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState([]);

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
    const filterBoardBlinds = useCallback(() => {
        return boardBlinds.filter(boardBlind =>
            (boardBlind.blindNo && boardBlind.blindNo.toString().toLowerCase().includes(searchKeyword.toLowerCase())) ||
            (boardBlind.blindTitle && typeof boardBlind.blindTitle === 'string' && boardBlind.blindTitle.toLowerCase().includes(searchKeyword.toLowerCase())) ||
            (boardBlind.blindContent && typeof boardBlind.blindContent === 'string' && boardBlind.blindContent.toLowerCase().includes(searchKeyword.toLowerCase())) ||
            (boardBlind.blindWriterNick && typeof boardBlind.blindWriterNick === 'string' && boardBlind.blindWriterNick.toLowerCase().includes(searchKeyword.toLowerCase()))
            // Add other attributes for search here
        );
    }, [boardBlinds, searchKeyword]);

    // 검색어에 따라 게시글 필터링
    useEffect(() => {
        const filteredBoardBlinds = boardBlinds.filter(boardBlind =>
            boardBlind.blindTitle.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            boardBlind.blindContent.toLowerCase().includes(searchKeyword.toLowerCase()) //||
            // boardBlind.blindWriterNick.toLowerCase().includes(searchKeyword.toLowerCase())
        );
        setSearchResults(filteredBoardBlinds);
    }, [boardBlinds, searchKeyword]);



    // 검색 키워드에 따라 문서 필터링
    const filteredBoardBlinds = filterBoardBlinds();

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

    //댓글 state
    const [replyBlinds, setReplyBlinds] = useState([]);
    const [replyBlindInput, setReplyBlindInput] = useState({
        replyBlindContent: "", //댓글 내용
        replyBlindNick: "", //댓글 작성자
        blindNo: "" //게시글번호
    });



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

    //신규 등록 화면 입력값 변경
    const changeInput = useCallback((e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

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

    // 저장 버튼 클릭 이벤트 핸들러
    const saveEdit = useCallback(async (boardBlind) => {
        // 수정된 내용을 서버에 저장
        const resp = await axios.put(`/boardBlind/${boardBlind.blindNo}`, input);
        loadData(); // 데이터 다시 불러오기
        clearInput(); // 입력 폼 초기화
    }, [input]);

    const cancelEdit = useCallback(() => {
        clearInput(); // 입력 폼 초기화
    }, []);



    //ref + modal
    const bsModal = useRef();

    const openModal = useCallback(() => {
        const modal = new Modal(bsModal.current);
        modal.show();
    }, [bsModal]);

    const closeModal = useCallback(() => {
        const modal = Modal.getInstance(bsModal.current);
        modal.hide();
    }, [bsModal]);

    //등록 취소
    const cancelInput = useCallback(() => {
        // const choice = window.confirm("작성을 취소하시겠습니까?");
        // if (choice === false) return;
        clearInput();
        closeModal();
        // closeBModal();
        // }, [clearInput, closeModal, closeBModal]);
    }, [clearInput, closeModal]);

    //해당 줄을 수정상태(edit===true)로 만드는 함수
    //target은 수정을 누른 줄의 학생 정보
    const editBoardBlind = useCallback((target) => {
        //1. boardBlinds를 복제한다
        const copy = [...boardBlinds];

        //(+추가) 이미 수정중인 항목이 있을 수 있으므로 해당 항목은 취소 처리가 필요
        const recover = copy.map(boardBlind => {
            if (boardBlind.edit === true) {//수정중인 항목을 발견하면
                return { ...backup, edit: false };//백업으로 갱신 + 수정모드 취소
            }
            else {
                return { ...boardBlind };//그대로
            }
        });

        //(+추가) 나중을 위해 target를 백업해둔다 (target은 수정버튼 누른항목)
        setBackup({ ...target });

        //2. recover를 고친다
        //- recover 중에서 target과 동일한 정보를 가진 항목을 찾아서 edit : true로 만든다
        //- 배열을 변환시켜야 하므로 map 함수를 사용한다
        const copy2 = recover.map(boardBlind => {
            //target : 수정버튼을 누른 학생정보, boardBlind : 현재 회차의 학생정보
            if (target.blindNo === boardBlind.blindNo) {//원하는 정보일 경우
                return {
                    ...boardBlind,//나머지 정보는 유지하되
                    edit: true,//edit 관련된 처리를 추가하여 반환
                };
            }
            else {//원하는 정보가 아닐 경우
                return { ...boardBlind };//데이터를 그대로 복제하여 반환
            }
        });


        //3. copy2를 boardBlinds에 덮어쓰기한다
        setBoardBlinds(copy2);
    }, [boardBlinds]);

    const cancelEditBoardBlind = useCallback((target) => {
        //1. boardBlinds를 복제한다
        const copy = [...boardBlinds];

        //2. copy를 고친다
        //- copy 중에서 target과 동일한 정보를 가진 항목을 찾아서 edit : true로 만든다
        //- 배열을 변환시켜야 하므로 map 함수를 사용한다
        const copy2 = copy.map(boardBlind => {
            //target : 수정버튼을 누른 학생정보, boardBlind : 현재 회차의 학생정보
            if (target.blindNo === boardBlind.blindNo) {//원하는 정보일 경우
                return {
                    ...backup,//백업 정보를 전달
                    edit: false,//edit 관련된 처리를 추가하여 반환
                };
            }
            else {//원하는 정보가 아닐 경우
                return { ...boardBlind };//데이터를 그대로 복제하여 반환
            }
        });

        //3. copy2를 boardBlinds에 덮어쓰기한다
        setBoardBlinds(copy2);
    }, [boardBlinds]);

    //수정 입력창에서 입력이 발생할 경우 실행할 함수
    //- boardBlinds 중에서 대상을 찾아 해당 필드를 교체하여 재설정
    //- e는 입력이 발생한 창의 이벤트 정보
    //- target은 입력이 발생한 창이 있는 줄의 학생정보
    const changeBoardBlinds = useCallback((e, target) => {
        const copy = [...boardBlinds];
        const copy2 = copy.map(boardBlind => {
            if (target.blindNo === boardBlind.blindNo) {//이벤트 발생한 학생이라면
                return {
                    ...boardBlind,//나머지 정보는 유지
                    [e.target.name]: e.target.value//단, 입력항목만 교체
                };
            }
            else {//다른 학생이라면
                return { ...boardBlind };//현상유지
            }
        });
        setBoardBlinds(copy2);
    }, [boardBlinds]);

    //수정된 결과를 저장 + 목록갱신 + 수정모드 해제
    const saveEditboardBlind = useCallback(async (target) => {
        //서버에 target을 전달하여 수정 처리
        const resp = await axios.patch("/boardBlind/", target);
        //목록 갱신
        loadData();
    }, [boardBlinds]);


    const deleteBoardBlind = useCallback(async (target) => {
        const choice = window.confirm("정말 삭제하시겠습니까?");
        if (choice === false) return;

        //target에 있는 내용을 서버에 지워달라고 요청하고 목록을 다시 불러온다
        const resp = await axios.delete("/boardBlind/" + target.blindNo);
        loadData();
    }, [boardBlinds]);


    //댓글

    useEffect(() => {
        replyLoadData();
    }, []);

    const replyLoadData = useCallback(async () => {
        const blindEmpNo = loginId;
        const blindWriterCompany = companyInfo;
        const resp = await axios.get("/replyBlind/");
        setReplyBlinds(resp.data);
    }, [loginId, companyInfo]);

    //신규 등록 화면 입력값 변경
    const changeReply = useCallback((e) => {
        setReplyBlindInput({
            ...replyBlindInput,
            [e.target.name]: e.target.value
        });
    }, [replyBlindInput]);
    //등록
    const saveReplyInput = useCallback(async (blindNo) => {
        // 입력값에 대한 검사 코드가 필요하다면 이 자리에 추가하고 차단!
        // if(검사 결과 이상한 데이터가 입력되어 있다면) return;

        // 댓글 입력 데이터에 게시글 번호를 추가합니다.
        const replyData = {
            ...replyBlindInput,
            blindNo: blindNo
        };

        // 서버로 전송하여 댓글을 등록한 뒤 목록을 갱신합니다.
        const resp = await axios.post("/replyBlind/", replyData);
        replyLoadData();
        clearReplyInput();
        // closeModal(); // 필요에 따라 모달을 닫는 코드를 주석 해제할 수 있습니다.
    }, [replyBlindInput, replyLoadData]);

    //등록 취소
    const cancelReplyInput = useCallback(() => {
        const choice = window.confirm("작성을 취소하시겠습니까?");
        if (choice === false) return;
        clearReplyInput();
        // closeReplyModal();
    }, [input]);
    //입력값 초기화
    const clearReplyInput = useCallback(() => {
        setReplyBlindInput({
            replyBlindNick: "", replyBlindContent: ""
        });
    }, [replyBlindInput]);

    const deleteReplyBlind = useCallback(async (target) => {
        const choice = window.confirm("정말 삭제하시겠습니까?");
        if (choice === false) return;

        //target에 있는 내용을 서버에 지워달라고 요청하고 목록을 다시 불러온다
        const resp = await axios.delete("/replyBlind/" + target.replyBlindNo);
        removeReplyFromScreen(target.replyBlindNo)
        loadData();
    }, [replyBlinds]);

    //화면에서 해당 댓글을 제거하는 함수
    const removeReplyFromScreen = useCallback((replyBlindNo) => {
        // 현재 상태의 댓글 목록에서 삭제된 댓글을 제외하고 새로운 목록을 만듭니다.
        const updatedReplyBlinds = replyBlinds.filter(reply => reply.replyBlindNo !== replyBlindNo);
        // 새로운 목록으로 상태를 업데이트합니다.
        setReplyBlinds(updatedReplyBlinds);
    }, [replyBlinds, setReplyBlinds]);

    return (
        <div className="ListItem">

            <Jumbotron title="블라인드 게시판"></Jumbotron>

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

            <div className="row mt-4">
                <div className="col text-end">
                    <button className="btn btn-primary" onClick={openModal}>
                        <IoMdAdd />
                        글쓰기
                    </button>
                </div>
            </div>

            <Container className="d-flex" style={{ height: "500px", backgroundSize: "cover" }} fluid>
                <Row xs={1} className="g-4 mt-4">
                    {searchResults.map((boardBlind) => (
                        <Col key={boardBlind.blindNo}>
                            <Card style={{ overflowY: "auto" }}>
                                <Card.Body style={{ display: "flex", flexDirection: "column" }}>
                                    <div className="d-flex justify-content-end mb-2">
                                        {loginId === boardBlind.blindEmpNo && (
                                            <>
                                                <button
                                                    className="btn btn-warning btn-sm me-2"
                                                    onClick={(e) => editBoardBlind(boardBlind)}
                                                ><IoMdHammer />

                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={(e) => deleteBoardBlind(boardBlind)}
                                                ><FaXmark />

                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* 수정 가능한 입력 상자 표시 */}
                                    {boardBlind.edit ? (
                                        <>
                                            <input
                                                type="text"
                                                className="form-control mb-2"
                                                value={boardBlind.blindTitle}
                                                name="blindTitle"
                                                onChange={(e) => changeBoardBlinds(e, boardBlind)}
                                            />
                                            <input
                                                type="text"
                                                className="form-control mb-2"
                                                value={boardBlind.blindContent}
                                                name="blindContent"
                                                onChange={(e) => changeBoardBlinds(e, boardBlind)}
                                                style={{
                                                    height: "300px",
                                                    border: "1px solid rgb(210, 210, 210)",
                                                    borderRadius: "10px",
                                                    padding: "10px",
                                                    marginBottom: "10px"
                                                }}
                                            />

                                            <button
                                                className="btn btn-success btn-sm me-2"
                                                onClick={(e) => saveEditboardBlind(boardBlind)}
                                            >
                                                저장
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={(e) => cancelEditBoardBlind(boardBlind)}
                                            >
                                                취소
                                            </button>
                                        </>

                                    ) : (
                                        <>
                                            {/* 수정 불가능한 텍스트로 표시 */}
                                            <div className="rounded border p-2 mb-2 shadow-sm bg-light">
                                                제목: {boardBlind.blindTitle.toLowerCase().includes(searchKeyword.toLowerCase()) ? (
                                                    <span>
                                                        {boardBlind.blindTitle.split(new RegExp(`(${searchKeyword})`, 'ig')).map((text, index) => (
                                                            text.toLowerCase() === searchKeyword.toLowerCase() ? (
                                                                <span key={index} style={{ backgroundColor: 'pink' }}>{text}</span>
                                                            ) : (
                                                                <span key={index}>{text}</span>
                                                            )
                                                        ))}
                                                    </span>
                                                ) : (
                                                    boardBlind.blindTitle
                                                )}
                                            </div>

                                            <hr />

                                            <div style={{ display: "flex", flexDirection: "row" }}>
                                                <div style={{ border: "0px solid rgb(210, 210, 210)", borderRadius: "10px", padding: "10px", marginBottom: "1px", flex: "1", marginRight: "10px", fontSize: "13px" }}>
                                                    <div><span style={{ fontWeight: "bold" }}>작성자:</span>{boardBlind.blindWriterNick ? boardBlind.blindWriterNick : 'ㅇㅇ'}</div>
                                                </div>
                                                <div style={{ border: "0px solid rgb(210, 210, 210)", borderRadius: "10px", padding: "10px", marginBottom: "1px", flex: "1", marginRight: "10px", fontSize: "13px" }}>
                                                    <div><span style={{ fontWeight: "bold" }}>회사:</span> {boardBlind.blindWriterCompany}</div>
                                                </div>
                                                <div style={{ border: "0px solid rgb(210, 210, 210)", borderRadius: "10px", padding: "10px", marginBottom: "1px", flex: "1", fontSize: "13px" }}>
                                                    <div><span style={{ fontWeight: "bold" }}>작성일:</span> {boardBlind.blindWtime}</div>
                                                </div>
                                            </div>

                                            <hr />

                                            <div style={{ height: "300px", border: "1px solid rgb(210, 210, 210)", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
                                                내용: {boardBlind.blindContent.toLowerCase().includes(searchKeyword.toLowerCase()) ? (
                                                    <span>
                                                        {boardBlind.blindContent.split(new RegExp(`(${searchKeyword})`, 'ig')).map((text, index) => (
                                                            text.toLowerCase() === searchKeyword.toLowerCase() ? (
                                                                <span key={index} style={{ backgroundColor: 'pink' }}>{text}</span>
                                                            ) : (
                                                                <span key={index}>{text}</span>
                                                            )
                                                        ))}
                                                    </span>
                                                ) : (
                                                    boardBlind.blindContent
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* 댓글 섹션 */}
                                    <div style={{ height: "300px", border: "1px solid rgb(210, 210, 210)", borderRadius: "10px", padding: "10px", marginBottom: "10px", overflowY: "auto" }}>
                                        {replyBlinds.map((replyBlind, index) => {
                                            if (replyBlind.blindNo === boardBlind.blindNo) {
                                                return (
                                                    <div key={`${replyBlind.blindNo}_${replyBlind.replyBlindTime}_${index}`} style={{ marginBottom: "10px" }}>
                                                        <div style={{ fontWeight: "bold" }}>작성자: {replyBlind.replyBlindNick ? replyBlind.replyBlindNick : 'ㅇㅇ'}
                                                            {loginId === replyBlind.replyEmpNo && (
                                                                <button
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={(e) => deleteReplyBlind(replyBlind)}
                                                                ><FaXmark />

                                                                </button>
                                                            )}
                                                        </div>
                                                        <div>내용: {replyBlind.replyBlindContent}</div>
                                                        <div>작성 시각: {replyBlind.replyBlindTime}</div>
                                                        <div>회사명: {replyBlind.replyBlindCompany}</div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                    <form>
                                        <div className="row">
                                            <div className="col">
                                                <label>닉네임</label>
                                                <input
                                                    type="text"
                                                    name="replyBlindNick"
                                                    value={replyBlindInput.replyBlindNick}
                                                    onChange={(e) => changeReply(e)}
                                                    className="form-control"
                                                    placeholder="닉네임을 입력하지 않으면 'ㅇㅇ' 으로 자동 입력됩니다"
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col">
                                                <label>댓글</label>
                                                <input
                                                    type="text"
                                                    name="replyBlindContent"
                                                    value={replyBlindInput.replyBlindContent}
                                                    onChange={(e) => changeReply(e)}
                                                    className="form-control"
                                                />
                                            </div>
                                        </div>

                                        <div className="text-end">
                                            <button className='btn btn-success me-2' onClick={(e) => saveReplyInput(boardBlind.blindNo)}>
                                                댓글등록
                                            </button>
                                        </div>
                                    </form>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            {boardBlinds.map(boardBlind => (
                <div key={boardBlind.blindNo} ref={bsModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="staticBackdropLabel">글쓰기</h1>
                                <button type="button" className="btn-close" aria-label="Close"
                                    onClick={e => cancelInput()}></button>
                            </div>
                            <div className="modal-body">
                                <div>
                                    <p>사원 번호: {loginId}</p>
                                    <p>회사: {boardBlind.blindWriterCompany}</p>
                                </div>
                                <form>
                                    <div className="row">
                                        <div className="col">
                                            <label>제목</label>
                                            <input
                                                type="text"
                                                name="blindTitle"
                                                value={input.blindTitle}
                                                onChange={e => changeInput(e)}
                                                className="form-control"
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col">
                                            <label>내용</label>
                                            <textarea
                                                name="blindContent"
                                                value={input.blindContent}
                                                onChange={e => changeInput(e)}
                                                className="form-control"
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col">
                                            <label>작성자 닉네임</label>
                                            <input
                                                type="text"
                                                name="blindWriterNick"
                                                value={input.blindWriterNick}
                                                onChange={e => changeInput(e)}
                                                className="form-control"
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col">
                                            <label>비밀번호</label>
                                            <input
                                                type="password"
                                                name="blindPassword"
                                                value={input.blindPassword}
                                                onChange={e => changeInput(e)}
                                                className="form-control"
                                            />
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
        </div>
    );
};

export default BoardBlind;

