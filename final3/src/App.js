//import
import './App.css';
import { Route, Routes } from 'react-router';
import { Suspense, lazy } from 'react';
import axios from "./components/utils/CustomAxios";
import LoadingScreen from './components/LoadingScreen';

//lazy import
const Menu = lazy(()=>import("./components/Menu"));
const Home = lazy(()=>import("./components/Home"));

function App() {
  return (
    <>
      {/* 메뉴 */}
      <Menu/>

      <div className='container-fluid my-5'>
        <div className='row'>
          <div className='col-sm-10 offset-sm-1'>
              
              {/* 
                메뉴를 눌렀을 때 나올 화면 배치 
                - path를 통해 주소를 설정
                - element를 통해 연결될 화면을 설정
              */}
              <Suspense fallback={<LoadingScreen/>}>
                <Routes>
                  <Route path="/" element={<Home/>}/>  
                </Routes>
              </Suspense>

          </div>
        </div>
      </div>
    </>
  );
}

export default App;
