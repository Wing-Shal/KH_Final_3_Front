import "./Login.css";
import { useCallback, useState, useReducer, useRef } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import { IoIosSave } from "react-icons/io";
import { GiCancel } from "react-icons/gi";
import { useRecoilState } from "recoil";
import { loginIdState, loginLevelState, isPaidState, isCheckedState } from "../utils/RecoilData";
import axios from "../utils/CustomAxios";
import { useNavigate } from "react-router";
import { Modal } from 'bootstrap';
import DaumPostcode from 'react-daum-postcode';
import Logo from '../../assets/PlanetLogo.png';

// Reducer function for managing grades and depts
const initialState = {
    grades: [
        { gradeNo: 0, gradeName: '사장' },
        { gradeNo: 0, gradeName: '사원' },
        { gradeNo: 0, gradeName: '인턴' },
    ],
    depts: [
        { deptNo: 0, deptName: '인사부' },
        { deptNo: 0, deptName: '개발부' },
    ]
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'ADD_GRADE':
            return {
                ...state,
                grades: [...state.grades, { gradeNo: 0, gradeName: '' }]
            };
        case 'DELETE_GRADE':
            return {
                ...state,
                grades: state.grades.filter((_, index) => index !== action.index)
            };
        case 'CHANGE_GRADE':
            return {
                ...state,
                grades: state.grades.map((grade, index) =>
                    index === action.index ? { ...grade, [action.name]: action.value } : grade)
            };
        case 'CLEAR_GRADES':
            return {
                ...state,
                grades: [
                    { gradeNo: 0, gradeName: '사장' },
                    { gradeNo: 0, gradeName: '사원' },
                    { gradeNo: 0, gradeName: '인턴' },
                ]
            };
        case 'ADD_DEPT':
            return {
                ...state,
                depts: [...state.depts, { deptNo: 0, deptName: '' }]
            };
        case 'DELETE_DEPT':
            return {
                ...state,
                depts: state.depts.filter((_, index) => index !== action.index)
            };
        case 'CHANGE_DEPT':
            return {
                ...state,
                depts: state.depts.map((dept, index) =>
                    index === action.index ? { ...dept, [action.name]: action.value } : dept)
            };
        case 'CLEAR_DEPTS':
            return {
                ...state,
                depts: [
                    { deptNo: 0, deptName: '인사부' },
                    { deptNo: 0, deptName: '개발부' },
                ]
            };
        default:
            return state;
    }
};

