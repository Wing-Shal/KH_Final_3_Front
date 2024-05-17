import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from "../../utils/CustomAxios";
import { loginIdState } from '../../utils/RecoilData';
import { useRecoilState } from 'recoil';
import calender from "../../../assets/calender.png";
import defaultImage from "../../../assets/CompanyLogo.jpg"; // 기본 이미지 경로를 추가해주세요
import '../Company/Mypage.css';
import { Modal } from 'bootstrap';

function EmpCompanyInfo() {
  const [imagePreview, setImagePreview] = useState();
  const [file, setFile] = useState(null);
  const [loginId, setLoginId] = useRecoilState(loginIdState);
  const [companyInfo, setCompanyInfo] = useState();
  const [editableInfo, setEditableInfo] = useState({});

  const editModal = useRef();
  const openEditModal = useCallback((companyInfo) => {
      const modal = new Modal(editModal.current);
      setEditableInfo(companyInfo);
      modal.show();
  }, [editModal]);
  const closeEditModal = useCallback(() => {
      const modal = Modal.getInstance(editModal.current);
      modal.hide();
  }, [editModal]);

  // 회사 정보 수정
  const handleChange = (e) => {
    const { name, value } = e.target;
    // 수정 가능한 정보 상태 업데이트
    setEditableInfo({ ...editableInfo, [name]: value });
  };

  // 저장 버튼 클릭 시
  const handleSaveInfo = async () => {
    try {
    const dataToSend = { ...editableInfo };
    const response = await axios.patch("company/edit", dataToSend);
      loadCompanyData();

      // 모달 닫기
      closeEditModal();
    } catch (error) {
      //console.error('회사 정보 업데이트 오류:', error);
    }
  };
  const loadCompanyData = useCallback(async () => {
    try {
      const resp = await axios.get('/company/info');
      setCompanyInfo(resp.data);
    } catch (error) {
      //console.error('회사 정보 불러오기 오류:', error);
    }
  }, []);

  const loadImage = async () => {
    const download = await axios.get(`/download/${loginId}`);
    console.log(download.data);
    return download.data;
};

useEffect(() => {
    const loadData = async () => {
      try {
        // 회사 정보 불러오기
        await loadCompanyData();
  
        // 이미지 불러오기
        const savedImage = await loadImage();
        if (savedImage) {
          setImagePreview(savedImage);
        } else {
          // 만약 저장된 이미지가 없다면 기본 이미지로 설정
          setImagePreview(defaultImage);
        }
      } catch (error) {
        console.error('데이터 로드 오류:', error);
        // 데이터 로드에 실패하면 기본 이미지로 설정
        setImagePreview(defaultImage);
      }
    };
  
    // 페이지가 처음 렌더링될 때 데이터 로드
    loadData();
  }, []);


  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
// 파일첨부
  const handleSave = async () => {
    try {
      if (file && file.type.startsWith('image/')) { // 이미지 파일만 허용
        const formData = new FormData();
        formData.append('attach', file);

        const response = await axios.post("/company/upload/" + loginId, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }, [loginIdState]);

        localStorage.setItem(`savedImage_${loginId}`, imagePreview);
      }
    } catch (error) {
      //console.error('파일 업로드 오류:', error);
    }
    setFile(null);
  };

// 기본 이미지 설정 함수
const setDefaultImage = () => {
  setImagePreview(defaultImage); // 이미지 미리보기를 기본 이미지로 설정
  const defaultFile = new File([defaultImage], 'defaultImage.jpg', { type: 'image/jpeg' }); // 기본 이미지에 대한 파일 객체 생성
  setFile(defaultFile); // 파일 상태를 기본 이미지 파일로 설정

};

