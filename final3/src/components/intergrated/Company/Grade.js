import Jumbotron from "../../Jumbotron";
import React, { useCallback, useEffect, useState } from 'react';
import axios from '../../utils/CustomAxios';
import { useRecoilState } from "recoil";
import { loginIdState } from "../../utils/RecoilData";
import { FaMinus, FaPlus } from "react-icons/fa";

const Grade = () => {

    const [grades, setGrades] = useState([]);
    const [loginId, setLoginId] = useRecoilState(loginIdState);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(async () => {
        const resp = await axios.get("/company/grade");
        setGrades(resp.data);
    }, [grades]);

    const addGrade = () => {
        setGrades([...grades, { gradeNo: 0, companyNo:parseInt(loginId) ,gradeName: '' }]);
    };

    const saveGrades = async () => {
        const resp = await axios.post("/company/grade", grades);
    };

    const changeInput = (index, e) => {
        const newGrades = [...grades];
        newGrades[index][e.target.name] = e.target.value;
        setGrades(newGrades);
    };

    const deleteGrade = async (gradeNo, index) => {
        const response = await axios.get("/company/grade/hasEmp/"+gradeNo);
            const choice = window.confirm("정말 삭제하시겠습니까?")
            if(!choice) return;
            if (response.data.length > 0) {
                alert('해당 직급의 사원이 존재합니다.');
            } else {
                await axios.delete("/company/grade/"+gradeNo);
                const updatedGrades = [...grades];
                updatedGrades.splice(index, 1);
                setGrades(updatedGrades);
                alert('직급이 삭제되었습니다.');
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
                                <th>직급목록</th>
                            </tr>
                        </thead>
                        <tbody className='text-center'>
                            {grades.map((grade, index) => (
                                <tr key={index} className='align-items-center'>
                                    <td>
                                    <div style={{ position: 'relative' }}>
                                            <input type="text" className="form-control"
                                                name="gradeName" value={grade.gradeName}
                                                onChange={(e) => changeInput(index, e)} />
                                            <FaMinus className="text-danger me-2" 
                                                style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} 
                                                onClick={() => deleteGrade(grade.gradeNo, index)} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="row mt-3">
                        <div className="col d-flex justify-content-end">
                            <button onClick={saveGrades} className="btn btn-success me-2">저장</button>
                            <button onClick={addGrade} className="btn btn-primary"><FaPlus /></button>
                        </div>
                    </div>
                </div>

            </div>

        </>
    );
}
export default Grade;