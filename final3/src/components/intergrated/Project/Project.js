
import { useCallback, useEffect, useRef, useState } from "react";
import { loginIdState, loginLevelState } from '../../../components/utils/RecoilData';
import { useRecoilState } from 'recoil';
import Jumbotron from "../../Jumbotron";
import { FaSquareXmark } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { TbPencilCancel } from "react-icons/tb";
import axios from "../../utils/CustomAxios";
import { Modal } from "bootstrap";
import { Link } from 'react-router-dom';
import { FcOpenedFolder } from "react-icons/fc";
import { RiUserSearchFill } from "react-icons/ri";

const Project = () => {

    //state
    // const projectName = 'Your Project Name'; // 예시로 고정값 사용, 실제로는 상태나 변수로 가져와야 함
    const [loginId, setLoginId] = useRecoilState(loginIdState);
    const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);
    const [projects, setProjects] = useState([]);
    const [emps, setEmps] = useState([]);
    const [depts, setDepts] = useState([]);
    const [grades, setGrades] = useState([]);
    // const [empInfo, setEmpInfo] = useState([]);
    const [input, setInput] = useState({
        projectName: "",
        projectStartTime: "",
        projectLimitTime: "",
        empNo: "",
        empName: "",
        deptName: "",
        gradeName: ""
    });
    const [backup, setBackup] = useState(null);//수정 시 복원을 위한 백업

    //effect
    useEffect(() => {

        loadData();
        // loadEmpData();
    }, []);

    // const loadEmps = useCallback(async() =>{
    //     const empNo = loginId;
    //     const resp = await axios.get("/company/"+empNo);
    //     setEmps(resp.data);
    //     console.log(resp.data)

    // });



    //현재 쓰고있는 코드
    const loadData = useCallback(async () => {
        const empNo = loginId;
        // const empList = await axios.get("/project/companyEmployees/" + empNo)
        // setEmps(empList.data);
       
        const resp = await axios.get("/project/" + empNo);
        setProjects(resp.data);


    }, []);


    //삭제
    const deleteProject = useCallback(async (target) => {
        const choice = window.confirm("정말 삭제하시겠습니까?");
        if (choice === false) return;
        //target에 있는 내용을 서버에 지워달라고 요청하고 목록을 다시 불러온다
        const resp = await axios.delete("/project/" + target.projectNo);
        loadData();
    }, [projects]);
    //신규 등록 화면 입력값 변경
    const changeInput = useCallback((e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);
    //등록
    const saveInput = useCallback(async () => {
        const resp = await axios.post("/project/", input);
        loadData();
        clearInput();
        closeModal();
    }, [input]);


    //등록 취소
    const cancelInput = useCallback(() => {
        const choice = window.confirm("작성을 취소하시겠습니까?");
        if (choice === false) return;
        clearInput();
        closeModal();
    }, [input]);
    //입력값 초기화
    const clearInput = useCallback(() => {
        setInput({
            projectName: "",
            projectStartTime: "",
            projectLimitTime: "",
            empNo: "",
            empName: ""

        });
    }, [input]);
    //수정
    const editProject = useCallback((target) => {
        //복제
        const copy = [...projects];
        //(+추가) 이미 수정중인 항목이 있을 수 있으므로 해당 항목은 취소 처리가 필요
        const recover = copy.map(project => {
            if (project.edit === true) {//수정중인 항목을 발견하면
                return { ...backup, edit: false };//백업으로 갱신 + 수정모드 취소
            }
            else {
                return { ...project };//그대로
            }
        });
        setBackup({ ...target }); //백업
        const copy2 = recover.map(project => {
            if (target.projectNo === project.projectNo) {//원하는 정보일 경우
                return {
                    ...project,//나머지 정보는 유지하되
                    edit: true,//edit 관련된 처리를 추가하여 반환
                };
            }
            else {//원하는 정보가 아닐 경우
                return { ...project };//데이터를 그대로 복제하여 반환
            }
        });

        setProjects(copy2);
    }, [projects]);
    const cancelEditProject = useCallback((target) => {
        //1. 복제한다
        const copy = [...projects];
        const copy2 = copy.map(project => {

            if (target.projectNo === project.projectNo) {//원하는 정보일 경우
                return {
                    ...backup,//백업 정보를 전달
                    edit: false,//edit 관련된 처리를 추가하여 반환
                };
            }
            else {//원하는 정보가 아닐 경우
                return { ...project };//데이터를 그대로 복제하여 반환
            }
        });
        //덮어씌우기
        setProjects(copy2);
    }, [projects]);
    const changeProject = useCallback((e, target) => {
        const copy = [...projects];
        const copy2 = copy.map(project => {
            if (target.projectNo === project.projectNo) {//
                return {
                    ...project,//나머지 정보는 유지
                    [e.target.name]: e.target.value//단, 입력항목만 교체
                };
            }
            else {//다른 학생이라면
                return { ...project };//현상유지
            }
        });
        setProjects(copy2);
    }, [projects]);
    //수정된 결과를 저장 + 목록갱신 + 수정모드 해제
    const saveEditProject = useCallback(async (target) => {
        //서버에 target을 전달하여 수정 처리
        const resp = await axios.patch("/project/", target);
        //목록 갱신
        loadData();
    }, [projects]);

    //ref + modal
    const bsModal = useRef();
    const openModal = useCallback(() => {
        const modal = new Modal(bsModal.current);
        setInput({
            ...input,
            empNo: loginId
        });
        modal.show();
    }, [bsModal]);
    const closeModal = useCallback(() => {
        const modal = Modal.getInstance(bsModal.current);
        modal.hide();
    }, [bsModal]);
    //view

    return (
        <>
            <Jumbotron title="내 프로젝트" />
            <div className="row mt-4">
                <div className="col text-end">
                    <button className="btn btn-primary" onClick={openModal} style={{ backgroundColor: 'pink', border: 'none' }}>
                        <IoMdAdd /> 새 프로젝트
                    </button>


                </div>
            </div>

            {projects.map(project => (
                <div key={project.projectNo} className="row mt-4">
                    <div className="col">
                        <div className="card mb-3">
                            <div className="card-body">
                                <div className="card-title d-flex align-items-center">
                                    <FcOpenedFolder style={{ color: '#007bff', fontSize: '1.5em', marginRight: '0.5em' }} />
                                    {project.edit ? (
                                        <input type="text" value={project.projectName} name="projectName" onChange={(e) => changeProject(e, project)} className="form-control" />
                                    ) : (
                                        <Link to={`/document/project/${project.projectNo}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            {project.projectName}
                                        </Link>
                                    )}
                                </div>
                                <div className="card-text">프로젝트 번호: {project.projectNo}</div>
                                <div className="card-text">작성자: {project.projectWriter}</div>
                                <div className="card-date-picker">시작일: {project.edit ? <input type="date" name="projectStartTime" value={project.projectStartTime} onChange={(e) => changeProject(e, project)} /> : project.projectStartTime}</div>
                                <div className="card-date-picker">마감일: {project.edit ? <input type="date" name="projectLimitTime" value={project.projectLimitTime} onChange={(e) => changeProject(e, project)} /> : project.projectLimitTime}</div>
                                <div className="text-end">
                                    {project.edit ? (
                                        <>
                                            <FaCheck className="text-success me-2" onClick={() => saveEditProject(project)} />
                                            <TbPencilCancel className="text-danger" onClick={() => cancelEditProject(project)} />
                                        </>
                                    ) : (
                                        <>
                                            <FaEdit className="text-warning me-2" onClick={() => editProject(project)} />
                                            <FaSquareXmark className="text-danger" onClick={() => deleteProject(project)} />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Modal */}
            <div ref={bsModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">새 프로젝트</h1>
                            <button type="button" className="btn-close" aria-label="Close" onClick={cancelInput}></button>
                        </div>
                        <div className="modal-body">
                            <div>
                                <p>사원 번호: {input.empNo}</p>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <label>프로젝트 명</label>
                                    <input type="text" name="projectName" value={input.projectName} onChange={changeInput} className="form-control" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <label>시작일</label>
                                    <input type="date" name="projectStartTime" value={input.projectStartTime} onChange={changeInput} className="form-control" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <label>마감일</label>
                                    <input type="date" name="projectLimitTime" value={input.projectLimitTime} onChange={changeInput} className="form-control" />
                                </div>
                            </div>
                         
                            <div className="row mt-4">
                                <div className="col">
                                    <table className="table">
                                        <thead className="text-center">
                                            <tr>
                                                <th>사번</th>
                                                <th>이름</th>

                                            </tr>
                                        </thead>
                                        <tbody className="text-center">
                                            {emps.map((emp, Index) => (
                                                <tr key={Index} className='align-items-center'>
                                                    <td>{emp.empNo}</td>
                                                    <td>{emp.empName}</td>


                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-success me-2" onClick={saveInput}>등록</button>
                            <button className="btn btn-danger" onClick={cancelInput}>취소</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default Project;