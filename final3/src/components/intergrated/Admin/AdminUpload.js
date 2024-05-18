import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from "../../utils/CustomAxios";
import { FaPlus } from 'react-icons/fa';
import { FaXmark } from 'react-icons/fa6';
import './AdminUpload.css';

function AdminUpload() {
    const [attaches, setAttaches] = useState([]);
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const fileInputRef = useRef();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(async () => {
        const resp = await axios.get("/admin/upload");
        setAttaches(resp.data);
    }, []);

    const upload = useCallback((files) => {
        const uploadFile = files[0];
        if (!uploadFile) return; // 파일이 없으면 리턴
        setFile(uploadFile);
        setFileName(uploadFile.name); // 파일 이름을 기본값으로 설정
    }, []);

    const uploadFile = async () => {
        if (file) {
            const formData = new FormData();
            formData.append('attach', file);
            formData.append('fileName', fileName); // 파일 이름 추가

            const resp = await axios.post("/admin/upload", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setFile(null);
            setFileName("");
        }
    };
    const deleteFile = async (adminAttachNo) => {
        await axios.delete(`/admin/upload/${adminAttachNo}`);

        loadData();
    };

    const handleUpload = () => {
        fileInputRef.current.click();
    };

    const handleFileNameChange = (e) => {
        setFileName(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        uploadFile();
    };

    return (
        <>
            <div className="container-sm border border-1 rounded p-3 mb-3">
                <div className="row align-items-center">
                    {/* 파일 첨부 */}
                    <div className="col-md-6 offset-md-3">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="fileName" className="form-label">파일명</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="fileName"
                                    value={fileName}
                                    onChange={handleFileNameChange}
                                    required
                                />
                            </div>
                            <div className='d-flex justify-content-end'>
                                <div>
                                    <button type='button' className='btn btn-dark' onClick={handleUpload}>
                                        <FaPlus />
                                        관리용 파일 선택
                                    </button>
                                    <input
                                        type="file"
                                        style={{ display: 'none' }}
                                        ref={fileInputRef}
                                        onChange={e => upload(e.target.files)}
                                    />
                                </div>
                                <div>
                                    <button type="submit" className="btn btn-primary">업로드</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className='row mt-4'>
                    <div className='col-6 offset-3'>
                        <table className='table admin-table'>
                            <thead className='text-center'>
                                <tr>
                                    <th>구분번호</th>
                                    <th>파일명</th>
                                    <th>파일 삭제</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {attaches.map(attach => (
                                    <tr key={attach.attachNo} className='align-items-center'>
                                        <td>{attach.attachNo}</td>
                                        <td>{attach.attachName}</td>
                                        <td><FaXmark className='text-danger' style={{cursor: 'pointer'}}
                                                onClick={() => deleteFile(attach.adminAttachNo)}/></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminUpload;
