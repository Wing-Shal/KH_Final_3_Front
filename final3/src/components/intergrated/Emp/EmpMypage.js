import React, { useState, useEffect } from 'react';
import axios from "../../utils/CustomAxios";
import { loginIdState } from '../../utils/RecoilData';
import { useRecoilState } from 'recoil';
import calender from "../../../assets/calender.png";
import { Link } from 'react-router-dom';

function EmpMypage() {
  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loginId, setLoginId] = useRecoilState(loginIdState);
  const [projects, setProjects] = useState([]); // 프로젝트 목록 상태 추가
  const [empInfo, setEmpInfo] = useState(null); // 사원 정보 추가
  const [showModal, setShowModal] = useState(false);

  // 모달 열기
  const openModal = () => {
    setShowModal(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
  };


  useEffect(() => {
    loadProjects(); // 프로젝트 목록 불러오기
    loadEmpData(); // 사원 정보 불러오기

    // 페이지가 렌더링될 때 로컬 스토리지에서 이미지를 가져와서 설정
    const savedImage = localStorage.getItem('savedImage');
    if (savedImage) {
      setImagePreview(savedImage);
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
        localStorage.setItem('savedImage', reader.result);
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

  return (
    <>
      <h1>마이페이지</h1>
      <div className="container-sm border border-5 rounded p-3 mb-3">
        <div className="row align-items-center">
          {/* 사진 첨부 파일 */}
          <div className="col-md-3">
            <div>
              <input type="file" onChange={handleImageChange} className="form-control form-control-sm"
                id="upload" aria-label="upload" style={{ maxWidth: '200px', maxHeight: '200px' }} />
              <br />
              {imagePreview && (
                <img src={imagePreview} alt="사진 미리보기" style={{ maxWidth: '200px', maxHeight: '200px', marginBottom: '10px' }} />
              )}
            </div>
            <br />
            <button onClick={handleSave} className="btn btn-sm btn-primary" style={{ maxWidth: '200px', maxHeight: '200px', marginLeft: '10px' }}>저장</button>
          </div>
  
          {/* 개인 정보 */}
          <div className="col-md-5">
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
            <img className='calender' src={ calender } alt="달력" style={{ maxWidth: '100%', height: 'auto' }} />
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
          <div>
            <Link to={`/document/project/:${project.projectNo}`}>
            <p> - {project.projectName}</p>
              </Link>
          </div>
        ))}
      </div>
    </>
  );

  
  
  
}

export default EmpMypage;