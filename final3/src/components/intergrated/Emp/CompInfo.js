import React, { useState, useEffect, useCallback } from 'react';
import axios from "../../utils/CustomAxios";
import { loginIdState } from '../../utils/RecoilData';
import { useRecoilState } from 'recoil';
import calender from "../../../assets/calender.png";
import defaultImage from "../../../assets/CompanyLogo.jpg"; // 기본 이미지 경로를 추가해주세요
import '../Company/Mypage.css';

function CompInfo() {
  const [image, setImage] = useState(defaultImage); // 기본 이미지로 초기화
  const [loginId] = useRecoilState(loginIdState);
  const [companyInfo, setCompanyInfo] = useState();

  const loadCompanyData = useCallback(async () => {
    try {
      const resp = await axios.get('/company/info');
      setCompanyInfo(resp.data);
    } catch (error) {
      console.error('회사 정보 불러오기 오류:', error);
    }
  }, [companyInfo]);

  const loadAttachNo = useCallback(async () => {
      const resp = await axios.get('/emp/company/image');
      const attachNo = resp.data;

      if (attachNo) {
        setImage(`http://localhost:8080/download/${attachNo}`);
      } else {
        setImage(defaultImage);
      }
  }, []);

  useEffect(() => {
    loadCompanyData();
    loadAttachNo(); // 이미지 불러오기
  }, []);

  return (
    <>
      <h1>마이페이지</h1>
      <div className="container-sm border border-5 rounded p-3 mb-3">
        <div className="row align-items-center">
          <div className="col-md-3">
            <div>
              {loginId && (
                <img
                  src={image}
                  alt="사진 미리보기"
                  style={{ width: '230px', height: '300px', marginBottom: '10px' }}
                  onError={(e) => { e.target.src = defaultImage; }} // 이미지 로드 실패 시 기본 이미지로 대체
                />
              )}
            </div>
          </div>
          {companyInfo && (
            <div className="col-md-5">
              <table className="table">
                <tbody>
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
                </tbody>
              </table>
            </div>
          )}
          <div className="col-md-4">
            <div className="container-sm border border-5 rounded p-3 mb-3">
              <img className='calender' src={calender} alt="달력" style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CompInfo;
