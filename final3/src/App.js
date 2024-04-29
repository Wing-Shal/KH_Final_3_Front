//import
import './App.css';
import { Route, Routes } from 'react-router';
import { Suspense, lazy } from 'react';
import axios from "./components/utils/CustomAxios";
import LoadingScreen from './components/LoadingScreen';
import SideBar from './components/Sidebar';

//lazy import
const Header = lazy(()=>import("./components/Header"));
const Home = lazy(()=>import("./components/Home"));
const Chat = lazy(()=>import("./components/inetergrated/Chat"));
const BoardBlind = lazy(()=>import("./components/intergrated/BoardBlind/BoardBlind"));
const DocumentList = lazy(()=>import("./components/intergrated/Document/DocumentList"));

const App = ()=> {
  return (
    <>
      {/* 메뉴 */}
      <Header/>

      <div className='container-fluid d-flex'>
        <div className='sideber'>
          <SideBar/>
        </div>
        <div className='row mt-4'>
          <div className='col-10 offset-sm-1'>

              <Suspense fallback={<LoadingScreen/>}>
                <Routes>
                  <Route path="/" element={<Home/>}/>
                  <Route path="/chat" element={<Chat />}/>
                  <Route path="/boardBlind" element={<BoardBlind />}/>
                  <Route path="/documentList" element={<DocumentList />}/>
                </Routes>
              </Suspense>

          </div>
        </div>
      </div>
    </>
  );
}

export default App;
