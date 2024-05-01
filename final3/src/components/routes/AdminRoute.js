import React, { Component } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isLoginState, loginIdState, loginLevelState } from '../utils/RecoilData';
import AdminCompany from '../intergrated/Admin/AdminCompany';

const AdminRoute = ({element}) => {
    const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);
    const isLogin = useRecoilValue(isLoginState);
    const isAdmin = isLogin && loginLevel === '운영자';

    return isAdmin ? <AdminCompany /> : <Navigate to="/admin/login" />;
};


export default AdminRoute;