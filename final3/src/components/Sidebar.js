import {
    Menu,
    MenuItem,
    Sidebar,
    SubMenu,
    sidebarClasses,
    menuClasses,
} from "react-pro-sidebar";

import { Link } from 'react-router-dom';

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
                color : basicTheme.menu.hover.color
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
                color : basicTheme.menu.hover.color
            }
        }
    }

    return (
        <>
            <Sidebar rootStyles={sidebarStyles}>
                <div className="text-center py-4">
                    <img src="https://flow.team/flow-renewal/assets/images/logo/logo-flow.svg" />
                </div>
                <div className="logo-outline" />
                <Menu menuItemStyles={menuItemStyles}>
                    <MenuItem component={<Link to="/" />}> 대시보드 </MenuItem>
                    <MenuItem component={<Link to="/" />}> 회사정보 </MenuItem>
                </Menu>
                    <div className="logo-outline" />
                <Menu>
                    <SubMenu label="프로젝트" defaultOpen>
                        <Menu menuItemStyles={subItemStyles}>
                            <MenuItem component={<Link to="/" />}> 내 프로젝트 목록 </MenuItem>
                        </Menu>
                    </SubMenu>
                </Menu>
                <div className="logo-outline" />
                <Menu menuItemStyles={menuItemStyles}>
                <MenuItem component={<Link to="/" />}> 캘린더 </MenuItem>
                <MenuItem  component={<Link to="/boardBlind" />}> 블라인드 </MenuItem>
                <MenuItem  component={<Link to="/chat" />}> 채팅 </MenuItem>
            </Menu>
        </Sidebar >
      </>
    );
  }

export default SideBar;