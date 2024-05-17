import { useCallback, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import axios from "../../utils/CustomAxios";
import { MdCancel } from "react-icons/md";
import { IoSaveOutline } from "react-icons/io5";

const BoardNoticeAdd = () => {

    // const { noticeNo } = useParams();

    const navigate = useNavigate();

    const [input, setInput] = useState({
        noticeTitle: "",
        noticeContent: "",
    });

    //callback
    const changeInput = useCallback((e => {
        const name = e.target.name;
        const value = e.target.value;

        setInput({
            ...input,
            [name]: value
        });
    }), [input])


    //신규등록
    const saveInput = useCallback(async () => {
        const choice = window.confirm("등록하면 삭제 못하니까 좀 신중하게 하셈 ㅇㅋ?ㄹㅇㅋㅋ");
        if (choice === false) return;
        const resp = await axios.post("/boardNotice/", input);
        clearInput();

        navigate(`/company/notice/${resp.data.noticeNo}`);
    }, [input]);

    //등록 취소
    const cancelInput = useCallback(() => {
        const choice = window.confirm("ㄹㅇ작성 취소?");
        if (choice === false) return;
        clearInput();
        navigate("/company/notice");
    }, [input]);

    //입력값 초기화
    const clearInput = useCallback(() => {
        setInput({
            noticeTitle: "",
            noticeContent: "",
        })
    }, [input]);

    return (
        <>
            <h1>★공지등록★</h1>
            <div className="row mt-4">
                <div className="col">
                    <label>제목</label>
                    <input type="text" name="noticeTitle" value={input.noticeTitle} onChange={changeInput} className="form-control" />
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <label>내용</label>
                    <textarea name="noticeContent" value={input.noticeContent}
                        onChange={changeInput}
                        className="form-control custom-textarea" />
                </div>
            </div>

            <div className="row mt-4">
                <div className="col text-end">
                    <button className="btn btn-success me-2" onClick={e => saveInput()}><IoSaveOutline /> 등록</button>
                    <button className="btn btn-danger" onClick={e => cancelInput()}><MdCancel /> 취소</button>
                </div>
            </div>
        </>
    );
}

export default BoardNoticeAdd;