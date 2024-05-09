import { Navigate, Outlet } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isLoginState, loginLevelState } from '../utils/RecoilData';
import { useEffect, useMemo, useState } from 'react';

const AdminRoute = ({refreshLogin}) => {
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

    const isAdmin = useMemo(()=> {
        return loginLevel === '운영자'
    }, [loginLevel]);

    return (
        isLoading ? (
            <div>Loading...</div>
        ) : (
            isAdmin ? (
                <Outlet />
            ) : (
                isLogin ? (
                    <Navigate to="/NEL" />
                ) : (
                    <Navigate to="/admin/login" />
                )
            )
        )
    );
};


export default AdminRoute;