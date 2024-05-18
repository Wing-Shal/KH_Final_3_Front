//화면 상단에 배치할 메뉴(예전 navigator.jsp)

//import
import './Header.css'
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { isCheckedState, isLoginState, isPaidState, loginIdState, loginLevelState } from "./utils/RecoilData";
import { useCallback } from "react";
import axios from "./utils/CustomAxios";

//function
function Header() {

    //recoil state
    const [loginId, setLoginId] = useRecoilState(loginIdState);
    const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);
    const [isPaid, setIsPaid] = useRecoilState(isPaidState);
    const [isChecked, setIsChecked] = useRecoilState(isCheckedState);

    //recoil value
    const isLogin = useRecoilValue(isLoginState);

    //callback
    const logout = useCallback(() => {
        //recoil 저장소에 대한 정리 + axios의 헤더 제거 + localStorage 청소
        setLoginId('');
        setLoginLevel('');
        setIsPaid('');
        setIsChecked('');
        delete axios.defaults.headers.common['Authorization'];
        window.localStorage.removeItem("refreshToken");
    }, [loginId, loginLevel]);

    return (
        <>
            <div className="row header">
                <div className="col-8 text-center">
                    
                </div>
                <div className="col-2 text-center">
                    <div className="row">
                        <div className='col-4'>
                            {isLogin && (
                                <>
                                    <NavLink className="dropdown-item" to="#" onClick={e => logout()}>로그아웃</NavLink>
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