//화면 상단에 배치할 메뉴(예전 navigator.jsp)

//import
import './Header.css'
import { NavLink, useLocation } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { isLoginState, loginIdState, loginLevelState } from "./utils/RecoilData";
import { useCallback } from "react";
import axios from "./utils/CustomAxios";

//function
function Header() {

        //recoil state
        const [loginId, setLoginId] = useRecoilState(loginIdState);
        const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);
    
        //recoil value
        const isLogin = useRecoilValue(isLoginState);
    
        //callback
        const logout = useCallback(() => {
            //recoil 저장소에 대한 정리 + axios의 헤더 제거 + localStorage 청소
            setLoginId('');
            setLoginLevel('');
            delete axios.defaults.headers.common['Authorization'];
            window.localStorage.removeItem("refreshToken");
        }, [loginId, loginLevel]);
        
        //현재 주소
        const location = useLocation();
        //운영자 주소인지 확인
        const isAdminPath = location.pathname.startsWith('/admin');
        //동적 할당
        const targetPath = isAdminPath ? '/' : '/admin/home';
        const linkText = loginLevel === '운영자' && ( isAdminPath ? '메인으로' : '운영자 홈으로' );

    return (
        <>
            <div className="row header">
                <div className="col-2 text-end">
                    <NavLink className="dropdown-item" to={targetPath}>{linkText}</NavLink>
                </div>
                <div className="col-8 text-center">
                    회사 로고 자리
                </div>
                <div className="col-2 text-center">
                    <div className="row">
                        <div className="col-4">
                            채팅
                        </div>
                        <div className="col-4">
                        <NavLink className="dropdown-item" to="/company/join">회원가입</NavLink>
                        </div>
                        <div className='col-4'>
                        
                        {isLogin ? (
                            <>
                                <NavLink className="dropdown-item" to="#" onClick={e => logout()}>로그아웃</NavLink>
                            </>
                        ) : (
                            <>
                                <NavLink className="dropdown-item" to="/login">로그인</NavLink>
                            </>
                        )}
                    
                        </div>
                        

                        
                    </div>
                </div>
            </div>
        </>
    );


    
}

//export
export default Header;