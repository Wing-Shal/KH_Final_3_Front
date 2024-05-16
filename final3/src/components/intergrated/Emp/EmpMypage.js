import React, { useState, useEffect } from 'react';
import axios from "../../utils/CustomAxios";
import { loginIdState } from '../../utils/RecoilData';
import { useRecoilState } from 'recoil';
import calender from "../../../assets/calender.png";
import defaultImage from "../../../assets/userImage.png"; // 기본 이미지 경로를 추가해주세요
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // React Bootstrap의 CSS를 불러옴
import 'bootstrap/dist/js/bootstrap.bundle.min'; // React Bootstrap의 JavaScript를 불러옴
import './EmpMypage.css';

function EmpMypage() {
  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loginId, setLoginId] = useRecoilState(loginIdState);
  const [projects, setProjects] = useState([]);
  const [empInfo, setEmpInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [editableInfo, setEditableInfo] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 모달 열기
  const openModal = () => {
    // 모달이 열릴 때마다 현재 empInfo를 기반으로 editableInfo 설정
    setEditableInfo({ ...empInfo });
    setShowModal(true);
  };

    // 모달 열기
    const openPwModal = () => {
      // 모달이 열릴 때마다 현재 empInfo를 기반으로 editableInfo 설정
      setEditableInfo({ ...empInfo });
      setShowPwModal(true);
    };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
  };

  const closePwModal = () => {
    setShowPwModal(false);
    // 모달이 닫힐 때 입력된 비밀번호들 초기화
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordError('');
  };

  // 정보 수정
  const handleChange = (e) => {
    const { name, value } = e.target;
    // 수정 가능한 정보 상태 업데이트
    setEditableInfo({ ...editableInfo, [name]: value });
  };

  const handleCurrentPasswordChange = (e) => {
    setCurrentPassword(e.target.value);
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmNewPasswordChange = (e) => {
    setConfirmNewPassword(e.target.value);
  };

  // 저장 버튼 클릭 시
  const handleSaveInfo = async () => {
    try {
    const dataToSend = { ...editableInfo };
    const response = await axios.patch("emp/edit", dataToSend);
      console.log('사원 정보 업데이트 결과:', response.data);
      // 모달 닫기
      closeModal();
      // 업데이트된 정보를 화면에 반영
      setEmpInfo(editableInfo);
    } catch (error) {
      console.error('사원 정보 업데이트 오류:', error);
    }
  };

  const handleSavePassword = async () => {
    try {
      // 현재 비밀번호가 empPw와 일치하지 않은 경우
    if (currentPassword !== empInfo.empPw) {
      setPasswordError('현재 비밀번호가 일치하지 않습니다.');
      return;
    }
      if (currentPassword === '') {
        setPasswordError('현재 비밀번호를 입력해주세요.');
        return;
      }
      if (newPassword === '') {
        setPasswordError('새로운 비밀번호를 입력해주세요.');
        return;
      } 
      if (confirmNewPassword === '') {
        setPasswordError('비밀번호 확인을 입력해주세요.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setPasswordError('새로운 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }
      if (newPassword === currentPassword) {
        setPasswordError('현재 비밀번호와 변경할 비밀번호가 동일합니다');
        return;
      }
      const dataToSend = {
        empNo: empInfo.empNo,
        currentPassword: currentPassword,
        empPw: newPassword
      };
      const response = await axios.patch("/emp/edit", dataToSend);
      console.log('비밀번호 변경 결과:', response.data);
      closePwModal();
      // 비밀번호 변경이 완료되었다는 알람 표시
    alert('비밀번호 변경이 완료되었습니다.');
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      setPasswordError('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };


  useEffect(() => {
    loadProjects();
    loadEmpData();

    // 페이지가 렌더링될 때 로컬 스토리지에서 이미지를 가져와서 설정
    const savedImage = localStorage.getItem(`savedImage_${loginId}`);
    if (savedImage) {
      setImagePreview(savedImage);
    } else {
      // 만약 저장된 이미지가 없다면 기본 이미지로 설정
      setImagePreview(defaultImage);
    }
  }, []);

  const loadEmpData = async () => {
    try {
      const resp = await axios.get('/emp/');
      console.log(resp.data);
      setEmpInfo(resp.data);
    } catch (error) {
      console.error('사원 정보 불러오기 오류:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const empNo = loginId;
      const resp = await axios.get("/project/" + empNo);
      setProjects(resp.data);
      console.log(resp.data);
    } catch (error) {
      console.error('프로젝트 목록 불러오기 오류:', error);
    }
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // 이미지를 선택한 후 로컬 스토리지에 저장
        //localStorage.setItem(`savedImage_${loginId}`, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      if (file) {
        const formData = new FormData();
        formData.append('attach', file);

        const response = await axios.post("/emp/upload/" + loginId, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }, [loginIdState]);
        console.log('파일 업로드 결과:', response.data);

        console.log('DB에 저장되었습니다.');
        // 기본 이미지를 로컬 스토리지에 저장
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
  //localStorage.setItem(`savedImage_${loginId}`, defaultImage);
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
              <img src={imagePreview} alt="사진 미리보기" style={{ width: '260px', height: '270px', marginBottom: '10px', marginTop: '15px' }} />
            )}
          </div>
          <button onClick={setDefaultImage} className="btn btn-sm btn-secondary mt-2">기본 이미지</button>
          {file && (
            <button onClick={handleSave} className="btn btn-sm btn-primary mt-2" style={{ maxWidth: '200px', maxHeight: '200px', marginLeft: 'auto' }}>내 이미지 저장</button>
          )}
        </div>
        <div className="col-md-5">
          <button onClick={openModal} className="btn btn-sm btn-secondary mb-3" style={{ marginRight: '10px' }}>내 정보 수정</button>
          <button onClick={openPwModal} className="btn btn-sm btn-secondary mb-3">비밀번호 변경</button>
          {empInfo && (
            <table className="table">
              <tbody>
                <React.Fragment key={empInfo.empNo}>
                  <tr>
                    <td>사원명</td>
                    <td>{empInfo.empName}</td>
                  </tr>
                  <tr>
                    <td>사원번호</td>
                    <td>{empInfo.empNo}</td>
                  </tr>
                  <tr>
                    <td>소속부서</td>
                    <td>{empInfo.empDept}</td>
                  </tr>
                  <tr>
                    <td>연락처</td>
                    <td>{empInfo.empContact}</td>
                  </tr>
                  <tr>
                    <td>이메일</td>
                    <td>{empInfo.empEmail}</td>
                  </tr>
                  <tr>
                    <td>자기소개</td>
                    <td>{empInfo.empPr}</td>
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

    <div className="container-sm border border-5 rounded p-3 mb-3">
    {projects.map(project => (
  <div key={project.projectNo} className="mb-2">
    <Link to={`/document/project/${project.projectNo}`} style={{ textDecoration: 'none' }}>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title" style={{ color: '#FFC0CB' }}>{project.projectName}</h5>
          <p className="card-text">프로젝트 설명 또는 추가 정보</p>
        </div>
      </div>
    </Link>
  </div>
))}
  </div>


    <div className={`modal ${showModal ? 'show' : ''}`} tabIndex="-1" style={{ display: showModal ? 'block' : 'none' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">내 정보 수정</h5>
            <button type="button" className="btn-close" onClick={closeModal}></button>
          </div>
          <div className="modal-body">
            <form>
              <div className="mb-3">
                <label htmlFor="empName" className="form-label">사원명</label>
                <input type="text" className="form-control" id="empName" name="empName" value={editableInfo?.empName || ''} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="empNo" className="form-label">사원번호</label>
                <input type="text" className="form-control" id="empNo" name="empNo" value={editableInfo?.empNo || ''} onChange={handleChange} disabled />
              </div>
              <div className="mb-3">
                <label htmlFor="empDept" className="form-label">소속부서</label>
                <input type="text" className="form-control" id="empDept" name="empDept" value={editableInfo?.empDept || ''} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="empContact" className="form-label">연락처</label>
                <input type="text" className="form-control" id="empContact" name="empContact" value={editableInfo?.empContact || ''} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="empEmail" className="form-label">이메일</label>
                <input type="email" className="form-control" id="empEmail" name="empEmail" value={editableInfo?.empEmail || ''} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="empPr" className="form-label">자기소개</label>
                <textarea className="form-control" id="empPr" name="empPr" value={editableInfo?.empPr || ''} onChange={handleChange} />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={handleSaveInfo}>수정</button>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>취소</button>
          </div>
        </div>
      </div>
    </div>
    <div className={`modal ${showPwModal ? 'show' : ''}`} tabIndex="-1" style={{ display: showPwModal ? 'block' : 'none' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">비밀번호 변경</h5>
            <button type="button" className="btn-close" onClick={closePwModal}></button>
          </div>
          <div className="modal-body">
            <form>
              <div className="mb-3">
                <label htmlFor="currentPassword" className="form-label">현재 비밀번호</label>
                <input type="password" className="form-control" id="currentPassword" name="currentPassword" value={currentPassword} onChange={handleCurrentPasswordChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">새로운 비밀번호</label>
                <input type="password" className="form-control" id="newPassword" name="newPassword" value={newPassword} onChange={handleNewPasswordChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="confirmNewPassword" className="form-label">비밀번호 확인</label>
                <input type="password" className="form-control" id="confirmNewPassword" name="confirmNewPassword" value={confirmNewPassword} onChange={handleConfirmNewPasswordChange} />
              </div>
              {passwordError && (
                <div className="alert alert-danger" role="alert">
                  {passwordError}
                </div>
              )}
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={handleSavePassword}>변경</button>
            <button type="button" className="btn btn-secondary" onClick={closePwModal}>취소</button>
          </div>
        </div>
      </div>
    </div>
  </>
);
}

export default EmpMypage;