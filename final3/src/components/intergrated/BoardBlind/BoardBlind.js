// import
import { useState, useCallback, useRef } from "react";
import Jumbotron from "../../Jumbotron";
import { startTransition } from 'react';
import { Link } from "react-router-dom";
//
import { Modal } from 'bootstrap';
import axios from "../../utils/CustomAxios";
import { MdDelete } from "react-icons/md";
import { IoIosSave } from "react-icons/io";
import { GiCancel } from "react-icons/gi";
import { FaPlus } from "react-icons/fa";
import NewBoardBlind from './NewBoardBlind';


// funtion
function BoardBlind() {


    // state
    const [blindContents, setBlindContents] = useState([
        { blindNo: 1, blindTitle: "와 어렵다 이거", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "32" },
        { blindNo: 2, blindTitle: "와 어렵다 이거", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "63" },
        { blindNo: 3, blindTitle: "와 어렵다 이거", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "33" },
        { blindNo: 4, blindTitle: "와 어렵다 이거", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "23" },
        { blindNo: 5, blindTitle: "와 어렵다 이거", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "31" },
        { blindNo: 6, blindTitle: "한글", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "39" },
        { blindNo: 5, blindTitle: "와 어렵다 이거", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "31" },
        { blindNo: 6, blindTitle: "한글", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "39" },
        { blindNo: 5, blindTitle: "와 어렵다 이거", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "31" },
        { blindNo: 6, blindTitle: "한글", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "39" },
        { blindNo: 5, blindTitle: "와 어렵다 이거", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "31" },
        { blindNo: 6, blindTitle: "한글", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "39" },
        { blindNo: 5, blindTitle: "와 어렵다 이거", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "31" },
        { blindNo: 6, blindTitle: "한글", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "39" },
        { blindNo: 5, blindTitle: "와 어렵다 이거", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "31" },
        { blindNo: 6, blindTitle: "한글", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "39" },
        { blindNo: 5, blindTitle: "와 어렵다 이거", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "31" },
        { blindNo: 6, blindTitle: "한글", blindWriterNick: "뽀로로", blindWtime: "작성시각", blindView: "39" },
    ]);

    // blindNo 상태 정의
    const [blindNo, setBlindNo] = useState({
        edit: false // 기본값 설정
    });

    // 모달 열기 상태
    const [showModal, setShowModal] = useState(false);

    // 모달 열기 함수
    const openModal = () => {
        setShowModal(true);
    };

    


    return (
        <>
            {/* div 형식 틀 */}
            {/* <div className="row mt-4 text-center">
                <div className="col">글번호</div>
                <div className="col">제목</div>
                <div className="col">글쓴이</div>
                <div className="col">작성일</div>
                <div className="col">조회수</div>
            </div>
            <hr />
            {blindContents.map((blindContent) => (
                <div className="row">
                    <div className="col">{blindContent.blindNo}</div>
                    <div className="col">{blindContent.blindTitle}</div>
                    <div className="col">{blindContent.blindWriterNick}</div>
                    <div className="col">{blindContent.blindWtime}</div>
                    <div className="col">{blindContent.blindView}</div>
                </div>
            ))} */}


            <div className="row mt-4">
            <div className="col-auto">
                    <button onClick={openModal} className="btn btn-primary">글쓰기</button>
                </div>
            </div>
            {/* 모달 */}
            {showModal && <NewBoardBlind closeModal={() => setShowModal(false)} />}

            <div className="row mt-4">
                <div className="col">
                    <table className="table table-hover table-bordered">
                        <thead className="text-center">
                            <tr>
                                <th>글번호</th>
                                <th>제목</th>
                                <th>글쓴이</th>
                                <th>작성일</th>
                                <th>조회수</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {blindContents.map((blindContent) => (
                                <tr key={blindContent.blindNo}>
                                    {blindNo.edit === true ? (
                                        <>
                                            <td>
                                                <input type="text" value={blindContent.blindNo} />
                                            </td>
                                            <td>입력창</td>
                                            <td>입력창</td>
                                            <td>버튼</td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{blindContent.blindNo}</td>
                                            <td>{blindContent.blindTitle}</td>
                                            <td>{blindContent.blindWriterNick}</td>
                                            <td>{blindContent.blindWtime}</td>
                                            <td>{blindContent.blindView}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
           
        </>
    );


}

// export
export default BoardBlind;