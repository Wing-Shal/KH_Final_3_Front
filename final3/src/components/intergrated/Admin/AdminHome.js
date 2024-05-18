import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminHome.css';
import { Navigate } from 'react-router';
import { NavLink } from 'react-router-dom';

const AdminHome = () => {
    return (
        <div className="admin-home-container container">
            <h1 className="my-4">운영자 메인 페이지</h1>
            <div className="row">
                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="card-title">회사 관리</h5>
                            <p className="card-text">사용자 정보를 관리하고, 새로운 사용자를 추가할 수 있습니다.</p>
                            <NavLink to="/admin/company" className="btn btn-dark">회사 관리</NavLink>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="card-title">템플릿 설정</h5>
                            <p className="card-text">사원 추가 엑셀 템플릿를 업로드할 수 있습니다</p>
                            <NavLink to="/admin/upload" className="btn btn-dark">설정 변경</NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;