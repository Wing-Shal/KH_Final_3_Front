    import { Navigate, Outlet, useLocation } from 'react-router-dom';
    import { useRecoilState, useRecoilValue } from 'recoil';
    import { isCheckedState, isLoginState, isPaidState, loginLevelState } from '../utils/RecoilData';
    import { useEffect, useMemo, useState } from 'react';

    const LoginRoute = ({ refreshLogin }) => {
        const location = useLocation();
        const isAdminPath = location.pathname.includes("admin");
        const isLoginPath = location.pathname.includes("login");
        const isPurchasePath = location.pathname.includes("purchase");
        const isJoinPath = location.pathname.includes("join");
        const isInvalidPath = location.pathname.includes("invalid");

        const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);
        const [isPaid, setIsPaid] = useRecoilState(isPaidState);
        const [isChecked, setIsChecked] = useRecoilState(isCheckedState);
        const isLogin = useRecoilValue(isLoginState);
        const [isLoading, setIsLoading] = useState(true);

        const checkPaid = useMemo(() => {
            return loginLevel === '운영자' || isPaid === 'ACTIVE';
        }, [isPaid, loginLevel]);

        const isCompany = useMemo(() => {
            return loginLevel === '회사';
        }, [loginLevel]);

        const isInValid = useMemo(() => {
            return isChecked === 'UnChecked';
        }, [isChecked]);


        useEffect(() => {
            const load = async () => {
                await refreshLogin();
                setIsLoading(false);
            };
            load();
        }, [refreshLogin]);

        // 로딩 상태 확인: isLoading이 참일 경우, "Loading..." 메시지를 표시합니다.
        // 로그인 상태 확인: isLogin이 참일 경우, 추가 조건을 검사합니다.
        // 결제 확인: checkPaid, isLoginPath, isJoinPath, isPurchasePath 중 하나라도 참이면 <Outlet />을 렌더링합니다.
        // 회사 계정 확인: isCompany가 참일 경우, "/kakaopay/purchaseTest"로 리디렉션합니다.
        // 그 외의 경우: /NEL로 리디렉션합니다.(권한없음)
        // 로그인 상태가 아닌 경우: isAdminPath가 참이면 관리자 로그인 페이지("/admin/login")로, 그렇지 않으면 일반 로그인 페이지("/login")로 리디렉션합니다.
        return (
            isLoading ? (
                <div>Loading...</div>
            ) : (
                !isLogin ? (
                    isLoginPath || isJoinPath? (
                        <Outlet />
                    ) : (
                        isAdminPath ? (
                            <Navigate to="/admin/login" />
                        ) : (
                            <Navigate to="/login" />
                        )
                    )
                ): (
                    isInValid ? (
                        isInvalidPath ? (
                            <Outlet />
                        ) : (
                            <Navigate to="/company/invalid" />
                        )
                    ) : (
                        checkPaid || isPurchasePath ? (
                            <Outlet />
                        ) : (
                            isCompany ? (
                                <Navigate to="/kakaopay/purchase" />
                            ) : (
                                <Navigate to="/NEL" />
                            )
                        )
                    )
                )
        )
    )
};
    export default LoginRoute;