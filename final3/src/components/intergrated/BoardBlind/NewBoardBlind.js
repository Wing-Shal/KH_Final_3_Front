// import
import { useState } from "react";

// function
function NewBoardBlind({closeModal}) {

    // state
    // state
    const [blindNewTitle, setBlindNewTitle] = useState("");
    const [blindNewContent, setBlindNewContent] = useState("");
    const [blindNewWriterNick, setBlindNewWriterNick] = useState("");
    const [blindNewWtime, setBlindNewWtime] = useState("");
    const [file, setFile] = useState(null); //파일 상태 추가

    const handleSubmit = (e) => {
        e.preventDefault();
        // 폼 데이터를 이용하여 새로운 문서를 생성하는 함수 호출 등의 작업 수행
        // 예를 들어, 서버에 POST 요청을 보내거나 상태를 업데이트하는 등의 작업을 수행할 수 있습니다.
        closeModal(); // 모달 닫기
    };

    return (
        <div className="modal" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="modal-dialog" style={{ borderRadius: "10px" }}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">글 작성</h5>
                        <button type="button" className="close" onClick={closeModal}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>제목</label>
                                <input type="text" className="form-control" value={blindNewTitle} onChange={(e) => setBlindNewTitle(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>내용</label>
                                <textarea className="form-control" value={blindNewContent} onChange={(e) => setBlindNewContent(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>작성자</label>
                                <input type="text" className="form-control" value={blindNewWriterNick} onChange={(e) => setBlindNewWriterNick(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary">작성 완료</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );

}


// export
export default NewBoardBlind;