import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from "../../utils/CustomAxios";
import { loginIdState } from '../../utils/RecoilData';
import { FaPlus } from 'react-icons/fa';

function AdminUpload() {

    const [file, setFile] = useState();

    const upload = useCallback(async (files) => {
        const uploadFile = files[0];
        if (!uploadFile) return; //파이리 없으면 리턴
        setFile(uploadFile);
    }, []);

    useEffect(() => {
        console.log(file);
        const uploadFile = async () => {
            if (file) {
                const formData = new FormData();
                formData.append('attach', file);

                const resp = await axios.post("/admin/upload", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                console.log('업로드 완료');
            }
        };
        uploadFile();
    }, [file]);

    const fileInputRef = useRef();

    const handleUpload = () => {
        fileInputRef.current.click();
    }

    return (
        <>
            <div className="container-sm border border-5 rounded p-3 mb-3">
                <div className="row align-items-center">
                    {/* 사진 첨부 파일 */}
                    <div className="col-md-3">
                        <div>
                            <button className='btn btn-primary my-3' onClick={handleUpload}>
                                <FaPlus />
                                관리용 파일 등록
                            </button>
                            <input type="file"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={e => upload(e.target.files)} />
                        </div>
                        <br />
                    </div>
                </div>
            </div>


        </>
    );




}

export default AdminUpload;