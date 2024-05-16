//실제 로그인을 처리하기 위한 정보 입력 페이지

import { useCallback, useState } from "react";
import Jumbotron from "../../Jumbotron";
import { useRecoilState } from "recoil";
import { isPaidState, loginIdState, loginLevelState } from "../../utils/RecoilData";
import axios from "../../utils/CustomAxios";
import { useNavigate } from "react-router";

const AdminLogin = () => {

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

    const adminLogin = useCallback(async () => {
        if (input.id.length === 0) return;
        if (input.pw.length === 0) return;

        try {
            const resp = await axios.post("/admin/login", input);
            setLoginId(parseInt(resp.data.loginId));
            setLoginLevel(resp.data.loginLevel);
            setIsPaid(resp.data.isPaid);

            axios.defaults.headers.common['Authorization'] = resp.data.accessToken;

            window.localStorage.setItem("refreshToken", resp.data.refreshToken);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                window.alert("아이디 혹은 비밀번호가 일치하지 않습니다");
            } else {
                console.log("로그인 중 오류가 발생했습니다:", error.message);
            }
        }



        navigator("/admin/home");
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
            <div className="row mt-4">
                <div className="col">
                    <button className="btn btn-success w-100"
                        onClick={e => adminLogin()}>로그인</button>
                </div>
            </div>
        </>
    );
};

export default AdminLogin;