import { useEffect, useState, useCallback, useRef } from "react";
import axios from '../../utils/CustomAxios';
import { FaPenToSquare, FaXmark } from "react-icons/fa6";
import { IoIosSave } from "react-icons/io";
import { GiCancel } from "react-icons/gi";
import { Modal } from 'bootstrap';
import Jumbotron from "../../Jumbotron";
import { throttle } from "lodash";
import './EmpList.css';

const EmpList = () => {

    const [emps, setEmps] = useState([]);
    const [depts, setDepts] = useState([]);
    const [grades, setGrades] = useState([]);
    const [input, setInput] = useState({});
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(15);
    const [count, setCount] = useState(0);
    const [last, setLast] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const loading = useRef(false);

    const loadData = useCallback(async () => {  
        const searchQuery = searchTerm ? `?search=${searchTerm}` : "";
        const empList = await axios.get(`/company/emp/page/${page}/size/${size}${searchQuery}`);
        setCount(empList.data.count);
        setLast(empList.data.last);
        if (page > 1) {
            setEmps(prevEmps => [...prevEmps, ...empList.data.list]);
        } else {
            setEmps(empList.data.list);
        }
    }, [page, size, searchTerm]);

    useEffect(() => {
        const loadInfo = async () => {
            const gradeList = await axios.get("/company/gradeList");
            setGrades(gradeList.data);
            const deptList = await axios.get("/company/deptList");
            setDepts(deptList.data);
        };
        loadInfo();
    }, []);

    useEffect(() => {
        loading.current = true;
        loadData();
        loading.current = false;
    }, [page]);

    const listener = useCallback(throttle((e) => {
        if (loading.current || last) return; //로딩중이면 리턴

        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollTop = window.scrollY;
        const scrollPercent = (scrollTop / scrollableHeight) * 100;

        if (last === false && scrollPercent >= 80) {
            setPage(prevPage => prevPage + 1);
        }
    }, 750), [last, loading.current]);

    useEffect(() => {
        if (loading.current === true) return;

        window.addEventListener("scroll", listener);

        return () => {
            window.removeEventListener("scroll", listener);
        }
    }, [listener]);

    const changeInput = useCallback((e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

    const clearInput = useCallback(() => {
        setInput({
            companyNo: "",
            empNo: "",
            empName: "",
            deptName: "",
            gradeName: "",
            empContact: "",
            empEmail: "",
            empStatus: "",
            empJoin: "",
            empExit: ""
        });
    }, [input]);

    const saveInput = useCallback(async () => {
        const resp = await axios.patch("/company/emp", input);

        loading.current = true;
        loadData();
        loading.current = false;

        clearInput();

        closeEditModal();
    }, [input]);

    const cancelInput = useCallback(() => {
        // const choice = window.confirm("작성을 취소하시겠습니까?");
        // if (choice === false) return;

        clearInput();

        closeEditModal();
    }, [input]);

    const clearSearch = useCallback(async () => {
        setSearchTerm("");
        setPage(1);
        const empList = await axios.get(`/company/emp/page/${page}/size/${size}`);
        setEmps(empList.data.list);
        setCount(empList.data.count);
        setLast(empList.data.last);
    }, [loadData]);

    const handleSearch = useCallback(() => {
        setPage(1);
        loadData();
    }, [loadData]);

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    //정보 수정 모달
    const editModal = useRef();
    const openEditModal = useCallback((emp) => {
        const modal = new Modal(editModal.current);
        setInput(emp)
        modal.show();
    }, [editModal]);
    const closeEditModal = useCallback(() => {
        const modal = Modal.getInstance(editModal.current);
        modal.hide();
    }, [editModal]);

    return (
        <>
            <Jumbotron title="사원 목록/관리" />

            <div className="row mt-4">
                <div className="col-6 offset-3">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control search-bar"
                            placeholder="검색..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <button onClick={clearSearch} className="btn btn-warning"><FaXmark /></button>
                        <button onClick={handleSearch} className="btn btn-primary">검색</button>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <table className="table">
                        <thead className="text-center">
                            <tr>
                                <th>사번</th>
                                <th>이름</th>
                                <th>부서</th>
                                <th>직급</th>
                                <th>전화번호</th>
                                <th>이메일</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {emps.map(emp => (
                                <tr key={emp.empNo} className='align-items-center'>
                                    <td>{emp.empNo}</td>
                                    <td>{emp.empName}</td>
                                    <td>{emp.deptName}</td>
                                    <td>{emp.gradeName}</td>
                                    <td>{emp.empContact}</td>
                                    <td>{emp.empEmail}</td>
                                    <td>
                                        <FaPenToSquare className='text-warning me-2 pointer'
                                            onClick={() => openEditModal(emp)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <div ref={editModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">사원 정보 수정</h1>
                            <button type="button" className="btn-close" aria-label="Close" onClick={e => cancelInput()}></button>
                        </div>
                        <div className="modal-body">
                            {/* 수정 화면 */}
                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>사번</label>
                                    <input type="text" name="empNo"
                                        value={input.empNo}
                                        readOnly
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>이름</label>
                                    <input type="text" name="empName"
                                        value={input.empName}
                                        readOnly
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
                                        readOnly
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>이메일</label>
                                    <input type="text" name="empEmail"
                                        value={input.empEmail}
                                        readOnly
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>입사일</label>
                                    <input type="text" name="empJoin"
                                        value={input.empJoin}
                                        readOnly
                                        className='form-control' />
                                </div>
                            </div>

                            <div className='row mt-4'>
                                <div className='col'>
                                    <label>퇴사일</label>
                                    <input type="text" name="empExit"
                                        value={input.empExit}
                                        readOnly
                                        className='form-control' />
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

export default EmpList;