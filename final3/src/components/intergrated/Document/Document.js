import React, { useCallback, useEffect, useState } from "react";
import { loginIdState } from '../../../components/utils/RecoilData';
import { useRecoilState } from 'recoil';
import Jumbotron from "../../Jumbotron";
import { FaSquareXmark } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import axios from "../../utils/CustomAxios";

const Project = () => {
    // State
    const [loginId, setLoginId] = useRecoilState(loginIdState);
    const [projects, setProjects] = useState([]);
    const [input, setInput] = useState({
        projectName: "",
        projectStartTime: "",
        projectLimitTime: "",
        empNo: ""
    });
    const [backup, setBackup] = useState(null);

    // Effect: 페이지 로드 시 데이터 로딩
    useEffect(() => {
        loadData();
    }, []);

    // Data Loading
    const loadData = useCallback(async () => {
        const empNo = loginId;
        const resp = await axios.get("/project/" + empNo);
        setProjects(resp.data);
    }, []);

    // Data Deletion
    const deleteProject = useCallback(async (target) => {
        const choice = window.confirm("정말 삭제하시겠습니까?");
        if (!choice) return;

        // 서버에 삭제 요청 후 데이터 다시 로드
        await axios.delete("/project/" + target.projectNo);
        loadData();
    }, []);

    // New Project Input Change
    const changeInput = useCallback((e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

    // Register
    const saveInput = useCallback(async () => {
        await axios.post("/project/", input);
        loadData();
        clearInput();
    }, [input]);

    // Cancel Registration
    const cancelInput = useCallback(() => {
        const choice = window.confirm("작성을 취소하시겠습니까?");
        if (choice) clearInput();
    }, [input]);

    // Clear Input
    const clearInput = useCallback(() => {
        setInput({
            projectName: "",
            projectStartTime: "",
            projectLimitTime: "",
            empNo: ""
        });
    }, []);

    // Editing
    const editProject = useCallback((target) => {
        const copy = [...projects];

        const recover = copy.map(project => {
            if (project.edit === true) {
                return { ...backup, edit: false };
            } else {
                return { ...project };
            }
        });
        setBackup({ ...target });

        const copy2 = recover.map(project => {
            if (target.projectNo === project.projectNo) {
                return {
                    ...project,
                    edit: true,
                };
            } else {
                return { ...project };
            }
        });

        setProjects(copy2);
    }, [projects]);

    // View
    return (
        <>
            {/* Title */}
            <Jumbotron title={`${project.projectName}`} />

            {/* New Project Button */}
          

            {/* Project List */}
            <div className="row mt-4 center">
    {projects.map(project => (
        <div className="col-12" key={project.projectNo}>
            <div className="card mb-4" style={{ height: '800px' }}>
                <div className="card-body">
                    <div className="row"> {/* 시작일과 마감일을 감싸는 row 추가 */}
                        <div className="col">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="d-flex align-items-center">
                                        <div className="alert alert-warning me-2" style={{ fontSize: '20px' }}>프로젝트명: {project.projectName}</div>
                                        <div className="alert alert-warning me-2" style={{ fontSize: '20px' }}>문서 번호: {project.documentNo}</div>
                                        <div className="alert alert-danger me-2" style={{ fontSize: '20px' }}>상태: {project.status}</div>
                                    </div>
                                </div>
                                <div className="col text-end">
                                    <button className="btn btn-warning" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                                        <IoMdAdd />
                                        새 문서
                                    </button>
                                </div>
                            </div>
                            <div className="d-flex align-items-center flex-wrap">
                                <label className="me-2">시작일 </label>
                                <input type="date" className="form-control me-2" style={{ width: '200px' }} value={project.projectStartTime} onChange={changeInput} />
                                <label className="me-2">마감일 </label>
                                <input type="date" className="form-control me-2" style={{ width: '200px' }} value={project.projectLimitTime} onChange={changeInput} />
                            </div>
                        </div>
                    </div>
                    <div className="mb-3"></div> {/* 마감일 아래에 여백 추가 */}
                    <div className="d-flex align-items-center">
                        <div className="alert alert-light me-1" style={{ fontSize: '30px' , width: '1050px'}}>제목 {project.projectName}</div>
                    </div>
                    <div>
                        <div className="d-flex align-items-center">
                            <div className="alert alert-light me-1" style={{ fontSize: '30px'  , width: '1050px', height:'450px'}}>내용 {project.projectName}</div>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
    <div className="d-flex align-items-center">
        <div className="alert alert-success me-1" style={{ fontSize: '20px' }}>작성자 {project.projectWriter}</div>
        <div className="alert alert-success me-1" style={{ fontSize: '20px' }}>결재자 {project.projectWriter}</div>
    </div>
                        <div className="d-flex align-items-center">
        <button className="btn btn-warning me-2" onClick={() => editProject(project)} style={{ fontSize: '25px' }}>
            <FaEdit />
        </button>
        <button className="btn btn-danger" onClick={() => deleteProject(project)} style={{ fontSize: '25px' }}>
            <FaSquareXmark />
        </button>
    </div>
    </div>
                </div>
            </div>
        </div>
    ))}
</div>


            {/* New Project Modal */}
            <div className="modal fade" id="staticBackdrop" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">새 프로젝트</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {/* Registration Form */}
                            <div>
                                <label className="form-label">프로젝트명</label>
                                <input type="text" className="form-control" name="projectName" value={input.projectName} onChange={changeInput} />
                            </div>
                            <div>
                                <label className="form-label">시작일</label>
                                <input type="date" className="form-control" name="projectStartTime" value={input.projectStartTime} onChange={changeInput} />
                            </div>
                            <div>
                                <label className="form-label">마감일</label>
                                <input type="date" className="form-control" name="projectLimitTime" value={input.projectLimitTime} onChange={changeInput} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={saveInput}>등록</button>
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={cancelInput}>취소</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Project;
