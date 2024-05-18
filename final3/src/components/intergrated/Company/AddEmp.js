import { useEffect, useState, useCallback, useRef } from "react";
import axios from '../../utils/CustomAxios';
import { FaPlus } from "react-icons/fa";
import { IoIosSave } from "react-icons/io";
import { GiCancel } from "react-icons/gi";
import { Modal } from 'bootstrap';
import * as XLSX from 'xlsx';
import Jumbotron from "../../Jumbotron";
import { saveAs } from 'file-saver';

const AddEmp = () => {
    const [emps, setEmps] = useState([]);
    const [depts, setDepts] = useState([]);
    const [grades, setGrades] = useState([]);
    const [input, setInput] = useState({});
    const [allChecked, setAllChecked] = useState(false);
    const [checkedState, setCheckedState] = useState({});
    const baseURL = process.env.REACT_APP_BASE_URL;
    const tempNo = process.env.REACT_APP_EXCEL_TEMP_NO;

    useEffect(() => {
        loadData();
    }, []);

    const changeInput = useCallback((e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

    const clearInput = useCallback(() => {
        setInput({
            empName: "",
            deptName: "",
            gradeName: "",
            empContact: "",
            empEmail: "",
            empType: ""
        });
    }, [input]);

    const saveInput = useCallback(async () => {
        setEmps(prevEmps => [...prevEmps, input]);
        //정보 다시 로딩
        loadData();

        // 입력 폼 초기화
        clearInput();

        // 모달 닫기
        closeAddModal();
    }, [input]);

    const cancelInput = useCallback(() => {
        const choice = window.confirm("작성을 취소하시겠습니까?");
        if (choice === false) return;

        clearInput();

        closeAddModal();
    }, [input]);
    const loadData = useCallback(async () => {
        const gradeList = await axios.get("/company/gradeList");
        setGrades(gradeList.data);
        const deptList = await axios.get("/company/deptList");
        setDepts(deptList.data);
    }, []);

    const upload = useCallback((files) => {
        const file = files[0];
        if (!file) return; //파이리 없으면 리턴

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                header: 0,
                range: 1
            });

            const validKeys = ['empName', 'deptName', 'gradeName', 'empContact', 'empEmail', 'empType'];
            const validData = jsonData.filter(emp =>
                validKeys.every(key => emp.hasOwnProperty(key)) &&
                depts.includes(emp.deptName) &&
                grades.includes(emp.gradeName)
            );

            if (validData.length === jsonData.length) {
                setEmps(prevEmps => [...prevEmps, ...validData])
            } else {
                alert('업로드한 파일의 데이터 형식이 올바르지 않습니다.');
            }
            console.log(validData);
        };
        reader.readAsArrayBuffer(file);
    }, [depts, grades]);

    const fileInputRef = useRef();

    const handleUpload = () => {
        fileInputRef.current.click();
    }

    const handleCheckAll = useCallback(() => {
        const newState = !allChecked;
        setAllChecked(newState);
        setCheckedState(emps.reduce((state, emp, index) => ({
            ...state,
            [index]: newState
        }), {}));
    }, [allChecked, emps]);

    const handleCheck = useCallback((index) => {
        setCheckedState(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    }, []);

    const uploadSelected = useCallback(async () => {
        const selectedEmps = emps.filter((emp, index) => checkedState[index]);
        if (selectedEmps.length === 0) {
            alert("업로드할 사원을 선택하세요.");
            return;
        }
        const resp = await axios.post("/company/emp", selectedEmps);
        const newEmps = emps.filter((emp, index) => !checkedState[index]);
        setEmps(newEmps);
        // 모든 체크 상태 초기화
        setCheckedState({});
        setAllChecked(false);
        alert("사원이 등록되었습니다.");

    }, [checkedState, emps]);

    // const fileDownload = useCallback(async () => {
    //     const response = await axios.get("/download/" + 81, { responseType: 'blob' });
    //     const contentDisposition = response.headers['Content-Disposition'];
    //     console.log(contentDisposition);
    //     let filename = "default_filename.xlsx"; // 기본 파일 이름 설정

    //     if (contentDisposition) {
    //         const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
    //         if (filenameMatch) {
    //             filename = decodeURIComponent(filenameMatch[1]);
    //         } else {
    //             const filenameRegex = /filename="?([^"]+)"?;/;
    //             const match = contentDisposition.match(filenameRegex);
    //             if (match) {
    //                 filename = decodeURIComponent(match[1]); // 보편적으로 사용되는 경우를 대비하여 추가
    //             }
    //         }
    //     }
    //     saveAs(response.data, filename);
    // }, []);

    //정보 수정 모달
    const addModal = useRef();
    const openAddModal = useCallback(() => {
        const modal = new Modal(addModal.current);
        modal.show();
    }, [addModal]);
    const closeAddModal = useCallback(() => {
        const modal = Modal.getInstance(addModal.current);
        modal.hide();
    }, [addModal]);

    return (
        <>
            <Jumbotron title="사원 등록" />
            <div className="container-fluid">
                <div className='row mt-4'>
                    <div className='col d-flex justify-content-end'>
                        <button className='btn btn-success my-3 me-auto'
                            onClick={uploadSelected}>
                            <IoIosSave />
                            선택한 사원 업로드
                        </button>
                        <a href={`${baseURL}/download/${tempNo}`} className="btn btn-secondary my-3">
                            양식 다운로드
                        </a>
                        <button className='btn btn-primary my-3' onClick={handleUpload}>
                            <FaPlus />
                            사원 일괄 등록
                        </button>
                        <input type="file" accept=".xlsx, .csv, .xls"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={e => upload(e.target.files)} />
                        <button className='btn btn-primary my-3'
                            onClick={e => openAddModal()}>
                            <FaPlus />
                            사원 직접 등록
                        </button>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <table className="table">
                        <thead className="text-center">
                            <tr>
                                <th><input type="checkbox" checked={allChecked} onChange={handleCheckAll}></input></th>
                                <th>이름</th>
                                <th>부서</th>
                                <th>직급</th>
                                <th>전화번호</th>
                                <th>이메일</th>
                                <th>권한여부</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {emps.map((emp, index) => (
                                <tr key={emp.empName} className='align-items-center'>
                                    <td><input type="checkbox" checked={checkedState[index] || false} onChange={() => handleCheck(index)}></input></td>
                                    <td>{emp.empName}</td>
                                    <td>{emp.deptName}</td>
                                    <td>{emp.gradeName}</td>
                                    <td>{emp.empContact}</td>
                                    <td>{emp.empEmail}</td>
                                    <td>{emp.empType}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <div ref={addModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">사원 직접 등록</h1>
                            <button type="button" className="btn-close" aria-label="Close" onClick={e => cancelInput()}></button>
                        </div>
                        <div className="modal-body">
                            {/* 등록 화면 */}
                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>이름</label>
                                    <input type="text" name="empName"
                                        value={input.empName}
                                        onChange={e => changeInput(e)}
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>부서</label>
                                    <select
                                        name="deptName"
                                        value={input.deptName}
                                        onChange={e => changeInput(e)}
                                        className='form-control'>
                                        <option value="">부서 선택</option>
                                        {depts.map(dept => (
                                            <option value={dept}>
                                                {dept}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>직급</label>
                                    <select
                                        name="gradeName"
                                        value={input.gradeName}
                                        onChange={e => changeInput(e)}
                                        className='form-control'>
                                        <option value="">직급 선택</option>
                                        {grades.map(grade => (
                                            <option value={grade}>
                                                {grade}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>전화번호</label>
                                    <input type="text" name="empContact"
                                        value={input.empContact}
                                        onChange={e => changeInput(e)}
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>이메일</label>
                                    <input type="text" name="empEmail"
                                        value={input.empEmail}
                                        onChange={e => changeInput(e)}
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>권한여부</label>
                                    <select
                                        name="empType"
                                        value={input.empType}
                                        onChange={e => changeInput(e)}
                                        className='form-control'>
                                        <option value="">권한 선택</option>
                                        <option value='사원'>사원</option>
                                        <option value='임원'>임원</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className='btn btn-danger'
                                onClick={e => cancelInput()}>
                                <GiCancel />
                                &nbsp;
                                취소
                            </button>
                            <button className='btn btn-success me-2'
                                onClick={e => saveInput()}>
                                <IoIosSave />
                                &nbsp;
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddEmp;