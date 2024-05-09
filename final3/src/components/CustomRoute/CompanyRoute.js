import { Navigate, Outlet } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isLoginState, loginLevelState } from '../utils/RecoilData';
import { useEffect, useMemo, useState } from 'react';

const CompanyRoute = ({refreshLogin}) => {
    const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);
    const [isLoading, setIsLoading] = useState(true);
    const isLogin = useRecoilValue(isLoginState);
    

    useEffect(()=> {
        const load = async ()=> {
            await refreshLogin();
            setIsLoading(false);
        };
        load();
    }, [refreshLogin]);

    const isCompany= useMemo(()=> {
        return loginLevel === '회사'
    }, [loginLevel]);

    return (
        isLoading ? (
            <div>Loading...</div>
        ) : (
            isCompany ? (
                <Outlet />
            ) : (
                isLogin ? (
                    <Navigate to="/NEL" />
                ) : (
                    <Navigate to="/login" />
                )
            )
        )
    );
};


export default CompanyRoute;