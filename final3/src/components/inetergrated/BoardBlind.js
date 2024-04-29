// import
import { useState, useCallback, useRef } from "react";
import Jumbotron from "../Jumbotron";
import { startTransition } from 'react';
import { Link } from "react-router-dom";
//
import { Modal } from 'bootstrap';
import axios from "../utils/CustomAxios";
import { MdDelete } from "react-icons/md";
import { IoIosSave } from "react-icons/io";
import { GiCancel } from "react-icons/gi";
import { FaPlus } from "react-icons/fa";


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

    // blindNo 상태 정의 (글 수정 관련)
    const [blindNo, setBlindNo] = useState({
        edit: false // 기본값 설정
    });

    //ref(참조)
    //- 리액트에서 태그를 선택하는 대신 사용하는 도구(그 외의 용도도 가능)
    //- 변수명.current 를 이용하여 현재 참조하고 있는 대상 태그를 호출할 수 있음
    const bsModal = useRef();//리모컨
    const openModal = useCallback(() => {
        const modal = new Modal(bsModal.current);
        modal.show();
    }, [bsModal]);
    const closeModal = useCallback(() => {
        const modal = Modal.getInstance(bsModal.current);
        modal.hide();
    }, [bsModal]);




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

            {/* 글쓰기 버튼 */}
            <div className="row mt-4">
                <div className="col">
                    {/* 버튼 클릭 시 모달 열기 */}
                    {/* <button className="btn" onClick={}>글쓰기</button> */}
                </div>
            </div>



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
                                            
                                                <input type="text" value={blindContent.blindNo} />
                                            
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
             {/* Modal */}
             <div ref={bsModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="staticBackdropLabel">신규 몬스터 등록</h1>
                        <button type="button" className="btn-close" aria-label="Close" onClick={e=>cancelInput()}></button>
                    </div>
                    <div className="modal-body">
                        {/* 등록 화면 */}
                        <div className='row mt-4'>
                            <div className='col'>
                                <label>번호</label>  
                                <input type="text" name="pocketmonNo" 
                                        value={input.pocketmonNo} 
                                        onChange={e=>changeInput(e)}
                                        className='form-control'/>
                            </div>
                        </div>

                        <div className='row mt-4'>
                            <div className='col'>
                                <label>이름</label>  
                                <input type="text" name="pocketmonName" 
                                        value={input.pocketmonName} 
                                        onChange={e=>changeInput(e)}
                                        className='form-control'/>
                            </div>
                        </div>

                        <div className='row mt-4'>
                            <div className='col'>
                                <label>속성</label>  
                                <input type="text" name="pocketmonType" 
                                        value={input.pocketmonType} 
                                        onChange={e=>changeInput(e)}
                                        className='form-control'/>
                            </div>
                        </div>
                    
                    </div>
                    <div className="modal-footer">
                        <button className='btn btn-success me-2'
                                    onClick={e=>saveInput()}>
                            <IoIosSave />
                            &nbsp;
                            등록
                        </button>
                        <button className='btn btn-danger'
                                    onClick={e=>cancelInput()}>
                            <GiCancel />
                            &nbsp;
                            취소
                        </button>
                    </div>
                    </div>
                </div>
            </div>

        </>
    );


}

// export
export default BoardBlind;