const Login = () => {
    // State
    const [input, setInput] = useState({ id: "", pw: "" });
    const [join, setJoin] = useState({
        companyPw: "",
        companyName: "",
        companyBn: "",
        companyContact: "",
        companyEmail: "",
        companyZipcode: "",
        companyAddress1: "",
        companyAddress2: ""
    });
    const [validity, setValidity] = useState({ companyPw: true, companyEmail: true });
    const [isCertValid, setIsCertValid] = useState(false);
    const [showCertInput, setShowCertInput] = useState(false);
    const [showSendCertButton, setShowSendCertButton] = useState(true);
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    const [state, dispatch] = useReducer(reducer, initialState);

    // Navigator
    const navigator = useNavigate();

    // Recoil
    const [loginId, setLoginId] = useRecoilState(loginIdState);
    const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);
    const [isPaid, setIsPaid] = useRecoilState(isPaidState);
    const [isChecked, setIsChecked] = useRecoilState(isCheckedState);

    // Callbacks
    const changeInput = useCallback(e => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }, [input]);

    const changeJoinInput = useCallback(e => {
        const { name, value } = e.target;
        setJoin({ ...join, [name]: value });

        if (name === 'companyEmail') {
            setValidity({ ...validity, companyEmail: validateEmail(value) });
        } else if (name === 'companyPw') {
            setValidity({ ...validity, companyPw: validatePassword(value) });
        }
    }, [join, validity]);

    const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = password => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

    const clearJoin = useCallback(() => {
        setJoin({
            companyName: "",
            companyBn: "",
            companyPw: "",
            companyContact: "",
            companyEmail: "",
            companyZipcode: "",
            companyAddress1: "",
            companyAddress2: ""
        });
        setValidity({ companyPw: true, companyEmail: true });
    }, []);

    const sendCertEmail = useCallback(async () => {
        if (!validateEmail(join.companyEmail)) {
            setValidity({ ...validity, companyEmail: false });
            return;
        }
        try {
            setIsSendingEmail(true);
            await axios.post("/company/sendCert", { companyEmail: join.companyEmail });
            setShowCertInput(true);
            setShowCertInput(true);
            setShowSendCertButton(false);
        } catch (error) {
            console.error("인증번호 발송 중 오류가 발생했습니다:", error.message);
        } finally {
            setIsSendingEmail(false);
        }
    }, [join.companyEmail, validity]);

    const verifyCertNumber = useCallback(async () => {
        try {
            const certResp = await axios.post("/company/verifyCert", {
                certEmail: join.companyEmail,
                certNumber: join.certNumber
            });
            setIsCertValid(certResp.data.valid);
            if (certResp.data.valid) {
                window.alert("인증번호가 확인되었습니다.");
                setJoin({ ...join, isEmailReadOnly: true });
                setShowCertInput(false);
                setShowSendCertButton(false);
            } else {
                window.alert("인증번호가 일치하지 않습니다.");
            }
        } catch (error) {
            console.error("인증번호 확인 중 오류가 발생했습니다:", error.message);
        }
    }, [join]);

    const saveJoin = useCallback(async () => {
        const isEmailValid = validateEmail(join.companyEmail);
        const isPasswordValid = validatePassword(join.companyPw);

        setValidity({ companyPw: isPasswordValid, companyEmail: isEmailValid });

        if (!isEmailValid || !isPasswordValid || !isCertValid) {
            window.alert("이메일 또는 비밀번호가 유효하지 않거나, 인증번호가 확인되지 않았습니다.");
            return;
        }

        const joinData = { ...join, grades: state.grades, depts: state.depts };

        try {
            const resp = await axios.post("/company/join", joinData);
            clearJoin();
            closeModal();
            window.alert("회원가입이 완료되었습니다.");
            window.alert("사업자등록증 확인을 위한 이메일이 발송되었습니다.");
        } catch (error) {
            console.error("회원가입 중 오류가 발생했습니다:", error.message);
        }
    }, [join, state.grades, state.depts, clearJoin, navigator, isCertValid]);

    const cancelJoin = useCallback(() => {
        if (window.confirm("작성을 취소하시겠습니까?")) {
            clearJoin();
            dispatch({ type: 'CLEAR_GRADES' });
            dispatch({ type: 'CLEAR_DEPTS' });
            closeModal();
            setShowCertInput(false);
            setShowSendCertButton(true);
        }
    }, [clearJoin]);

    const empLogin = useCallback(async () => {
        if (input.id.length === 0 || input.pw.length === 0) return;

        try {
            const resp = await axios.post("/emp/login", input);
            setLoginId(parseInt(resp.data.loginId));
            setLoginLevel(resp.data.loginLevel);
            setIsPaid(resp.data.isPaid);

            axios.defaults.headers.common['Authorization'] = resp.data.accessToken;
            window.localStorage.setItem("refreshToken", resp.data.refreshToken);
            navigator("/emp/mypage");
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 404)) {
                window.alert("아이디 혹은 비밀번호가 일치하지 않습니다");
            } else {
                console.log("로그인 중 오류가 발생했습니다:", error.message);
            }
        }
    }, [input]);

    const companyLogin = useCallback(async () => {
        if (input.id.length === 0 || input.pw.length === 0) return;

        try {
            const resp = await axios.post("/company/login", input);
            setLoginId(parseInt(resp.data.loginId));
            setLoginLevel(resp.data.loginLevel);
            setIsPaid(resp.data.isPaid);

            axios.defaults.headers.common['Authorization'] = resp.data.accessToken;
            window.localStorage.setItem("refreshToken", resp.data.refreshToken);

            try {
                const check = await axios.get("/company/isChecked");
                setIsChecked(check.data);
            } catch (checkError) {
                setIsChecked("UnChecked");
            }
            navigator("/company/mypage");
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 404)) {
                window.alert("아이디 혹은 비밀번호가 일치하지 않습니다");
            } else {
                console.log("로그인 중 오류가 발생했습니다:", error.message);
            }
        }
    }, [input]);

    const bsModal = useRef();
    const openModal = useCallback(() => {
        const modal = new Modal(bsModal.current);
        modal.show();
    }, [bsModal]);
    const closeModal = useCallback(() => {
        const modal = Modal.getInstance(bsModal.current);
        modal.hide();
    }, [bsModal]);

    const [isOpen, setIsOpen] = useState(false);
    const postCodeStyle = {};

    const completeHandler = data => {
        const { address, zonecode } = data;
        setJoin({
            ...join,
            companyAddress1: address,
            companyZipcode: zonecode,
        });
    };

    const closeHandler = state => {
        setIsOpen(false);
    };

    const toggleHandler = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <>
            <div className="container login-container">
                <div className="row">
                    <div className="col-6 offset-3">
                        <div className="login-wrapper w-100">
                            <div className="img-wrapper text-center mb-4">
                                <img className="logo-image" src={Logo} alt="Logo" />
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <label>아이디</label>
                                    <input type="text" name="id" className="form-control"
                                        value={input.id} onChange={changeInput} />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <label>비밀번호</label>
                                    <input type="password" name="pw" className="form-control"
                                        value={input.pw} onChange={changeInput} />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <button className="btn btn-secondary w-100" onClick={empLogin}>사원로그인</button>
                                </div>
                                <div className="col-md-6">
                                    <button className="btn btn-secondary w-100" onClick={companyLogin}>사장로그인</button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <button className='btn btn-dark w-100' onClick={openModal}>
                                        <FaPlus /> 회원가입
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div ref={bsModal} className="modal modal-xl fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">회사 회원가입</h1>
                            <button type="button" className="btn-close" aria-label="Close" onClick={cancelJoin}></button>
                        </div>
                        <div className="modal-body">
                            <div className="container-fluid">
                                <div className='row mt-4 justify-content-md-center'>
                                    <div className='col-5 table-wrapper'>
                                        <div className="form-floating mb-3">
                                            <input type="text" name="companyName"
                                                value={join.companyName}
                                                onChange={changeJoinInput}
                                                className='form-control'
                                                placeholder="새회사" />
                                            <label>회사명</label>
                                        </div>
                                        <div className="form-floating mb-3">
                                            <input type="text" name="companyBn"
                                                value={join.companyBn}
                                                onChange={changeJoinInput}
                                                className='form-control'
                                                placeholder="사업자번호" />
                                            <label for="companyBn">사업자번호</label>
                                        </div>
                                        <div className="form-floating mb-3">
                                            <input type="password" name="companyPw"
                                                value={join.companyPw}
                                                onChange={changeJoinInput}
                                                className={`form-control ${validity.companyPw ? '' : 'is-invalid'}`}
                                                placeholder="*********" />
                                            <label>비밀번호</label>
                                            <div className="invalid-feedback">
                                                비밀번호는 최소 8자, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.<br />
                                                <strong>사용 불가 특수문자: ' " + / \ ; : - _ ^ ( ) &lt; &gt;</strong>
                                            </div>
                                        </div>
                                        <div className="form-floating mb-3">
                                            <input type="text" name="companyContact"
                                                value={join.companyContact}
                                                onChange={changeJoinInput}
                                                className='form-control'
                                                placeholder="연락처" />
                                            <label for="companyContact">연락처</label>
                                        </div>
                                        <div className="form-floating mb-3 position-relative">
                                            <input type="text" name="companyEmail"
                                                value={join.companyEmail}
                                                onChange={changeJoinInput}
                                                className={`form-control ${validity.companyEmail ? '' : 'is-invalid'}`}
                                                placeholder="이메일"
                                                readOnly={join.isEmailReadOnly || isSendingEmail} // 이메일 전송 중이거나 readOnly 상태일 때 readOnly 설정
                                            />
                                            <label htmlFor="companyEmail">이메일</label>
                                            <div className="invalid-feedback">
                                                올바른 이메일 형식을 입력하세요.
                                            </div>
                                            {showSendCertButton && !isSendingEmail && ( // 이메일 전송 중이 아니고 버튼이 보여야 할 때만 버튼 표시
                                                <button className='btn btn-dark w-100 mt-2' onClick={sendCertEmail}>
                                                    인증번호 발송
                                                </button>
                                            )}
                                            {isSendingEmail && ( // 이메일 전송 중일 때 로딩 아이콘 표시
                                                <div className="loading-icon position-absolute" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                                                    <div className="spinner-border text-primary" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {showCertInput && ( // showCertInput 상태에 따라 인증번호 입력 div 표시
                                            <div className="form-floating mb-3">
                                                <input type="text" name="certNumber"
                                                    value={join.certNumber}
                                                    onChange={changeJoinInput}
                                                    className='form-control'
                                                    placeholder="인증번호" />
                                                <label htmlFor="certNumber">인증번호</label>
                                                <button className='btn btn-dark w-100 mt-2' onClick={verifyCertNumber}>
                                                    인증번호 확인
                                                </button>
                                            </div>
                                        )}
                                        <div className="form-floating mb-3">
                                            <input type="text" name="companyZipcode"
                                                value={join.companyZipcode}
                                                readOnly
                                                className='form-control'
                                                placeholder="zipcode" />
                                            <label>우편번호</label>
                                        </div>
                                        <button className='btn btn-dark' type='button' onClick={toggleHandler}>우편번호 찾기</button>
                                        {isOpen && (
                                            <div>
                                                <DaumPostcode
                                                    style={postCodeStyle}
                                                    onComplete={completeHandler}
                                                    onClose={closeHandler}
                                                />
                                            </div>
                                        )}
                                        <div className="form-floating mb-3">
                                            <input type="text" name="companyAddress1"
                                                value={join.companyAddress1}
                                                readOnly
                                                className='form-control'
                                                placeholder="주소" />
                                            <label for="companyAddress1">주소</label>
                                        </div>
                                        <div className="form-floating mb-3">
                                            <input type="text" name="companyAddress2"
                                                value={join.companyAddress2}
                                                onChange={changeJoinInput}
                                                className='form-control'
                                                placeholder="보완주소" />
                                            <label for="companyAddress2">보완주소</label>
                                        </div>
                                    </div>
                                    <div className="col-5">
                                        <div className="table-wrapper scrollable-section">
                                            <table className='table'>
                                                <thead className='text-center'>
                                                    <tr className='align-items-center'>
                                                        <th>직급설정</th>
                                                    </tr>
                                                </thead>
                                                <tbody className='text-center'>
                                                    {state.grades.map((grade, index) => (
                                                        <tr key={index} className='align-items-center'>
                                                            <td>
                                                                <div style={{ position: 'relative' }}>
                                                                    <input type="text" className="form-control"
                                                                        name="gradeName" value={grade.gradeName}
                                                                        onChange={(e) => dispatch({ type: 'CHANGE_GRADE', index, name: e.target.name, value: e.target.value })} />
                                                                    <FaMinus className="text-danger me-2"
                                                                        style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                                                                        onClick={() => dispatch({ type: 'DELETE_GRADE', index })} />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="row mt-3">
                                                <div className="col d-flex justify-content-end">
                                                    <button onClick={() => dispatch({ type: 'ADD_GRADE' })} className="btn btn-primary"><FaPlus /></button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-wrapper scrollable-section">
                                            <table className='table'>
                                                <thead className='text-center'>
                                                    <tr className='align-items-center'>
                                                        <th>부서설정</th>
                                                    </tr>
                                                </thead>
                                                <tbody className='text-center'>
                                                    {state.depts.map((dept, index) => (
                                                        <tr key={index} className='align-items-center'>
                                                            <td>
                                                                <div style={{ position: 'relative' }}>
                                                                    <input type="text" className="form-control"
                                                                        name="deptName" value={dept.deptName}
                                                                        onChange={(e) => dispatch({ type: 'CHANGE_DEPT', index, name: e.target.name, value: e.target.value })} />
                                                                    <FaMinus className="text-danger me-2"
                                                                        style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                                                                        onClick={() => dispatch({ type: 'DELETE_DEPT', index })} />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="row mt-3">
                                                <div className="col d-flex justify-content-end">
                                                    <button onClick={() => dispatch({ type: 'ADD_DEPT' })} className="btn btn-primary"><FaPlus /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className='btn btn-success me-2' onClick={saveJoin}>
                                    <IoIosSave /> 등록
                                </button>
                                <button className='btn btn-danger' onClick={cancelJoin}>
                                    <GiCancel /> 취소
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
