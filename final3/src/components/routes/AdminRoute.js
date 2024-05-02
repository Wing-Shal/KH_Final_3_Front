import { Navigate, Outlet } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { loginLevelState } from '../utils/RecoilData';
import { useEffect, useMemo, useState } from 'react';

const AdminRoute = ({refreshLogin}) => {
    const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);
    const [isLoading, setIsLoading] = useState(true);
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
                <Navigate to="/admin/login" />
            )
        )
    );
};


export default AdminRoute;