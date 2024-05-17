import React from 'react';
import { isCheckedState, isLoginState, isPaidState, loginIdState, loginLevelState } from "../../utils/RecoilData";
import { useCallback } from "react";
import { useRecoilState } from "recoil";
import axios from "../../utils/CustomAxios";

const InValid = () => {

    const [loginId, setLoginId] = useRecoilState(loginIdState);
    const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);
    const [isPaid, setIsPaid] = useRecoilState(isPaidState);
    const [isChecked, setIsChecked] = useRecoilState(isCheckedState);

    const logout = useCallback(() => {
        setLoginId('');
        setLoginLevel('');
        setIsPaid('');
        setIsChecked('');
        delete axios.defaults.headers.common['Authorization'];
        window.localStorage.removeItem("refreshToken");
    }, [loginId, loginLevel]);

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>인증 필요</h1>
                <p style={styles.message}>
                    회사의 사업자등록증이 아직 인증되지 않았습니다. 인증이 완료될 때까지 기다려 주시기 바랍니다.
                </p>
                <p style={styles.message}>
                    이미 인증을 완료하셨다면 로그아웃 후 다시 로그인을 시도하세요.
                </p>
                <p style={styles.message}>
                    문의사항이 있으시면 고객센터로 연락해 주세요.
                </p>
                <a href="mailto:maseukana43@gmail.com" style={styles.contactLink}>maseukana43@gmail.com</a>
                <br /><br />
                <p style={{ fontSize: "20px", cursor: "pointer" }} onClick={logout}>
                    <strong>로그아웃</strong>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0',
    },
    card: {
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#ffffff',
        textAlign: 'center',
    },
    title: {
        fontSize: '24px',
        marginBottom: '16px',
    },
    message: {
        fontSize: '16px',
        marginBottom: '8px',
    },
    contactLink: {
        fontSize: '16px',
        color: '#007BFF',
        textDecoration: 'none',
    }
};

export default InValid;
