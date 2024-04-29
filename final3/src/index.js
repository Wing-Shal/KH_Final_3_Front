import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

//bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootswatch/dist/zephyr/bootstrap.min.css";
import "bootstrap";//js파일

import './index.css';
import { HashRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
      {/* 리코일을 사용하는 영역 지정 */}
      <RecoilRoot>
        {/* 리액트 라우터를 사용하는 영역을 지정 */}
        <HashRouter>
          <App />
        </HashRouter>
      </RecoilRoot>
    </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
