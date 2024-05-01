//실제 로그인을 처리하기 위한 정보 입력 페이지

import { useCallback, useState } from "react";
import Jumbotron from "../../Jumbotron";
import { useRecoilState } from "recoil";
import { loginIdState, loginLevelState } from "../../utils/RecoilData";
import axios from "../../utils/CustomAxios";
import { useNavigate } from "react-router";

const AdminLogin = ()=>{

    //state
    const [input, setInput] = useState({
        id : "" , pw : ""
    });

    //recoil
    const [loginId, setLoginId] = useRecoilState(loginIdState);
    const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);

    //callback
    const changeInput = useCallback(e=>{
        setInput({
            ...input,
            [e.target.name] : e.target.value
        });
    }, [input]);

    //navigator
    const navigator = useNavigate();

    const adminLogin = useCallback(async ()=>{
        if(input.id.length === 0) return;
        if(input.pw.length === 0) return;

        const resp = await axios.post("/admin/login", input);
        setLoginId(parseInt(resp.data.loginId));
        setLoginLevel(resp.data.loginLevel);

        axios.defaults.headers.common['Authorization'] = resp.data.accessToken;

        window.localStorage.setItem("refreshToken", resp.data.refreshToken);


        navigator("/");
    }, [input]);

    return (
        <>
            <Jumbotron title="로그인"/>

            <div className="row mt-4">
                <div className="col">
                    <label>아이디</label>
                    <input type="text" name="id" className="form-control"
                            value={input.id} onChange={e=>changeInput(e)}/>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <label>비밀번호</label>
                    <input type="password" name="pw" className="form-control"
                            value={input.pw} onChange={e=>changeInput(e)}/>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <button className="btn btn-success w-100"
                        onClick={e=>adminLogin()}>로그인</button>
                </div>
            </div>
        </>
    );
};

export default AdminLogin;