import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import axios from "../../utils/CustomAxios";
import { MdCancel } from "react-icons/md";
import { IoSaveOutline } from "react-icons/io5";
import './BoardNoticeEditAdd.css'

const BoardNoticeEdit = () => {

    const { noticeNo } = useParams();

    const navigate = useNavigate();

    const [input, setInput] = useState({
        noticeTitle: "",
        noticeContent: "",
    });

    useEffect(() => {
        const loadNoticeData = async () => {
            const resp = await axios.get(`/boardNotice/${noticeNo}`);
            setInput({
                noticeNo: noticeNo, 
                noticeTitle: resp.data.noticeTitle,
                noticeContent: resp.data.noticeContent,
            });
        };
        loadNoticeData();
    }, [noticeNo]);

    //callback
    const changeInput = useCallback((e => {
        const name = e.target.name;
        const value = e.target.value;

        setInput({
            ...input,
            [name]: value
        });
    }), [input])

    if (input.noticeTitle.length > 30) {
        window.alert("제목의 제한 글자수를 초과했습니다.");
        return;
      }
  
      if (input.noticeContent.length > 1333) {
        window.alert("내용의 제한 글자수를 초과했습니다.");
        return;
      }


    //수정 취소
    const cancelInput = useCallback(() => {
        const choice = window.confirm("작성된 내용이 삭제됩니다.");
        if (choice === false) return;
        clearInput();
        navigate(`/company/notice/${noticeNo}`);
    }, [input]);

    //입력값 초기화
    const clearInput = useCallback(() => {
        setInput({
            noticeTitle: "",
            noticeContent: "",
        })
    }, [input]);

    //수정하기
    const editNotice = useCallback(async () => {
        const choice = window.confirm("공지를 수정하시겠습니까?");
        if (choice === false) return;
        const resp = await axios.patch("/boardNotice/", input);

        navigate(`/company/notice/${noticeNo}`);
        console.log(resp.data);
    }, [input]);

    return (
        <>
            <h1>★공지 수정★</h1>
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
                    <button className="btn btn-success me-2" onClick={e => editNotice()}><IoSaveOutline /> 등록</button>
                    <button className="btn btn-danger" onClick={e => cancelInput()}><MdCancel /> 취소</button>
                </div>
            </div>
        </>
    );
}

export default BoardNoticeEdit;