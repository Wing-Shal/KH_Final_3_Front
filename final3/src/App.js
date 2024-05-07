//import

import { Route, Routes, useLocation, useNavigate } from 'react-router';
import './App.css';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isLoginState, loginIdState, loginLevelState } from './components/utils/RecoilData';
import { Suspense, lazy, useCallback, useEffect } from 'react';
import axios from "./components/utils/CustomAxios";
import LoadingScreen from './components/LoadingScreen';
import SideBar from './components/Sidebar';
import AdminSideBar from './components/AdminSidebar';
import AdminRoute from './components/routes/AdminRoute';
import LoginRoute from './components/routes/LoginRoute';


//lazy import
const Header = lazy(() => import("./components/Header"));
const Home = lazy(() => import("./components/Home"));
// const BoardBlind = lazy(()=>import("./components/intergrated/BoardBlind/BoardBlind"));
const Login = lazy(() => import("./components/intergrated/Login"));
const CompanyJoin = lazy(() => import("./components/intergrated/CompanyJoin"));
const Chat = lazy(() => import("./components/intergrated/Chat/Chat"));
const ChatRoom = lazy(() => import("./components/intergrated/Chat/Chatroom"));
const Project = lazy(() => import("./components/intergrated/Project/Project"));
const AdminHome = lazy(() => import("./components/intergrated/Admin/AdminHome"));
const AdminCompany = lazy(() => import("./components/intergrated/Admin/AdminCompany"));
const AdminLogin = lazy(() =>import("./components/intergrated/Admin/AdminLogin"));
const Document = lazy(() => import("./components/intergrated/Document/Document"));
const NEL = lazy(()=>import("./components/NEL"));

const App = () => {
  //recoil state
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPath = location.pathname.includes("admin");
  const isLoginPath = location.pathname.includes("login");
  const [loginId, setLoginId] = useRecoilState(loginIdState);
  const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);

  //recoil value
  const isLogin = useRecoilValue(isLoginState);

  //effect
  useEffect(() => {
    refreshLogin();
  }, []);//최초 1회

  //callback
  const refreshLogin = useCallback(async () => {
    //localStorage에 있는 refreshToken의 유무에 따라 로그인 처리를 수행
    const refreshToken = window.localStorage.getItem("refreshToken");
    //console.log(refreshToken);
    if (refreshToken !== null) {//refreshToken 항목이 존재한다면
      //리프레시 토큰으로 Authorization을 변경하고
      axios.defaults.headers.common["Authorization"] = refreshToken;
      //재로그인 요청을 보낸다
      const resp = await axios.post("/refresh/");
      //결과를 적절한 위치에 설정한다
      setLoginId(resp.data.loginId);
      setLoginLevel(resp.data.loginLevel);
      axios.defaults.headers.common["Authorization"] = resp.data.accessToken;
      window.localStorage.setItem("refreshToken", resp.data.refreshToken);
    }

  }, []);

  return (
    <>
      {/* 메뉴 */}
      <Header />

      <div className='container-fluid d-flex'>
        <div className='sideber'>
          {isLoginPath ? (<></>) : (
            isAdminPath ? (
            <AdminSideBar />
          ) : (
            <SideBar />
          ))}
        </div>
        <div className='container'>
          <div className='row mt-4'>
            <div className='col-10 offset-sm-1'>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route element={<LoginRoute refreshLogin={refreshLogin} />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/NEL" element={<NEL />} />
                    <Route path="/chat/:chatroomNo" element={<Chat />} />
                    <Route path="/chatroom" element={<ChatRoom />} />
                    {/* <Route path="/boardBlind" element={<BoardBlind />}/> */}
                    <Route path="/project" element={<Project />} />
                    <Route path='/login' element={<Login />} />
                    <Route path="/company/join" element={<CompanyJoin />} />
                    <Route path="/document/project/:projectNo" element={<Document/>} />
                    <Route path="/admin" element={<AdminRoute refreshLogin={refreshLogin} />}>
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/company" element={<AdminCompany />} />
                    <Route path='/admin/home' element={<AdminHome />} />
                    </Route>
                  </Route>
                </Routes>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;