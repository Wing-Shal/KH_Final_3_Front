import { Link, useParams } from 'react-router-dom';
import axios from "../../utils/CustomAxios";
import { useCallback, useEffect, useState } from 'react';

const BoardNoticeDetailForCompany = () => {

    const { noticeNo } = useParams();
    const [notice, setNotice] = useState([]);




    useEffect(() => {
        const loadNoticeDetail = async () => {
            const resp = await axios.get(`/boardNotice/${noticeNo}`);
            setNotice(resp.data);
        };
        loadNoticeDetail();
    }, [noticeNo]);




    return (
        <>
            <div className="row mt-4">
                <div className="col">
                    <table className='table'>
                        <tr>
                            <td>제목</td>
                            <td>{notice.noticeTitle}</td>
                        </tr>
                        <tr>
                            <td>내용</td>
                            <td>{notice.noticeContent}</td>
                        </tr>
                        <tr>
                            <td>작성시간</td>
                            <td>{notice.noticeWtimeWithMinute}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col text-end">
                    <Link to={`/company/notice/edit/${notice.noticeNo}`} className='btn btn-secondary me-2'>공지수정</Link>
                    <Link to={`/company/notice`} className='btn btn-primary'>목록</Link>
                </div>
            </div>
        </>
    );
}

export default BoardNoticeDetailForCompany;