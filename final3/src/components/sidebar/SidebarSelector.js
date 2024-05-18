import AdminSideBar from './AdminSidebar';
import CompanySideBar from './CompanySidbar';
import SideBar from './Sidebar';

const SidebarSelector = ({ isLoginPath, isNELpath,  isAdminPath, isCompanyPath, isInvalidPath, isErrorPath, isPurchasePath }) => {
    // 뜨면 안되는 경로
    if (isLoginPath || isNELpath || isInvalidPath || isErrorPath || isPurchasePath) {
      return null;
    }
  
    // 관리자 경로에서는 AdminSideBar
    if (isAdminPath) {
      return <AdminSideBar />;
    }
  
    // 회사 경로에서는 CompanySideBar
    if (isCompanyPath) {
      return <CompanySideBar />;
    }
  
    // 위 조건에 모두 해당하지 않는 경우, 일반 SideBar
    return <SideBar />;
  }

  export default SidebarSelector;