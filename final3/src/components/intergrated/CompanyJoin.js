import React, { useState } from 'react';
//import axios from "axios";//기본 라이브러리
import axios from "../utils/CustomAxios";//개조 라이브러리

const CompanyJoin = () => {
    const [formData, setFormData] = useState({
        companyPw: '',
        companyName: '',
        companyBn: '',
        companyContact: '',
        companyEmail: '',
        companyZipcode: '',
        companyAddress1: '',
        companyAddress2: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/company/register", formData); // 회원가입 API 요청
            console.log(response.data); // API 요청 결과 확인
            // 회원가입 성공 후 다음 작업 수행
        } catch (error) {
            console.error("Error registering company:", error);
            // 회원가입 실패 시 처리
        }
    };
    

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="companyPw" value={formData.companyPw} onChange={handleChange} placeholder="비밀번호" />
            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="회사명" />
            <input type="text" name="companyBn" value={formData.companyBn} onChange={handleChange} placeholder="사업자번호" />
            <input type="text" name="companyContact" value={formData.companyContact} onChange={handleChange} placeholder="전화번호" />
            <input type="text" name="companyEmail" value={formData.companyEmail} onChange={handleChange} placeholder="이메일" />
            <input type="text" name="companyZipcode" value={formData.companyZipcode} onChange={handleChange} placeholder="우편번호" />
            <input type="text" name="companyAddress1" value={formData.companyAddress1} onChange={handleChange} placeholder="주소1" />
            <input type="text" name="companyAddress2" value={formData.companyAddress2} onChange={handleChange} placeholder="주소2" />
            <button type="submit">회원가입</button>
        </form>
    );
};

export default CompanyJoin;
