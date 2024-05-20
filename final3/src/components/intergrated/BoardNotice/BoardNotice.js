import axios from "../../utils/CustomAxios";
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './BoardNotice.css';

const BoardNotice = () => {
    const [notices, setNotices] = useState([]);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [column, setColumn] = useState('notice_title');
    const [keyword, setKeyword] = useState('');
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadNoticeData();
    }, [page, size]);

    const loadNoticeData = useCallback(async () => {
        try {
            const resp = await axios.get(`/boardNotice/page/${page}/size/${size}`, {
                params: { column, keyword }
            });
            setNotices(resp.data.list);
            setTotalPages(resp.data.totalPage);
        }
        catch (error) {
            if (error.response && error.response.status === 404) {
                console.log("데이터 없음.");
                setNotices([]);
            }
        }
    }, [page, size, column, keyword]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadNoticeData();
    }

    return (
        <div className="row mt-4">
            <div className="col">
            <div className="notice-list">
                        {notices.map(notice => (
                            <div className="notice-item" key={notice.noticeNo}>
                                <div className="notice-content">
                                    <h5>
                                        <Link to={`/board/notice/${notice.noticeNo}`}>
                                            {notice.noticeTitle}
                                        </Link>
                                    </h5>
                                    <p>{notice.noticeEtime ? `수정됨: ${notice.noticeEtimeWithMinute}` : `작성시간: ${notice.noticeWtimeWithMinute}`}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                <div className="row mt-4">
                <div className="col-8 offset-2">
                    <form onSubmit={handleSearch}>
                        <div className="input-group mb-3">
                            <select
                                value={column}
                                onChange={(e) => setColumn(e.target.value)}
                                className="form-select"
                            >
                                <option value="notice_title">제목</option>
                                <option value="notice_content">내용</option>
                            </select>
                            <input
                                type="text"
                                className="form-control w-75"
                                placeholder="검색어를 입력하세요"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                            <button className="btn btn-outline-secondary" type="submit">검색</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="row mt-4 justify-content-center">
                <div className="col-auto">
                    <nav aria-label="Page navigation">
                        <ul className="pagination">
                            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(page - 1)}>이전</button>
                            </li>
                            {[...Array(totalPages).keys()].map(num => (
                                <li key={num + 1} className={`page-item ${page === num + 1 ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => setPage(num + 1)}>{num + 1}</button>
                                </li>
                            ))}
                            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(page + 1)}>다음</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </div>
    );
}

export default BoardNotice;
