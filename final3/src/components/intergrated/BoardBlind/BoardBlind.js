import { useCallback, useEffect, useRef, useState } from "react";
import { loginIdState } from '../../../components/utils/RecoilData';
import { useRecoilState } from 'recoil';
import Jumbotron from "../../Jumbotron";
import { IoMdAdd } from "react-icons/io";
import axios from "../../utils/CustomAxios";
import { Modal } from "bootstrap";

function BoardBlind() {

    // state
    const [boardBlinds, setBoardBlinds] = useState([]);
    // const [blindEmpNo, setblindEmpNo] = useRecoilState(loginIdState); // 사용자의 blindEmpNo를 저장합니다.
    const [loginId, setLoginId] = useRecoilState(loginIdState);
    const [input, setInput] = useState({
        blindTitle: "",
        blindContent: "",
        blindWriterCompany: "",
        blindWriterNick: "",
        blindWtime: "",
        blindEtime: "",
        blindPassword: "",
        blindEmpNo: "",
        companyName:""
    });

    //effect
    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(async () => {
        // const blindEmpNo = loginId;
        const resp = await axios.get("/boardBlind/"); // 이 엔드포인트가 companyName을 포함한 블라인드 게시글을 반환한다고 가정합니다.
        setBoardBlinds(resp.data);
    }, []);
    

    //신규 등록 화면 입력값 변경
    const changeInput = useCallback((e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

    //등록
    const saveInput = useCallback(async () => {
        const resp = await axios.post("/boardBlind/", input);
        loadData();
        clearInput();
        closeModal();
    }, [input, loadData]);

    
    //입력값 초기화
    const clearInput = useCallback(() => {
        setInput({
            blindNo:"",
            blindTitle: "",
            blindContent: "",
            blindWriterCompany: "",
            blindWriterNick: "",
            blindWtime: "",
            blindEtime: "",
            blindPassword: "",
            blindEmpNo: "",
            blindView:"",
            companyName:""
        });
    }, []);

    
    //ref + modal
    const bsModal = useRef();
    const openModal = useCallback(() => {
        const modal = new Modal(bsModal.current);
        setInput({
            ...input,
            blindEmpNo: loginId
        });
        modal.show();
    }, [bsModal, input, loginId]);
    const closeModal = useCallback(() => {
        const modal = Modal.getInstance(bsModal.current);
        modal.hide();
    }, [bsModal]);
    
    //등록 취소
    const cancelInput = useCallback(() => {
        const choice = window.confirm("작성을 취소하시겠습니까?");
        if (choice === false) return;
        clearInput();
        closeModal();
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
                <div className="col">
                    <table className="table table-striped">
                        <thead className="text-center">
                            <tr>
                                <th>글번호</th>
                                <th>제목</th>
                                <th>작성자</th>
                                <th>사원번호</th>
                                <th>조회수</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {boardBlinds.map(boardBlind => (
                                <tr key={boardBlind.blindNo}>
                                    <td>{boardBlind.blindNo}</td>
                                    <td>{boardBlind.blindTitle}</td>
                                    <td>{boardBlind.blindWriterNick}</td>
                                    <td>{boardBlind.blindWriterCompany}</td>
                                    <td>{boardBlind.blindView}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default BoardBlind;
