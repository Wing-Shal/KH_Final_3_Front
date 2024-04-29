import { useState } from "react";

function NewDocument({ closeModal }){

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [writer, setWriter] = useState("");
    const [writeDate, setWriteDate] = useState("");
    const [deadline, setDeadline] = useState("");
    const [file, setFile] = useState(null); // 파일 상태 추가

    // 참조자와 결재자를 검색하기 위한 상태
    const [searchReferrer, setSearchReferrer] = useState("");
    const [searchApprover, setSearchApprover] = useState("");
    // 검색 결과를 저장할 상태
    const [referrerResults, setReferrerResults] = useState([]);
    const [approverResults, setApproverResults] = useState([]);

    // 참조자와 결재자를 검색하는 함수
    const handleSearchReferrer = (e) => {
        setSearchReferrer(e.target.value);
        // 여기에 검색 API 요청 등의 로직을 추가할 수 있습니다.
        // 검색 결과는 setReferrerResults를 통해 업데이트합니다.
    };

    const handleSearchApprover = (e) => {
        setSearchApprover(e.target.value);
        // 여기에 검색 API 요청 등의 로직을 추가할 수 있습니다.
        // 검색 결과는 setApproverResults를 통해 업데이트합니다.
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // 폼 데이터를 이용하여 새로운 문서를 생성하는 함수 호출 등의 작업 수행
        // 예를 들어, 서버에 POST 요청을 보내거나 상태를 업데이트하는 등의 작업을 수행할 수 있습니다.
        closeModal(); // 모달 닫기
    };

    // 참조자 검색 모달 열기
    const openReferrerSearchModal = () => {
        // 여기에 검색 모달을 열기 위한 코드를 추가합니다.
    };

    // 결재자 검색 모달 열기
    const openApproverSearchModal = () => {
        // 여기에 검색 모달을 열기 위한 코드를 추가합니다.
    };

    return (
        <div className="modal" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="modal-dialog" style={{ borderRadius: "10px" }}>
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="btn-group" role="group" aria-label="Basic example">
                            <button type="button" className="btn btn-secondary">일반</button>
                            <button type="button" className="btn btn-secondary">결재</button>
                        </div>
                        <button type="button" className="close" onClick={closeModal} style={{ marginLeft: "auto" }}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col">
                                    <div className="form-group">
                                        <label>문서 작성일</label>
                                        <input type="date" className="form-control" value={writeDate} onChange={(e) => setWriteDate(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="form-group">
                                        <label>문서 결재 마감일</label>
                                        <input type="date" className="form-control" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>제목</label>
                                <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>내용</label>
                                <textarea className="form-control" value={content} onChange={(e) => setContent(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>작성자</label>
                                <input type="text" className="form-control" value={writer} onChange={(e) => setWriter(e.target.value)} required />
                            </div>
                            {/* 파일 첨부 입력란 */}
                            <div className="form-group">
                                <label>파일 첨부</label>
                                <input type="file" className="form-control-file" onChange={(e) => setFile(e.target.files[0])} />
                            </div>
                            {/* 참조자 검색 */}
                            <div className="form-group">
                                <label>참조자</label>
                                <div className="input-group">
                                    <input type="text" className="form-control" value={searchReferrer} onChange={handleSearchReferrer} />
                                    <div className="input-group-append">
                                        <button className="btn btn-outline-secondary" type="button" onClick={openReferrerSearchModal}>
                                            <i className="fas fa-search"></i>
                                        </button>
                                    </div>
                                </div>
                                {/* 여기에 검색 결과를 표시할 UI를 추가합니다. */}
                            </div>
                            {/* 결재자 검색 */}
                            <div className="form-group">
                                <label>결재자</label>
                                <div className="input-group">
                                    <input type="text" className="form-control" value={searchApprover} onChange={handleSearchApprover} />
                                    <div className="input-group-append">
                                        <button className="btn btn-outline-secondary" type="button" onClick={openApproverSearchModal}>
                                            <i className="fas fa-search"></i>
                                        </button>
                                    </div>
                                </div>
                                {/* 여기에 검색 결과를 표시할 UI를 추가합니다. */}
                            </div>
                            <button type="submit" className="btn btn-primary">작성 완료</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewDocument;
