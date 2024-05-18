import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPage.css';
import { loginLevelState } from './utils/RecoilData';
import { useRecoilState } from 'recoil';

const ErrorPage = () => {
  const navigate = useNavigate();

  const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);  

  const handleGoMain = () => {
    switch (loginLevel) {
      case '운영자': navigate('/admin/home'); break;
      case '회사': navigate('/company/mypage'); break;
      default: navigate('/emp/mypage'); break;
    }
  };

  return (
    <div className="error-container">
      <h1>404 - Page Not Found</h1>
      <p>페이지를 찾을 수 없습니다.</p>
      <button onClick={handleGoMain} className="btn btn-secondary">
        메인페이지로 이동
      </button>
    </div>
  );
};

export default ErrorPage;