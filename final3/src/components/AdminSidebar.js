import {
    Menu,
    MenuItem,
    Sidebar,
    SubMenu
} from "react-pro-sidebar";

import { Link } from 'react-router-dom';

import Logo from "../assets/PlanetLogo.png";

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

    return (
        <>
            <Sidebar rootStyles={sidebarStyles}>
                <div className="text-center py-4">
                    <Link to="/admin/home">
                        <img className="logo-image" src={Logo} />
                    </Link>
                </div>
                <div className="logo-outline" />
                <Menu menuItemStyles={menuItemStyles}>
                    <MenuItem component={<Link to="/admin/home" />}> 홈으로 </MenuItem>
                    <div className="logo-outline" />
                    <MenuItem component={<Link to="/admin/company" />}> 회사 관리 </MenuItem>
                </Menu>
            </Sidebar >
        </>
    );
}

export default SideBar;