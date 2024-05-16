import React, { useState, useEffect } from 'react';
import axios from "../../utils/CustomAxios";
import { loginIdState } from '../../utils/RecoilData';
import { useRecoilState } from 'recoil';
import calender from "../../../assets/calender.png";
import defaultImage from "../../../assets/CompanyLogo.jpg"; // 기본 이미지 경로를 추가해주세요
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // React Bootstrap의 CSS를 불러옴
import 'bootstrap/dist/js/bootstrap.bundle.min'; // React Bootstrap의 JavaScript를 불러옴
import './Mypage.css';

function CompanyMypage() {
  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loginId, setLoginId] = useRecoilState(loginIdState);
  const [projects, setProjects] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editableInfo, setEditableInfo] = useState(null);

  // 모달 열기
  const openModal = () => {
    // 모달이 열릴 때마다 현재 companyInfo를 기반으로 editableInfo 설정
    setEditableInfo({ ...companyInfo });
    setShowModal(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
  };

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
      console.log('회사 정보 업데이트 결과:', response.data);
      // 모달 닫기
      closeModal();
      // 업데이트된 정보를 화면에 반영
      setCompanyInfo(editableInfo);
    } catch (error) {
      console.error('회사 정보 업데이트 오류:', error);
    }
  };

  useEffect(() => {
    // loadProjects();
    loadCompanyData();

    // 페이지가 렌더링될 때 로컬 스토리지에서 이미지를 가져와서 설정
    const savedImage = localStorage.getItem(`savedImage_${loginId}`);
    if (savedImage) {
      setImagePreview(savedImage);
    } else {
      // 만약 저장된 이미지가 없다면 기본 이미지로 설정
      setImagePreview(defaultImage);
    }
  }, []);

  const loadCompanyData = async () => {
    try {
      const resp = await axios.get('/company/');
      console.log(resp.data);
      setCompanyInfo(resp.data);
    } catch (error) {
      console.error('회사 정보 불러오기 오류:', error);
    }
  };

//   const loadProjects = async () => {
//     try {
//       const empNo = loginId;
//       const resp = await axios.get("/project/" + empNo);
//       setProjects(resp.data);
//       console.log(resp.data);
//     } catch (error) {
//       console.error('프로젝트 목록 불러오기 오류:', error);
//     }
//   };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // 이미지를 선택한 후 로컬 스토리지에 저장
        // localStorage.setItem(`savedImage_${loginId}`, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
// 파일첨부
  const handleSave = async () => {
    try {
      if (file) {
        const formData = new FormData();
        formData.append('attach', file);

        const response = await axios.post("/company/upload/" + loginId, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }, [loginIdState]);
        console.log('파일 업로드 결과:', response.data);

        console.log('DB에 저장되었습니다.');
        // 이미지를 선택한 후 로컬 스토리지에 저장
        localStorage.setItem(`savedImage_${loginId}`, imagePreview);
      } else {
        console.log('파일이 선택되지 않았습니다.');
      }
    } catch (error) {
      console.error('파일 업로드 오류:', error);
    }
    setFile(null);
  };

// 기본 이미지 설정 함수
const setDefaultImage = () => {
  setImagePreview(defaultImage); // 이미지 미리보기를 기본 이미지로 설정
  const defaultFile = new File([defaultImage], 'defaultImage.jpg', { type: 'image/jpeg' }); // 기본 이미지에 대한 파일 객체 생성
  setFile(defaultFile); // 파일 상태를 기본 이미지 파일로 설정

  // 기본 이미지를 로컬 스토리지에 저장
  // localStorage.setItem(`savedImage_${loginId}`, defaultImage);
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
              id="upload" aria-label="upload" style={{ display: 'none' }} />
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
          <button onClick={openModal} className="btn btn-sm btn-secondary mb-3" style={{ marginRight: '10px' }}>회사 정보 수정</button>
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
    <div className={`modal ${showModal ? 'show' : ''}`} tabIndex="-1" style={{ display: showModal ? 'block' : 'none' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">회사 정보 수정</h5>
            <button type="button" className="btn-close" onClick={closeModal}></button>
          </div>
          <div className="modal-body">
            <form>
              <div className="mb-3">
                <label htmlFor="companyName" className="form-label">회사명</label>
                <input type="text" className="form-control" id="companyName" name="companyName" value={editableInfo?.companyName || ''} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="companyBn" className="form-label">사업자등록번호</label>
                <input type="text" className="form-control" id="companyBn" name="companyBn" value={editableInfo?.companyBn || ''} onChange={handleChange} disabled />
              </div>
              <div className="mb-3">
                <label htmlFor="companyContact" className="form-label">전화번호</label>
                <input type="text" className="form-control" id="companyContact" name="companyContact" value={editableInfo?.companyContact || ''} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="companyEmail" className="form-label">이메일</label>
                <input type="text" className="form-control" id="companyEmail" name="companyEmail" value={editableInfo?.companyEmail || ''} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="companyZipcode" className="form-label">우편번호</label>
                <input type="text" className="form-control" id="companyZipcode" name="companyZipcode" value={editableInfo?.companyZipcode || ''} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="companyAddress1" className="form-label">주소</label>
                <input type="email" className="form-control" id="companyAddress1" name="companyAddress1" value={editableInfo?.companyAddress1 || ''} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="companyAddress2" className="form-label">상세주소</label>
                <textarea className="form-control" id="companyAddress2" name="companyAddress2" value={editableInfo?.companyAddress2 || ''} onChange={handleChange} />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={handleSaveInfo}>저장</button>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>취소</button>
          </div>
        </div>
      </div>
    </div>
  </>
);
}

export default CompanyMypage;