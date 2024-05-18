import {
    Menu,
    MenuItem,
    Sidebar,
    SubMenu,
    sidebarClasses,
    menuClasses,
} from "react-pro-sidebar";

import { Link} from 'react-router-dom';
import { isCheckedState, isPaidState, loginIdState, loginLevelState } from "../utils/RecoilData";
import { useRecoilState} from "recoil";
import { useCallback } from "react";
import axios from "../utils/CustomAxios";
import Logo from "../../assets/PlanetLogo.png";
import './Sidebar.css';

const basicTheme = {
    sidebar: {
        backgroundColor: "#FFC0CB",
        height: "1000px",
    },
    menu: {
        menuContent: "#FFFFFF",
        hover: {
            backgroundColor: "#F8F9FA",
            color: "#1E90FF"
        },
    },
    subMenu: {
        menuContent: "#FFFFFF",
        hover: {
            backgroundColor: "#F8F9FA",
            color: "#1E90FF"
        },
    }
}

const SideBar = () => {

    const sidebarStyles = {
        height: '1000px',

    }
    const menuItemStyles = {
        root: {
            fontSize: '15px',
            backgroundColor: basicTheme.menu.menuContent
        },
        button: {
            '&:hover': {
                backgroundColor: basicTheme.menu.hover.backgroundColor,
                color: basicTheme.menu.hover.color
            }
        }
    }
    const subItemStyles = {
        root: {
            fontSize: '13px',
            backgroundColor: basicTheme.subMenu.menuContent
        },
        button: {
            '&:hover': {
                backgroundColor: basicTheme.subMenu.hover.backgroundColor,
                color: basicTheme.menu.hover.color
            }
        }
    }
    const logoutStyles = {
        root: {
            fontSize: '11px',
            color: '#DB4455',
            backgroundColor: basicTheme.subMenu.menuContent
        },
        button: {
            '&:hover': {
                backgroundColor: basicTheme.subMenu.hover.backgroundColor,
                color: 'red'
            }
        }
    }
    const [loginId, setLoginId] = useRecoilState(loginIdState);
    const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);
    const [isPaid, setIsPaid] = useRecoilState(isPaidState);
    const [isChecked, setIsChecked] = useRecoilState(isCheckedState);

    const logout = useCallback(() => {
        //recoil 저장소에 대한 정리 + axios의 헤더 제거 + localStorage 청소
        setLoginId('');
        setLoginLevel('');
        setIsPaid('');
        setIsChecked('');
        delete axios.defaults.headers.common['Authorization'];
        window.localStorage.removeItem("refreshToken");
        // navigator(isAdminPath ? ("/admin/login") : ("/login"));
        // navigator("/login");
    }, [loginId, loginLevel]);
    
    return (
        <>
            <Sidebar rootStyles={sidebarStyles}>
                <div className="text-center py-4">
                    <Link to="/emp/mypage">
                        <img className="logo-image" src={Logo} />
                    </Link>
                </div>
                <div className="logo-outline" />
                <Menu menuItemStyles={menuItemStyles}>
                    <MenuItem component={<Link to="/emp/mypage" />}> 대시보드 </MenuItem>
                    <MenuItem component={<Link to="/emp/compInfo" />}> 회사정보 </MenuItem>
                    <MenuItem component={<Link to="/board/notice" />}> 공지사항 </MenuItem>
                </Menu>
                <div className="logo-outline" />
                <Menu>
                    <SubMenu label="프로젝트" defaultOpen>
                        <Menu menuItemStyles={subItemStyles}>
                            <MenuItem component={<Link to="/project" />}> 내 프로젝트 목록 </MenuItem>
                        </Menu>
                    </SubMenu>
                </Menu>
                <div className="logo-outline" />
                <Menu menuItemStyles={menuItemStyles}>
                    <MenuItem component={<Link to="/calendar" />}> 캘린더 </MenuItem>
                    <MenuItem component={<Link to="/board/blind" />}> 블라인드 </MenuItem>
                    <MenuItem component={<Link to="/chatroom" />}> 채팅 </MenuItem>
                </Menu>
                <div className="logo-outline" />
                <Menu menuItemStyles={logoutStyles}>
                    <MenuItem onClick={e => logout()}> 로그아웃 </MenuItem>
                </Menu>
            </Sidebar >
        </>
    );
}

export default SideBar;