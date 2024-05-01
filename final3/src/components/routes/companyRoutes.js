// companyRoutes.js

const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// 회원가입 API 엔드포인트
router.post('/register', async (req, res) => {
    try {
        // 회원가입 폼에서 받은 데이터 추출
        const { companyPw, companyName, companyBn, companyContact, companyEmail, companyZipcode, companyAddress1, companyAddress2 } = req.body;

        // 데이터베이스에 회사 정보 저장
        const newCompany = new Company({
            companyPw,
            companyName,
            companyBn,
            companyContact,
            companyEmail,
            companyZipcode,
            companyAddress1,
            companyAddress2
        });
        await newCompany.save();

        // 회원가입 성공 응답
        res.status(200).json({ success: true, message: "회원가입이 완료되었습니다." });
    } catch (error) {
        // 회원가입 실패 응답
        console.error("Error registering company:", error);
        res.status(500).json({ success: false, message: "회원가입 도중 오류가 발생했습니다." });
    }
});

module.exports = router;
