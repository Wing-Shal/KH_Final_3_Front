//import

import { Route, Routes } from 'react-router';
import './App.css';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isLoginState, loginIdState, loginLevelState, isDataLoadedState } from './components/utils/RecoilData';
import { Suspense, lazy, useCallback, useEffect } from 'react';
import axios from "./components/utils/CustomAxios";
import SideBar from './components/Sidebar';


//lazy import
const Header = lazy(() => import("./components/Header"));
const Home = lazy(() => import("./components/Home"));
const LoadingScreen = lazy(()=>("./components/LoadingScreen"))
// const BoardBlind = lazy(()=>import("./components/intergrated/BoardBlind/BoardBlind"));
const Login = lazy(() => import("./components/intergrated/Login"));
const CompanyJoin = lazy(() => import("./components/intergrated/CompanyJoin"));
const Chat = lazy(() => import("./components/intergrated/Chat/Chat"));
const ChatRoom = lazy(() => import("./components/intergrated/Chat/Chatroom"));
const Document = lazy(() => import("./components/intergrated/Document/Document"));
const Project = lazy(() => import("./components/intergrated/Project/Project"));
const AdminLogin = lazy(()=> import("./components/routes/AdminRoute"));
const AdminRoute = lazy(()=>("./components/routes/AdminRoute"));



const App = () => {

  //recoil state
  const [loginId, setLoginId] = useRecoilState(loginIdState);
  const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);

  //recoil value
  const isLogin = useRecoilValue(isLoginState);

  //callback
  const refreshLogin = useCallback(async () => {
    const refreshToken = window.localStorage.getItem("refreshToken");
    if (refreshToken) {
      axios.defaults.headers.common["Authorization"] = refreshToken;
      const resp = await axios.post("/refresh/");
      setLoginId(resp.data.loginId);
      setLoginLevel(resp.data.loginLevel);
      axios.defaults.headers.common["Authorization"] = resp.data.accessToken;
      window.localStorage.setItem("refreshToken", resp.data.refreshToken);
    }
  }, []);

  //effect
  useEffect(() => {
    refreshLogin();
  }, []);

  // if(!isDataLoaded) { 
  //   return <Suspense fallback={<LoadingScreen />} />
  // }

  return (
    <>
      {/* 메뉴 */}
      <Header />

      <div className='container-fluid d-flex'>
        <div className='sideber'>
          <SideBar />
        </div>
        <div className='container'>
          <div className='row mt-4'>
            <div className='col-10 offset-sm-1'>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/chat/:chatroomNo" element={<Chat />} />
                  <Route path="/chatroom" element={<ChatRoom />} />
                  {/* <Route path="/boardBlind" element={<BoardBlind />}/> */}
                  <Route path="/project" element={<Project />} />
                  <Route path="/document" element={<Document />} />
                  <Route path='/login' element={<Login />} />
                  <Route path="/company/join" element={<CompanyJoin />} />
                  <Route path="/admin/company" element={<AdminRoute />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
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
