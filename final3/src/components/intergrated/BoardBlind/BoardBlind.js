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
// import { FaPlus } from "react-icons/fa"; // 폰트어썸 아이콘 라이브러리에서 Plus 아이콘을 import 합니다.


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

    // 검색어 상태 변수
    const [searchTerm, setSearchTerm] = useState("");
    // 검색 결과 상태 변수
    const [searchResults, setSearchResults] = useState([]);

    // 검색어 변경 시 처리 함수
    const handleSearch = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
        // 검색어가 비어있으면 전체 문서 목록을 보여줍니다.
        if (!term.trim()) {
            setSearchResults([]);
            return;
        }
        // 검색어가 포함된 문서를 필터링하여 결과에 저장합니다.
        const results = blindContents.filter(blindContent =>
            blindContent.blindTitle.includes(term)
        );
        setSearchResults(results);

        // 검색어가 비어있으면 전체 문서 목록을 보여주고, 그렇지 않으면 검색 결과를 보여줍니다.
        const displayedBlindContentsList = searchTerm.trim() ? searchResults : blindContents;

        // DB에서 문서 목록을 가져오는 비동기 함수
        // const fetchBlindContents = async () => {
        //     // 여기서는 단순히 mock 데이터를 사용하겠습니다.
        //     const mockData = [
        //         {documentNo:1, documentTitle:"프로젝트시작", documentStatus:"승인", documentWriter:"김윤경", documentApprover:"강지원", documentWriteTime:"2024-04-29", documentLimitTime:"2024-05-01", documentContent: "이 문서는 프로젝트를 시작하기 위한 것입니다.", documentReferrer: "박성진", documentApprover: "김지연"},
        //         {documentNo:2, documentTitle:"CRUD작성", documentStatus:"요청", documentWriter:"김윤경", documentApprover:"강지원", documentWriteTime:"2024-04-30", documentLimitTime:"2024-05-02", documentContent: "이 문서는 CRUD 작성을 요청하는 문서입니다.", documentReferrer: "이철수", documentApprover: "이영희"},
        //         // 나머지 문서 데이터도 추가해주세요.
        //     ];
        //     // 데이터를 설정합니다.
        //     setDocuments(mockData);
        // };

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

                    <div className="row mt-4 justify-content-center"> {/* 가운데 정렬 */}
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="검색어를 입력하세요"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        
                    </div>

                </div>

            </div>

        </>
    );


}

// export
export default BoardBlind;