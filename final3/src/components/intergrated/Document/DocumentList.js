import React, { useState, useEffect } from "react";
import Jumbotron from "../../Jumbotron";
import NewDocument from './NewDocument';

function DocumentList(){

    // 초기 문서 목록
    const [documents, setDocuments] = useState([]);

    // 검색어 상태 변수
    const [searchTerm, setSearchTerm] = useState("");
    // 검색 결과 상태 변수
    const [searchResults, setSearchResults] = useState([]);

    // 새로운 문서 작성 모달을 열기 위한 함수
    const [showModal, setShowModal] = useState(false);
    const openModal = () => {
        setShowModal(true);
    };

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
        const results = documents.filter(document =>
            document.documentTitle.includes(term)
        );
        setSearchResults(results);
    };

    // 검색어가 비어있으면 전체 문서 목록을 보여주고, 그렇지 않으면 검색 결과를 보여줍니다.
    const displayedDocuments = searchTerm.trim() ? searchResults : documents;

    // DB에서 문서 목록을 가져오는 비동기 함수
    const fetchDocuments = async () => {
        // 여기서는 단순히 mock 데이터를 사용하겠습니다.
        const mockData = [
            {documentNo:1, documentTitle:"프로젝트시작", documentStatus:"승인", documentWriter:"김윤경", documentApprover:"강지원", documentWriteTime:"2024-04-29", documentLimitTime:"2024-05-01", documentContent: "이 문서는 프로젝트를 시작하기 위한 것입니다.", documentReferrer: "박성진", documentApprover: "김지연"},
            {documentNo:2, documentTitle:"CRUD작성", documentStatus:"요청", documentWriter:"김윤경", documentApprover:"강지원", documentWriteTime:"2024-04-30", documentLimitTime:"2024-05-02", documentContent: "이 문서는 CRUD 작성을 요청하는 문서입니다.", documentReferrer: "이철수", documentApprover: "이영희"},
            // 나머지 문서 데이터도 추가해주세요.
        ];
        // 데이터를 설정합니다.
        setDocuments(mockData);
    };

    useEffect(() => {
        fetchDocuments(); // 컴포넌트가 마운트될 때 데이터를 가져옵니다.
    }, []);

    return (
        <>
            <Jumbotron title="내 문서"/>
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
                <div className="col-auto">
                    <button onClick={openModal} className="btn btn-primary">새 문서</button>
                </div>
            </div>
            {showModal && <NewDocument closeModal={() => setShowModal(false)} />}

            <div className="row mt-4 justify-content-center"> {/* 가운데 정렬 */}
                <div className="col">
                    <div className="row">
                        {displayedDocuments.map((document, index) => (
                            <div key={document.documentNo} className="col-6 border rounded p-3 mb-3">
                                <div>
                                    <h5>{document.documentTitle}</h5>
                                    <p><strong>시작일:</strong> {document.documentWriteTime} 부터</p>
                                    <p><strong>마감일:</strong> {document.documentLimitTime} 까지</p>
                                    <p><strong>내용:</strong> {document.documentContent}</p>
                                    <p><strong>참조자:</strong> {document.documentReferrer}<strong>  결재자:</strong> {document.documentApprover}</p>
       
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default DocumentList;
