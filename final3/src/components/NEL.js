import React, { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import Logo from '../assets/PlanetLogo.png';
import { isCheckedState, isPaidState, loginIdState, loginLevelState } from './utils/RecoilData';
import axios from '../components/utils/CustomAxios';
import './NEL.css'; // 추가: CSS 파일 임포트

function NEL() {
    // const goBack = () => {
    //     window.history.back();
    // };

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
        <div className="nel-container">
            <img src={Logo} alt="Logo" className="nel-logo" />
            <h1>권한 부족</h1>
            <p>죄송합니다. 이 페이지에 접근할 수 있는 권한이 없습니다.</p>
            {/* <button className='btn btn-primary logout-btn' onClick={goBack}>이전으로</button> */}
            <button className='btn btn-secondary logout-btn' onClick={logout}>로그아웃</button>
        </div>
    );
}

export default NEL;