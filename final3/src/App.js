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
                </Routes>
              </Suspense>

          </div>
        </div>
      </div>
    </>
  );
}

export default App;
