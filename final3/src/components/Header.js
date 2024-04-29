//화면 상단에 배치할 메뉴(예전 navigator.jsp)

//import
import './Header.css'
import { NavLink } from "react-router-dom";
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

    return (
        <>
            <div className="row header">
                <div className="col-1">

                </div>
                <div className="col-9 text-center">
                    회사 로고 자리
                </div>
                <div className="col-2 text-center">
                    <div className="row">
                        <div className="col-6">
                            채팅
                        </div>
                        <div className='col-6'>
                        {isLogin ? (
                                        <NavLink className="dropdown-item" to="#"
                                            onClick={e => logout()}>진짜로그아웃</NavLink>
                                    ) : (
                                        <NavLink className="dropdown-item" to="/login">진짜로그인</NavLink>
                                    )}
                        </div>
                        <div className="col-6">
                        {isLogin ? (
                                <>
                                    현재 로그인 중
                                </>
                            ) : (
                                <>
                                    현재 로그아웃 중
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