import { Link, useParams } from 'react-router-dom';
import axios from "../../utils/CustomAxios";
import { useCallback, useEffect, useState } from 'react';

const BoardNoticeDetail = () => {

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
                        <tbody>
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
                                <td>
                                    {notice.noticeWtimeWithMinute}
                                    {notice.noticeEtime && " (수정됨)"}
                                </td>
                            </tr>
                            {notice.noticeEtime && (
                                <tr>
                                    <td>수정시간</td>
                                    <td>{notice.noticeEtimeWithMinute}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col text-end">
                    <Link to={`/board/notice`} className='btn btn-primary'>목록</Link>
                </div>
            </div>
        </>
    );
}

export default BoardNoticeDetail;