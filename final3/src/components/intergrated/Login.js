//실제 로그인을 처리하기 위한 정보 입력 페이지
import "./Login.css";
import { useCallback, useState } from "react";
import Jumbotron from "../Jumbotron";
import { useRecoilState } from "recoil";
import { loginIdState, loginLevelState, isPaidState } from "../utils/RecoilData";
//import axios from "axios";//기본 라이브러리
import axios from "../utils/CustomAxios";//개조 라이브러리
import { useNavigate } from "react-router";

const Login = () => {

    //state
    const [input, setInput] = useState({
        id: "", pw: ""
    });

    //recoil
    const [loginId, setLoginId] = useRecoilState(loginIdState);
    const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);
    const [isPaid, setIsPaid] = useRecoilState(isPaidState);

    //callback
    const changeInput = useCallback(e => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

    //navigator
    const navigator = useNavigate();

    const empLogin = useCallback(async () => {
        if (input.id.length === 0) return;
        if (input.pw.length === 0) return;

        const resp = await axios.post("/emp/login", input);
        setLoginId(parseInt(resp.data.loginId));
        setLoginLevel(resp.data.loginLevel);
        setIsPaid(resp.data.isPaid)

        axios.defaults.headers.common['Authorization'] = resp.data.accessToken;

        //(+추가) refreshToken을 localStroage에 저장
        window.localStorage.setItem("refreshToken", resp.data.refreshToken);

        //강제 페이지 이동 - useNavigate()
        navigator("/");
    }, [input]);

    const companyLogin = useCallback(async () => {
        if (input.id.length === 0) return;
        if (input.pw.length === 0) return;

        const resp = await axios.post("/company/login", input);
        setLoginId(parseInt(resp.data.loginId));
        setLoginLevel(resp.data.loginLevel);
        setIsPaid(resp.data.isPaid)

        axios.defaults.headers.common['Authorization'] = resp.data.accessToken;

        //(+추가) refreshToken을 localStroage에 저장
        window.localStorage.setItem("refreshToken", resp.data.refreshToken);

        //강제 페이지 이동 - useNavigate()
        navigator("/company/home")
       
    }, [input]);

    return (
        <>
            <Jumbotron title="로그인" />

            <div className="row mt-4">
                <div className="col">
                    <label>아이디</label>
                    <input type="text" name="id" className="form-control"
                        value={input.id} onChange={e => changeInput(e)} />
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <label>비밀번호</label>
                    <input type="password" name="pw" className="form-control"
                        value={input.pw} onChange={e => changeInput(e)} />
                </div>
            </div>
            <div className="container d-flex justify-content-center align-items-center">
                <div className="row mt-4">
                    <div className="col">
                        <button className="btn btn-success w-100" onClick={e => empLogin()}>사원로그인</button>
                    </div>
                    <div className="col">
                        <button className="btn btn-success w-100" onClick={e => companyLogin()}>사장로그인</button>
                    </div>
                </div>
            </div>

        </>
    );
};

export default Login;