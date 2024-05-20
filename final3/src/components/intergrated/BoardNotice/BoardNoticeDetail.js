import { Link, useParams } from 'react-router-dom';
import axios from "../../utils/CustomAxios";
import { useCallback, useEffect, useState } from 'react';

const BoardNoticeDetail = () => {

    const { noticeNo } = useParams();
    const [notice, setNotice] = useState({
        noticeTitle: "",
        noticeContent: "",
        noticeEtime: "",
    });




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
                    <table className='notice-table'>
                        <tbody>
                            <tr>
                                <td className="notice-title">{notice.noticeTitle}{notice.noticeEtime && " (수정됨)"}</td>
                            </tr>
                            <tr>
                                <td className="notice-content">{notice.noticeWtimeWithMinute}
                                    {notice.noticeEtime && (
                                        <> (수정시각 : {notice.noticeEtimeWithMinute})</>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <hr />
                                </td>
                            </tr>
                            <tr>
                                <td className="notice-content">
                                    {notice.noticeContent.split('\n').map((line, index) => (
                                        <span key={index}>{line}<br /></span>
                                    ))}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <hr />
            <div className="row mt-4">
                <div className="col text-end">
                    <Link to={`/board/notice`} className='btn btn-primary'>목록</Link>
                </div>
            </div>
        </>
    );
}

export default BoardNoticeDetail;