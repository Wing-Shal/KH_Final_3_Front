import React, { useState, useEffect } from 'react';
import axios from "../../utils/CustomAxios";
import { loginIdState } from '../../utils/RecoilData';
import { useRecoilState } from 'recoil';
import calender from "../../../assets/calender.png";
import defaultImage from "../../../assets/user.png"; // 기본 이미지 경로를 추가해주세요
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
  const [editableInfo, setEditableInfo] = useState(null);

  // 모달 열기
  const openModal = () => {
    // 모달이 열릴 때마다 현재 empInfo를 기반으로 editableInfo 설정
    setEditableInfo({ ...empInfo });
    setShowModal(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
  };

  // 정보 수정
  const handleChange = (e) => {
    const { name, value } = e.target;
    // 수정 가능한 정보 상태 업데이트
    setEditableInfo({ ...editableInfo, [name]: value });
  };

  // 저장 버튼 클릭 시
  const handleSaveInfo = async () => {
    try {
      const url = `/emp/edit`;

      // 수정된 정보를 서버로 전송
      const response = await axios.patch(url, editableInfo);
      console.log('사원 정보 업데이트 결과:', response.data);
      // 모달 닫기
      closeModal();
      // 업데이트된 정보를 화면에 반영
      setEmpInfo(editableInfo);
    } catch (error) {
      console.error('사원 정보 업데이트 오류:', error);
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
      const token = axios.defaults.headers.common['Authorization'];
      const resp = await axios.get(`emp/${token}`);
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
        localStorage.setItem(`savedImage_${loginId}`, reader.result);
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
      } else {
        console.log('파일이 선택되지 않았습니다.');
      }
    } catch (error) {
      console.error('파일 업로드 오류:', error);
    }
  };

  // 기본 이미지 설정 함수
  const setDefaultImage = () => {
    setImagePreview(defaultImage);
    setFile(null); // 이미지 파일을 선택한 것이 아니므로 파일 상태를 초기화합니다.
  };

  return (
    <>
      <h1>마이페이지</h1>
      <div className="container-sm border border-5 rounded p-3 mb-3">
        <div className="row align-items-center">
          {/* 사진 첨부 파일 */}
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

            {/* 기본 이미지 버튼 */}
            <button onClick={setDefaultImage} className="btn btn-sm btn-secondary mt-2">기본 이미지</button>

            {/* 이미지가 선택되었을 때만 저장 버튼이 활성화되도록 설정 */}
            {file && (
              <button onClick={handleSave} className="btn btn-sm btn-primary mt-2" style={{ maxWidth: '200px', maxHeight: '200px', marginLeft: 'auto' }}>내 이미지 저장</button>
            )}
          </div>

          {/* 개인 정보 */}
          <div className="col-md-5">
            <button onClick={openModal} className="btn btn-sm btn-secondary mb-3">내 정보 수정</button>
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

          {/* 달력 이미지 */}
          <div className="col-md-4">
            <div className="container-sm border border-5 rounded p-3 mb-3">
              <img className='calender' src={calender} alt="달력" style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 프로젝트 목록 */}
      <div className="container-sm border border-5 rounded p-3 mb-3">
        {/* 프로젝트 목록 렌더링 */}
        <div><h2>내 프로젝트 목록</h2></div>
        <br></br>
        {projects.map(project => (
          <div key={project.projectNo}>
            <Link to={`/document/project/${project.projectNo}`}>
              <p> - {project.projectName}</p>
            </Link>
          </div>
        ))}
      </div>

      {/* 내 정보 수정 모달 */}
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
              <button type="button" className="btn btn-primary" onClick={handleSaveInfo}>저장</button>
              <button type="button" className="btn btn-secondary" onClick={closeModal}>취소</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EmpMypage;
