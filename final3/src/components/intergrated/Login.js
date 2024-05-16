//실제 로그인을 처리하기 위한 정보 입력 페이지
import "./Login.css";
import { useCallback, useState, useRef } from "react";
import Jumbotron from "../Jumbotron";
import { FaPlus } from "react-icons/fa";
import { IoIosSave } from "react-icons/io";
import { GiCancel } from "react-icons/gi";
import { useRecoilState } from "recoil";
import { loginIdState, loginLevelState, isPaidState } from "../utils/RecoilData";
//import axios from "axios";//기본 라이브러리
import axios from "../utils/CustomAxios";//개조 라이브러리
import { useNavigate } from "react-router";
import { Modal } from 'bootstrap';
import DaumPostcode from 'react-daum-postcode';

const Login = () => {

    //state
    const [input, setInput] = useState({
        id: "", pw: ""
    });
    const [join, setJoin] = useState({
        companyNo: "",
        companyPw: "",
        companyName: "",
        companyBn: "",
        companyContact: "",
        companyEmail: "",
        companyZipcode: "",
        companyAddress1: "",
        companyAddress2: ""
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

    const clearJoin = useCallback(() => {
        setJoin({
            companyNo: "",
            companyPw: "",
            companyName: "",
            companyBn: "",
            companyContact: "",
            companyEmail: "",
            companyZipcode: "",
            companyAddress1: "",
            companyAddress2: ""
        });
    });

    const saveJoin = useCallback(async () => {
        const resp = await axios.post("/company/join", join);
        clearJoin();
        closeModal();
    });

    const cancelJoin = useCallback(() => {
        const choice = window.confirm("작성을 취소하시겠습니까?");
        if (choice === false) return;

        clearJoin();

        closeModal();
    });

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

        window.localStorage.setItem("refreshToken", resp.data.refreshToken);
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

        window.localStorage.setItem("refreshToken", resp.data.refreshToken);
        navigator("/company/home")

    }, [input]);

    const bsModal = useRef();//리모컨
    const openModal = useCallback(() => {
        const modal = new Modal(bsModal.current);
        modal.show();
    }, [bsModal]);
    const closeModal = useCallback(() => {
        const modal = Modal.getInstance(bsModal.current);
        modal.hide();
    }, [bsModal]);

    //주소 입력
    const [isOpen, setIsOpen] = useState(false);
    const postCodeStyle = {

    };
    const completeHandler = (data) => {
        const { address, zonecode } = data;
        setInput({
            ...input,
            companyAddress1: address,
            companyZipcode: zonecode,
        })
    };
    const closeHandler = (state) => {
        if (state === 'FORCE_CLOSE') {
            setIsOpen(false);
        } else if (state === 'COMPLETE_CLOSE') {
            setIsOpen(false);
        }
    };
    const toggleHandler = () => {
        setIsOpen((prevOpenState) => !prevOpenState);
    };

    return (
        <>
            <Jumbotron title="로그인" />
            <div className='row mt-4'>
                <div className='col text-end'>
                    <button className='btn btn-primary'
                        onClick={e => openModal()}>
                        <FaPlus />
                        회원가입
                    </button>
                </div>
            </div>

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

            <div ref={bsModal} className=" modal modal-xl fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">회사 회원가입</h1>
                            <button type="button" className="btn-close" aria-label="Close" onClick={e => cancelJoin()}></button>
                        </div>
                        <div className="modal-body">
                            <div className="container-fluid">
                                <div className='row mt-4'>
                                    <div className='col-6'>
                                        <div className="form-floating mb-3">
                                            <input type="password" name="companyPw"
                                                value={input.companyPw}
                                                onChange={e => changeInput(e)}
                                                className='form-control'
                                                placeholder="*********" />
                                            <label>비밀번호</label>
                                        </div>
                                        <div className="form-floating mb-3">
                                            <input type="text" name="companyName"
                                                value={input.companyName}
                                                onChange={e => changeInput(e)}
                                                className='form-control'
                                                placeholder="새회사" />
                                            <label>회사명</label>
                                        </div>
                                        <div class="form-floating mb-3">
                                            <input type="text" name="companyBn"
                                                value={input.companyBn}
                                                onChange={e => changeInput(e)}
                                                className='form-control'
                                                placeholder="사업자번호" />
                                            <label for="companyBn">사업자번호</label>
                                        </div>
                                        <div class="form-floating mb-3">
                                            <input type="text" name="companyContact"
                                                value={input.companyContact}
                                                onChange={e => changeInput(e)}
                                                className='form-control'
                                                placeholder="연락처" />
                                            <label for="companyContact">연락처</label>
                                        </div>
                                        <div class="form-floating mb-3">
                                            <input type="text" name="companyEmail"
                                                value={input.companyEmail}
                                                onChange={e => changeInput(e)}
                                                className='form-control'
                                                placeholder="이메일" />
                                            <label for="companyEmail">이메일</label>
                                        </div>
                                        <div className="form-floating mb-3">
                                            <input type="text" name="companyZipcode"
                                                value={input.companyZipcode}
                                                readOnly
                                                className='form-control'
                                                placeholder="zipcode" />
                                            <label>우편번호</label>
                                        </div>
                                        <button className='btn btn-dark' type='button' onClick={() => toggleHandler()}>우편번호 찾기</button>
                                        {isOpen && (
                                            <div>
                                                <DaumPostcode
                                                    style={postCodeStyle}
                                                    onComplete={completeHandler}
                                                    onClose={closeHandler}
                                                />
                                            </div>
                                        )}
                                        <div class="form-floating mb-3">
                                            <input type="text" name="companyAddress1"
                                                value={input.companyAddress1}
                                                readOnly
                                                className='form-control'
                                                placeholder="주소" />
                                            <label for="companyAddress1">주소</label>
                                        </div>
                                        <div class="form-floating mb-3">
                                            <input type="text" name="companyAddress2"
                                                value={input.companyAddress2}
                                                onChange={e => changeInput(e)}
                                                className='form-control'
                                                placeholder="보완주소" />
                                            <label for="companyAddress2">보완주소</label>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className='btn btn-success me-2'
                                    onClick={e => saveJoin()}>
                                    <IoIosSave />
                                    &nbsp;
                                    등록
                                </button>
                                <button className='btn btn-danger'
                                    onClick={e => cancelJoin()}>
                                    <GiCancel />
                                    &nbsp;
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;