return (
  <>
    <h1>마이페이지</h1>
    <div className="container-sm border border-5 rounded p-3 mb-3">
      <div className="row align-items-center">
        <div className="col-md-3">
          <div>
            <label htmlFor="upload" className="custom-file-upload">이미지 수정</label>
            <input type="file" onChange={handleImageChange} className="form-control form-control-sm"
              id="upload" aria-label="upload" style={{ display: 'none' }} accept='image/gif, image/jpeg, image/png, image/jpg' />
            <br />
            {imagePreview && (
              <img src={imagePreview} alt="사진 미리보기" style={{ width: '230px', height: '300px', marginBottom: '10px' }} />
            )}
          </div>
          <button onClick={setDefaultImage} className="btn btn-sm btn-secondary mt-2">기본 이미지</button>
          {file && (
            <button onClick={handleSave} className="btn btn-sm btn-primary mt-2" style={{ maxWidth: '200px', maxHeight: '200px', marginLeft: 'auto' }}>내 이미지 저장</button>
          )}
        </div>
        <div className="col-md-5">
          <button onClick={e => openEditModal(companyInfo)} className="btn btn-sm btn-secondary mb-3" style={{ marginRight: '10px' }}>회사 정보 수정</button>
          {companyInfo && (
            <table className="table">
              <tbody>
                <React.Fragment key={companyInfo.companyNo}>
                  <tr>
                    <td>회사명</td>
                    <td>{companyInfo.companyName}</td>
                  </tr>
                  <tr>
                    <td>사업자등록번호</td>
                    <td>{companyInfo.companyBn}</td>
                  </tr>
                  <tr>
                    <td>전화번호</td>
                    <td>{companyInfo.companyContact}</td>
                  </tr>
                  <tr>
                    <td>이메일</td>
                    <td>{companyInfo.companyEmail}</td>
                  </tr>
                  <tr>
                    <td>우편번호</td>
                    <td>{companyInfo.companyZipcode}</td>
                  </tr>
                  <tr>
                    <td>주소</td>
                    <td>{companyInfo.companyAddress1}</td>
                  </tr>
                  <tr>
                    <td>상세주소</td>
                    <td>{companyInfo.companyAddress2}</td>
                  </tr>
                </React.Fragment>
              </tbody>
            </table>
          )}
        </div>
        <div className="col-md-4">
          <div className="container-sm border border-5 rounded p-3 mb-3">
            <img className='calender' src={calender} alt="달력" style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
        </div>
      </div>
    </div>
    {/* <div className="container-sm border border-5 rounded p-3 mb-3">
      <div><h2>내 프로젝트 목록</h2></div>
      <br></br>
      {projects.map(project => (
        <div key={project.projectNo}>
          <Link to={`/document/project/${project.projectNo}`}>
            <p> - {project.projectName}</p>
          </Link>
        </div>
      ))}
    </div> */}
    <div ref={editModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">회사 정보 수정</h5>
            <button type="button" className="btn-close" onClick={closeEditModal}></button>
          </div>
          <div className="modal-body">
            <form>
              <div className="mb-3">
                <label htmlFor="companyName" className="form-label">회사명</label>
                <input type="text" className="form-control" 
                id="companyName" name="companyName"
                 value={editableInfo.companyName} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="companyBn" className="form-label">사업자등록번호</label>
                <input type="text" className="form-control" id="companyBn" name="companyBn" value={editableInfo.companyBn} onChange={handleChange} disabled />
              </div>
              <div className="mb-3">
                <label htmlFor="companyContact" className="form-label">전화번호</label>
                <input type="text" className="form-control" id="companyContact" name="companyContact" value={editableInfo.companyContact} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="companyEmail" className="form-label">이메일</label>
                <input type="text" className="form-control" id="companyEmail" name="companyEmail" value={editableInfo.companyEmail} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="companyZipcode" className="form-label">우편번호</label>
                <input type="text" className="form-control" id="companyZipcode" name="companyZipcode" value={editableInfo.companyZipcode} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="companyAddress1" className="form-label">주소</label>
                <input type="email" className="form-control" id="companyAddress1" name="companyAddress1" value={editableInfo.companyAddress1} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="companyAddress2" className="form-label">상세주소</label>
                <textarea className="form-control" id="companyAddress2" name="companyAddress2" value={editableInfo.companyAddress2} onChange={handleChange} />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={handleSaveInfo}>저장</button>
            <button type="button" className="btn btn-secondary" onClick={closeEditModal}>취소</button>
          </div>
        </div>
      </div>
    </div>
  </>
);
}

export default EmpCompanyInfo;