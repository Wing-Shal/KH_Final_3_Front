import { useRecoilState } from 'recoil';
import { loginIdState } from "../../utils/RecoilData";
import axios from "../../utils/CustomAxios";
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BoardNoticeForCompany = () => {

    //state
    const [notices, setNotices] = useState([]);



    useEffect(() => {
        loadNoticeData();
    }, []);

    const loadNoticeData = useCallback(async () => {
        try {
            const resp = await axios.get("/boardNotice/");
            // console.log(resp);
            setNotices(resp.data);
        }
        catch (error) {
            if (error.response && error.response.status === 404) {
                console.log("데이터 없음.");
                setNotices([]);
            }
        }
    }, []);




    return (
        <>
            <div className="row mt-4">
                <div className="col">
                    <Link to="/company/notice/add" className='btn btn-secondary'>공지등록</Link>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <table className='table'>
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>제목</th>
                                <th>작성시간</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notices.map(notice => (
                                <tr key={notice.noticeNo}>
                                    <td>{notice.noticeNo}</td>
                                    <td>
                                        <Link to={`/company/notice/${notice.noticeNo}`}>{notice.noticeTitle}</Link>
                                    </td>
                                    <td>{notice.noticeWtimeWithMinute}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default BoardNoticeForCompany;