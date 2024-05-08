import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isLoginState, isPaidState, loginLevelState } from '../utils/RecoilData';
import { useEffect, useMemo, useState } from 'react';

const LoginRoute = ({refreshLogin}) => {
    const location = useLocation();
    const isAdminPath = location.pathname.includes("admin");
    const isLoginPath = location.pathname.includes("login");
    const isPurchasePath = location.pathname.includes("purchase");

    const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);
    const [isPaid, setIsPaid] = useRecoilState(isPaidState);
    const isLogin = useRecoilValue(isLoginState);
    const [isLoading, setIsLoading] = useState(true);

    const checkPaid = useMemo(()=> {
        return loginLevel === '운영자' || isPaid === 'ACTIVE'
    }, [isPaid]);

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
                checkPaid || isLoginPath || isPurchasePath ? (
                    <>
                        <Outlet />
                    </>
                ) : (
                    <>
                        <Navigate to="/kakaopay/purchaseTest" />
                    </>
                )
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