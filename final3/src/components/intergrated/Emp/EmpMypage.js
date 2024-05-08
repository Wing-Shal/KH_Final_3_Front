import React, { useState } from 'react';
import axios from "../../utils/CustomAxios";
import { loginIdState } from '../../utils/RecoilData';
import { useRecoilState } from 'recoil';
// import axios from 'axios';

function EmpMypage() {
  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loginId, setLoginId] = useRecoilState(loginIdState);

  // empNo 값 변경
  // const handleChangeEmpNo = () => {
  //   setEmpNo(123) // 새로운 empNo 값으로 업데이트
  // };

  const clearImagePreview = () => {
    setImagePreview(null);
    setFile(null); // 파일 초기화
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    if (file) {
      setFile(file);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      if (file) {
        const formData = new FormData();
        formData.append('attach', file);
    
        const response = await axios.post("/emp/upload/"+loginId, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }, [loginIdState]);
        console.log('파일 업로드 결과:', response.data);
    
        // 여기서 response.data에는 DB에 저장된 정보가 있을 수 있으므로, 필요에 따라 처리할 수 있습니다.
        // 예를 들어, DB에 저장된 파일의 ID나 URL 등을 가져와서 표시하거나 다른 작업을 할 수 있습니다.
        
        // DB에 저장되었다는 메시지를 출력하거나 다른 작업을 할 수 있습니다.
        console.log('DB에 저장되었습니다.');
    
        // 저장 후에는 이미지 미리보기를 초기화할 수 있습니다.
        clearImagePreview();
      } else {
        console.log('파일이 선택되지 않았습니다.');
      }
    } catch (error) {
      console.error('파일 업로드 오류:', error);
    }
  };
  
  return (
    <>
      <h1>마이페이지</h1>
      <div className="container-lg border border-5 rounded p-3 mb-3">

        <div className="row align-items-center ">
          <div>
            <span className="font-style">사진</span>
            <input type="file" onChange={handleImageChange} className="form-control"
              id="upload" aria-label="upload" />
            {imagePreview && (
              <img src={imagePreview} alt="사진 미리보기" style={{ maxWidth: '200px', maxHeight: '200px' }} />
            )}
          </div>
          <button onClick={handleSave}>저장</button> {/* 저장 버튼 */}
          {/* 나머지 부분 생략 */}
        </div>
      </div>
    </>
  );
}
export default EmpMypage;