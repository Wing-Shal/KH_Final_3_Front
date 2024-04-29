import { useState } from "react";
import { Link } from "react-router-dom";
import Jumbotron from "../../Jumbotron";
import NewDocument from "./NewDocument";


function ProjectList(){

    //state

    const [projects, setProjects] = useState([
        {projectNo:1, projectName:"프로젝트시작"},
        {projectNo:2, projectName:"CRUD작성"},
        {projectNo:3, projectName:"REACT 틀 구현"},
      
    ]);
    const [showModal, setShowModal] = useState(false);

    // 새로운 문서 작성 모달을 열기 위한 함수
    const openModal = () => {
        setShowModal(true);
    };

    return (
        <>
                  <Jumbotron title="내 프로젝트"/>

<div className="row mt-4 justify-content-center"> {/* 가운데 정렬 */}
    <div className="col">
        <button onClick={openModal} className="btn btn-primary">➕새 프로젝트</button>
    </div>
</div>
{showModal && <NewDocument closeModal={() => setShowModal(false)} />}
<div className="row mt-4 justify-content-center"> {/* 가운데 정렬 */}
    <div className="col">
        <div className="row">
            {projects.map((project, index) => (
                <div key={project.projectNo} className="col-6" style={{ lineHeight: '2' }}> 
                    <Link to={`/project/${project.projectNo}`} style={{ textDecoration: 'none' }}>
                        😀 {index + 1} {project.projectName}
                    </Link>
                </div>
            ))}
        </div>
    </div>
</div>

        </>
    );
}

export default ProjectList;
