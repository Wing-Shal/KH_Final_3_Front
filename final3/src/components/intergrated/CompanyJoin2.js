import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Jumbotron from '../Jumbotron';
import { IoIosSave } from "react-icons/io";
import { GiCancel } from "react-icons/gi";
import { FaPlus } from "react-icons/fa";
import { Modal } from 'bootstrap';
import axios from "../utils/CustomAxios.js";

//function Company() {}
const CompanyJoin2 = () => {
    //state
    const [input, setInput] = useState({
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

    //callback
    const changeInput = useCallback((e) => {
        setInput({
            ...input,//원래input을 유지시키되
            [e.target.name]: e.target.value//name에 해당하는 값만 value로 바꿔라!
        });
    }, [input]);

    const clearInput = useCallback(()=>{
        setInput({
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
    }, [input]);

    const saveInput = useCallback(async () => {
        console.log(input);
        const resp = await axios.post("/company/join", input);
        clearInput();
        closeModal();
    }, [input]);

    const cancelInput = useCallback(() => {
        const choice = window.confirm("작성을 취소하시겠습니까?");
        if(choice === false) return;

        clearInput();

        closeModal();
    }, [input]);

    //ref(참조)
    //- 리액트에서 태그를 선택하는 대신 사용하는 도구(그 외의 용도도 가능)
    //- 변수명.current 를 이용하여 현재 참조하고 있는 대상 태그를 호출할 수 있음
    const bsModal = useRef();//리모컨
    const openModal = useCallback(() => {
        const modal = new Modal(bsModal.current);
        modal.show();
    }, [bsModal]);
    const closeModal = useCallback(() => {
        const modal = Modal.getInstance(bsModal.current);
        modal.hide();
    }, [bsModal]);

    return (
        <>
            <Jumbotron title="회사 가입" />

            {/* 신규등록버튼(모달띄우기) */}
            <div className='row mt-4'>
                <div className='col text-end'>
                    <button className='btn btn-primary'
                        onClick={e => openModal()}>
                        <FaPlus />
                        회원가입
                    </button>
                </div>
            </div>

            {/* Modal */}
            <div ref={bsModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">회사 회원가입</h1>
                            <button type="button" className="btn-close" aria-label="Close" onClick={e => cancelInput()}></button>
                        </div>
                        <div className="modal-body">
                            {/* 등록 화면 */}

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>비밀번호</label>
                                    <input type="text" name="companyPw"
                                        value={input.companyPw}
                                        onChange={e => changeInput(e)}
                                        className='form-control' />
                                </div>
                            </div>
                            
                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>회사명</label>
                                    <input type="text" name="companyName"
                                        value={input.companyName}
                                        onChange={e => changeInput(e)}
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>사업자번호</label>
                                    <input type="text" name="companyBn"
                                        value={input.companyBn}
                                        onChange={e => changeInput(e)}
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>연락처</label>
                                    <input type="text" name="companyContact"
                                        value={input.companyContact}
                                        onChange={e => changeInput(e)}
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>이메일</label>
                                    <input type="text" name="companyEmail"
                                        value={input.companyEmail}
                                        onChange={e => changeInput(e)}
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>우편번호</label>
                                    <input type="text" name="companyZipcode"
                                        value={input.companyZipcode}
                                        onChange={e => changeInput(e)}
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>주소1</label>
                                    <input type="text" name="companyAddress1"
                                        value={input.companyAddress1}
                                        onChange={e => changeInput(e)}
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>주소2</label>
                                    <input type="text" name="companyAddress2"
                                        value={input.companyAddress2}
                                        onChange={e => changeInput(e)}
                                        className='form-control' />
                                </div>
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button className='btn btn-success me-2'
                                onClick={e => saveInput()}>
                                <IoIosSave />
                                &nbsp;
                                등록
                            </button>
                            <button className='btn btn-danger'
                                onClick={e => cancelInput()}>
                                <GiCancel />
                                &nbsp;
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CompanyJoin2;
