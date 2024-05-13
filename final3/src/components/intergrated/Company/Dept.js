import Jumbotron from "../../Jumbotron";
import React, { useCallback, useEffect, useState } from 'react';
import axios from '../../utils/CustomAxios';
import { useRecoilState } from "recoil";
import { loginIdState } from "../../utils/RecoilData";
import { FaMinus, FaPlus } from "react-icons/fa";

const Dept = () => {

    const [depts, setDepts] = useState([]);
    const [loginId, setLoginId] = useRecoilState(loginIdState);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(async () => {
        const resp = await axios.get("/company/dept");
        setDepts(resp.data);
    }, [depts]);

    const addDept = () => {
        setDepts([...depts, { deptNo: 0, companyNo:parseInt(loginId) ,deptName: '' }]);
    };

    const saveDepts = async () => {
        console.log(depts);
        const resp = await axios.post("/company/dept", depts);
    };

    const changeInput = (index, e) => {
        const newDepts = [...depts];
        newDepts[index][e.target.name] = e.target.value;
        setDepts(newDepts);
    };

    const deleteDept = async (deptNo, index) => {
        const response = await axios.get("/company/dept/hasEmp/"+deptNo);
            const choice = window.confirm("정말 삭제하시겠습니까?")
            if(!choice) return;
            if (response.data.length > 0) {
                alert('사원이 존재하는 부서는 삭제할 수 없습니다.');
            } else {
                await axios.delete("/company/dept/"+deptNo);
                const updatedDepts = [...depts];
                updatedDepts.splice(index, 1);
                setDepts(updatedDepts);
                alert('부서가 삭제되었습니다.');
            }
    };


    return (
        <>
            <br /><br />
            <div className='row mt-5'>
                <div className='col'>
                    <table className='table'>
                        <thead className='text-center'>
                            <tr className='align-items-center'>
                                <th>부서목록</th>
                            </tr>
                        </thead>
                        <tbody className='text-center'>
                            {depts.map((dept, index) => (
                                <tr key={index} className='align-items-center'>
                                    <td>
                                    <div style={{ position: 'relative' }}>
                                            <input type="text" className="form-control"
                                                name="deptName" value={dept.deptName}
                                                onChange={(e) => changeInput(index, e)} />
                                            <FaMinus className="text-danger me-2" 
                                                style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} 
                                                onClick={() => deleteDept(dept.deptNo, index)} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="row mt-3">
                        <div className="col d-flex justify-content-end">
                            <button onClick={saveDepts} className="btn btn-success me-2">저장</button>
                            <button onClick={addDept} className="btn btn-primary"><FaPlus /></button>
                        </div>
                    </div>
                </div>

            </div>

        </>
    );
}
export default Dept;