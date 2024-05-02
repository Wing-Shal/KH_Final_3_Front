import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isLoginState, loginLevelState } from '../utils/RecoilData';
import { useEffect, useMemo, useState } from 'react';

const LoginRoute = ({refreshLogin}) => {
    const location = useLocation();
    const isAdminPath = location.pathname.includes("admin");
    const isLoginPath = location.pathname.includes("login");

    const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);
    const isLogin = useRecoilValue(isLoginState);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(()=> {
        const load = async ()=> {
            await refreshLogin();
            setIsLoading(false);
        };
        load();
    }, [refreshLogin]);
    
    return (
        isLoading ? (
            <div>Loading...</div>
        ) : (
            (isLogin || isLoginPath) ? (
                <Outlet />
            ) : (
                isAdminPath ? (
                    <Navigate to="/admin/login" />
                ) : (
                    <Navigate to="/login" />
                )
            )
        )
    );
};


export default LoginRoute;