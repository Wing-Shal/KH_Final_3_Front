import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from "../../utils/CustomAxios";
import { loginIdState } from '../../utils/RecoilData';
import { useRecoilState } from 'recoil';
import calender from "../../../assets/calender.png";
import defaultImage from "../../../assets/userImage.png"; // 기본 이미지 경로를 추가해주세요
import { Link } from 'react-router-dom';
import './EmpMypage.css';
import { Modal } from 'bootstrap';
import { Calendar as FullCalendar } from '@fullcalendar/core';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import '.././Calendar/EmpCalendar.css';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import { MdCancel } from "react-icons/md";
import { IoSaveOutline } from "react-icons/io5";

function EmpMypage() {
  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loginId, setLoginId] = useRecoilState(loginIdState);
  const [projects, setProjects] = useState([]);
  const [empInfo, setEmpInfo] = useState({});
  const [editableInfo, setEditableInfo] = useState({});
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const editModal = useRef();
  const editPwModal = useRef();

  // 모달 열기
  const openEditModal = useCallback((empInfo) => {
    const modal = new Modal(editModal.current);
    setEditableInfo(empInfo);
    modal.show();
  }, [editModal]);
  const closeEditModal = useCallback(() => {
    const modal = Modal.getInstance(editModal.current);
    modal.hide();
  }, [editModal]);

  // 모달 열기
  const openEditPwModal = useCallback(() => {
    const modal = new Modal(editPwModal.current);
    modal.show();
  }, [editPwModal]);
  const closeEditPwModal = useCallback(() => {
    const modal = Modal.getInstance(editPwModal.current);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordError('');
    modal.hide();
  }, [editPwModal]);


  // 정보 수정
  const handleChange = (e) => {
    const { name, value } = e.target;
    // 수정 가능한 정보 상태 업데이트
    setEditableInfo({ ...editableInfo, [name]: value });
  };

  const handleCurrentPasswordChange = (e) => {
    setCurrentPassword(e.target.value);
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmNewPasswordChange = (e) => {
    setConfirmNewPassword(e.target.value);
  };

  // 저장 버튼 클릭 시
  const handleSaveInfo = async () => {
    try {
      const dataToSend = { ...editableInfo };
      const response = await axios.patch("emp/edit", dataToSend);
      // 모달 닫기
      closeEditModal();
      // 업데이트된 정보를 화면에 반영
      setEmpInfo(editableInfo);
    } catch (error) {
      //console.error('사원 정보 업데이트 오류:', error);
    }
  };

  const handleSavePassword = async () => {
    try {
      // 현재 비밀번호가 empPw와 일치하지 않은 경우
      if (currentPassword !== empInfo.empPw) {
        setPasswordError('현재 비밀번호가 일치하지 않습니다.');
        return;
      }
      if (currentPassword === '') {
        setPasswordError('현재 비밀번호를 입력해주세요.');
        return;
      }
      if (newPassword === '') {
        setPasswordError('새로운 비밀번호를 입력해주세요.');
        return;
      }
      if (confirmNewPassword === '') {
        setPasswordError('비밀번호 확인을 입력해주세요.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setPasswordError('새로운 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }
      if (newPassword === currentPassword) {
        setPasswordError('현재 비밀번호와 변경할 비밀번호가 동일합니다');
        return;
      }
      const dataToSend = {
        empNo: empInfo.empNo,
        currentPassword: currentPassword,
        empPw: newPassword
      };
      const response = await axios.patch("/emp/edit", dataToSend);
      closeEditPwModal();
      // 비밀번호 변경이 완료되었다는 알람 표시
      alert('비밀번호 변경이 완료되었습니다.');
    } catch (error) {
      setPasswordError('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };


  useEffect(() => {
    loadProjects();
    loadEmpData();

    // 페이지가 렌더링될 때 로컬 스토리지에서 이미지를 가져와서 설정
    const savedImage = localStorage.getItem(`savedImage_${loginId}`);
    if (savedImage) {
      setImagePreview(savedImage);
    } else {
      // 만약 저장된 이미지가 없다면 기본 이미지로 설정
      setImagePreview(defaultImage);
    }
  }, []);

  const loadEmpData = async () => {
    try {
      const resp = await axios.get('/emp/');
      setEmpInfo(resp.data);
    } catch (error) {
      //console.error('사원 정보 불러오기 오류:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const empNo = loginId;
      const resp = await axios.get("/project/" + empNo);
      setProjects(resp.data);
    } catch (error) {
      //console.error('프로젝트 목록 불러오기 오류:', error);
    }
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // 이미지를 선택한 후 로컬 스토리지에 저장
        //localStorage.setItem(`savedImage_${loginId}`, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      if (file && file.type.startsWith('image/')) { // 이미지 파일만 허용
        const formData = new FormData();
        formData.append('attach', file);

        const response = await axios.post("/emp/upload/" + loginId, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }, [loginIdState]);

        // 기본 이미지를 로컬 스토리지에 저장
        localStorage.setItem(`savedImage_${loginId}`, imagePreview);
      }
    } catch (error) {
      //console.error('파일 업로드 오류:', error);
    }
    setFile(null);
  };

  // 기본 이미지 설정 함수
  const setDefaultImage = () => {
    setImagePreview(defaultImage); // 이미지 미리보기를 기본 이미지로 설정
    const defaultFile = new File([defaultImage], 'defaultImage.jpg', { type: 'image/jpeg' }); // 기본 이미지에 대한 파일 객체 생성
    setFile(defaultFile); // 파일 상태를 기본 이미지 파일로 설정

    // 기본 이미지를 로컬 스토리지에 저장
    //localStorage.setItem(`savedImage_${loginId}`, defaultImage);
  };

  //캘린더
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [input, setInput] = useState({
    calendarTitle: "",
    calendarContent: "",
    calendarStart: "",
    calendarEnd: "",
  });

  const changeInput = useCallback((e) => {
    const { name, value } = e.target;
    setInput((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
  }, []);

  //입력값 초기화
  const clearInput = useCallback(() => {
    setInput({
      calendarTitle: "",
      calendarContent: "",
      calendarStart: "",
      calendarEnd: "",
    })
  }, [input]);

  //신규등록
  const saveInput = useCallback(async () => {
    const token = axios.defaults.headers.common['Authorization'];
    if (!token) return;

    const formattedInput = {
      ...input,
      calendarStart: formatDate(new Date(input.calendarStart)),
      calendarEnd: formatDate(new Date(input.calendarEnd)),
    };

    const resp = await axios.post("/calendar/", formattedInput, {
      headers: {
        Authorization: token
      }
    });
    await loadCalendarEvents();
    clearInput();
    closeInputModal();
  }, [input]);

  useEffect(() => {
    loadCalendarEvents();
  }, []);

  const loadCalendarEvents = useCallback(async () => {
    const resp = await axios.get("/calendar/listOnlyMe");
    // console.log(resp);
    const calendarEvents = resp.data.map(event => ({
      id: event.calendarNo.toString(),
      title: event.calendarTitle,
      start: event.calendarStart,
      end: event.calendarEnd,
      extendedProps: {
        calendarNo: event.calendarNo,
        title: event.calendarTitle,
        start: event.calendarStart,
        end: event.calendarEnd,
        calendarWriter: event.calendarWriter,
        empName: event.empName,
        empGrade: event.empGrade,
        calendarContent: event.calendarContent
      }
    }));
    setEvents(calendarEvents);
  }, [setEvents])


  const openInfo = (clickInfo) => {
    setSelectedEvent(clickInfo.event.extendedProps);
    openInfoModal();
  };

  useEffect(() => {
    const calendar = new FullCalendar(calendarRef.current, {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      // editable: true,
      events: events,
      selectable: true,
      select: dateSelect,
      eventClick: openInfo,
      eventTimeFormat: {
        hour: 'numeric',
        meridiem: 'short'
      },
    });

    calendar.render();

    return () => {
      calendar.destroy();
    };
  }, [events]);


  //삭제하기
  const deleteCalendar = useCallback(async (target) => {
    const choice = window.confirm("ㄹㅇ 삭제?");
    if (choice === false) return;

    const resp = await axios.delete("/calendar/" + target.calendarNo);
    loadCalendarEvents();
    closeInfoModal();
  }, [events])

  //수정하기
  const editCalendar = useCallback(async () => {
    const formattedInput = {
      ...input,
      calendarStart: formatDate(new Date(input.calendarStart)),
      calendarEnd: formatDate(new Date(input.calendarEnd)),
    };

    const resp = await axios.patch("/calendar/", formattedInput);
    await loadCalendarEvents();
    clearInput();
    closeEditCModal();
    loadCalendarEvents();
    // openInfo(resp.data.calendarNo);
  }, [input]);


  //일정 상세 모달
  const bsInfoModal = useRef();
  const openInfoModal = useCallback(() => {
    const modal = new Modal(bsInfoModal.current);
    modal.show();
  }, []);

  const closeInfoModal = useCallback(() => {
    const modal = Modal.getInstance(bsInfoModal.current);
    modal.hide();
  }, []);

  //수정 모달
  const bsEditModal = useRef();
  const openEditCModal = useCallback(() => {
    if (selectedEvent) {
      closeInfoModal();
      setInput({
        calendarNo: selectedEvent.calendarNo,
        calendarWriter: selectedEvent.calendarWriter,
        calendarTitle: selectedEvent.title,
        calendarContent: selectedEvent.calendarContent,
        calendarStart: selectedEvent.start,
        calendarEnd: selectedEvent.end,
      });
      const modal = new Modal(bsEditModal.current);
      modal.show();
    }
  }, [selectedEvent]);

  const closeEditCModal = useCallback(() => {
    const modal = Modal.getInstance(bsEditModal.current);
    clearInput();
    modal.hide();
  }, []);


  //일정 등록 모달
  const bsInputModal = useRef();
  const openInputModal = useCallback(() => {
    const modal = new Modal(bsInputModal.current);
    modal.show();
  }, []);

  const closeInputModal = useCallback(() => {
    const modal = Modal.getInstance(bsInputModal.current);
    clearInput();
    modal.hide();
  }, []);

  const dateSelect = useCallback((selectInfo) => {
    const startDate = new Date(selectInfo.start);
    const endDate = new Date(selectInfo.end - 1);

    startDate.setHours(9, 0, 0, 0);
    endDate.setHours(18, 0, 0, 0);


    //입력 폼에 날짜 설정
    setInput({
      calendarTitle: "",
      calendarContent: "",
      calendarStart: formatDate(startDate),
      calendarEnd: formatDate(endDate),
    });

    // 일정 등록 모달 열기
    openInputModal();
  }, [setInput, openInputModal]);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  return (
    <>
      <h1>마이페이지</h1>
      <div className="container-sm border border-5 rounded p-3 mb-3">
        <div className="row align-items-center">
          <div className="col-md-3">
            <div>
              <label htmlFor="upload" className="custom-file-upload">이미지 수정</label>
              <input type="file" onChange={handleImageChange} className="form-control form-control-sm"
                id="upload" aria-label="upload" style={{ display: 'none' }} accept='image/gif, image/jpeg, image/png, image/jpg' />
              <br />
              {imagePreview && (
                <img src={imagePreview} alt="사진 미리보기" style={{ width: '260px', height: '270px', marginBottom: '10px', marginTop: '15px' }} />
              )}
            </div>
            <button onClick={setDefaultImage} className="btn btn-sm btn-secondary mt-2">기본 이미지</button>
            {file && (
              <button onClick={handleSave} className="btn btn-sm btn-primary mt-2" style={{ maxWidth: '200px', maxHeight: '200px', marginLeft: 'auto' }}>내 이미지 저장</button>
            )}
          </div>
          <div className="col-md-5">
            <button onClick={e => openEditModal(empInfo)} className="btn btn-sm btn-secondary mb-3" style={{ marginRight: '10px' }}>내 정보 수정</button>
            <button onClick={openEditPwModal} className="btn btn-sm btn-secondary mb-3">비밀번호 변경</button>
            {empInfo && (
              <table className="table">
                <tbody>
                  <React.Fragment key={empInfo.empNo}>
                    <tr>
                      <td>사원명</td>
                      <td>{empInfo.empName}</td>
                    </tr>
                    <tr>
                      <td>사원번호</td>
                      <td>{empInfo.empNo}</td>
                    </tr>
                    <tr>
                      <td>소속부서</td>
                      <td>{empInfo.empDept}</td>
                    </tr>
                    <tr>
                      <td>연락처</td>
                      <td>{empInfo.empContact}</td>
                    </tr>
                    <tr>
                      <td>이메일</td>
                      <td>{empInfo.empEmail}</td>
                    </tr>
                    <tr>
                      <td>자기소개</td>
                      <td>{empInfo.empPr}</td>
                    </tr>
                  </React.Fragment>
                </tbody>
              </table>
            )}
          </div>
          <div className="col scrollable-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {projects.map(project => (
              <div key={project.projectNo} className="mb-2">
                <Link to={`/document/project/${project.projectNo}`} style={{ textDecoration: 'none' }}>
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title" style={{ color: '#FFC0CB' }}>{project.projectName}</h5>
                      <p className="card-text" style={{ fontSize: '0.9em' }}>시작일 : {project.projectStartTime} 마감일 : {project.projectLimitTime}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-sm border border-5 rounded p-3 mt-3 mb-3">
        <div ref={calendarRef} />
      </div>


      <div ref={editModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">내 정보 수정</h5>
              <button type="button" className="btn-close" onClick={closeEditModal}></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="empName" className="form-label">사원명</label>
                  <input type="text" className="form-control" id="empName" name="empName" value={editableInfo?.empName || ''} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="empNo" className="form-label">사원번호</label>
                  <input type="text" className="form-control" id="empNo" name="empNo" value={editableInfo?.empNo || ''} onChange={handleChange} disabled />
                </div>
                <div className="mb-3">
                  <label htmlFor="empDept" className="form-label">소속부서</label>
                  <input type="text" className="form-control" id="empDept" name="empDept" value={editableInfo?.empDept || ''} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="empContact" className="form-label">연락처</label>
                  <input type="text" className="form-control" id="empContact" name="empContact" value={editableInfo?.empContact || ''} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="empEmail" className="form-label">이메일</label>
                  <input type="email" className="form-control" id="empEmail" name="empEmail" value={editableInfo?.empEmail || ''} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="empPr" className="form-label">자기소개</label>
                  <textarea className="form-control" id="empPr" name="empPr" value={editableInfo?.empPr || ''} onChange={handleChange} />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={handleSaveInfo}>수정</button>
              <button type="button" className="btn btn-secondary" onClick={closeEditModal}>취소</button>
            </div>
          </div>
        </div>
      </div>


      <div ref={editPwModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">비밀번호 변경</h5>
              <button type="button" className="btn-close" onClick={closeEditPwModal}></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">현재 비밀번호</label>
                  <input type="password" className="form-control" id="currentPassword" name="currentPassword" value={currentPassword} onChange={handleCurrentPasswordChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">새로운 비밀번호</label>
                  <input type="password" className="form-control" id="newPassword" name="newPassword" value={newPassword} onChange={handleNewPasswordChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmNewPassword" className="form-label">비밀번호 확인</label>
                  <input type="password" className="form-control" id="confirmNewPassword" name="confirmNewPassword" value={confirmNewPassword} onChange={handleConfirmNewPasswordChange} />
                </div>
                {passwordError && (
                  <div className="alert alert-danger" role="alert">
                    {passwordError}
                  </div>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={handleSavePassword}>변경</button>
              <button type="button" className="btn btn-secondary" onClick={closeEditPwModal}>취소</button>
            </div>
          </div>
        </div>
      </div>

      <div ref={bsInfoModal} className="modal fade" id="staticBackdrop infoModal" data-bs-backdrop="static" data-bs-keyboard="true" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">일정상세</h1>
              <button type="button" className="btn-close" aria-label="Close" onClick={closeInfoModal}></button>
            </div>
            <div className="modal-body">
              {selectedEvent && (
                <table className="table">
                  <tbody>
                    <tr>
                      <td>작성자</td>
                      <td>{selectedEvent.empName}({selectedEvent.empGrade})</td>
                    </tr>
                    <tr>
                      <td>제목</td>
                      <td>{selectedEvent.title}</td>
                    </tr>
                    <tr>
                      <td>내용</td>
                      <td>
                        <div dangerouslySetInnerHTML={{ __html: selectedEvent.calendarContent.replace(/\n/g, '<br />') }} />
                      </td>
                    </tr>
                    <tr>
                      <td>시작일자</td>
                      <td>{selectedEvent.start.substring(0, 16)}</td>
                    </tr>
                    <tr>
                      <td>종료일자</td>
                      <td>{selectedEvent.end.substring(0, 16)}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              {selectedEvent && selectedEvent.calendarWriter === loginId && (
                <>
                  <button className="btn btn-pink me-2" onClick={openEditModal}>수정</button>
                  <button className="btn btn-danger" onClick={() => deleteCalendar(selectedEvent)}>삭제</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div ref={bsInputModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="true" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">일정등록</h1>
              <button type="button" className="btn-close" aria-label="Close" onClick={closeInputModal}></button>
            </div>
            <div className="modal-body">
              <div className="row mt-4">
                <div className="col">
                  <label>제목</label>
                  <input type="text" name="calendarTitle" value={input.calendarTitle} onChange={changeInput} className="form-control" />
                </div>
              </div>

              <div className="row mt-4">
                <div className="col">
                  <label>내용</label>
                  <textarea name="calendarContent" value={input.calendarContent}
                    onChange={changeInput}
                    className="form-control  custom-textarea" />
                </div>
              </div>

              <div className="row mt-4">
                <div className="col">
                  <label>시작일자</label><br />
                  <Flatpickr
                    data-enable-time
                    name="calendarStart"
                    value={input.calendarStart}
                    options={{
                      static: true,
                      minuteIncrement: 30,
                    }}
                    onChange={([date]) => setInput(prevInput => ({ ...prevInput, calendarEnd: formatDate(date) }))}
                    className="form-control"
                  />
                </div>

                <div className="col">
                  <label>종료일자</label><br />
                  <Flatpickr
                    data-enable-time
                    Keyboard-focusable
                    name="calendarEnd"
                    value={input.calendarEnd}
                    options={{
                      static: true,
                      minuteIncrement: 30,
                    }}
                    onChange={([date]) => setInput(prevInput => ({ ...prevInput, calendarEnd: date.toISOString() }))}
                    className="form-control"
                  />
                </div>
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn btn-pink me-2" onClick={saveInput}><IoSaveOutline /> 등록</button>
              <button className="btn btn-danger" onClick={closeInputModal}><MdCancel /> 취소</button>
            </div>
          </div>
        </div>
      </div>

      <div ref={bsEditModal} className="modal fade" id="staticBackdrop editModal" data-bs-backdrop="static" data-bs-keyboard="true" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">일정수정</h1>
              <button type="button" className="btn-close" aria-label="Close" onClick={closeEditCModal}></button>
            </div>
            <div className="modal-body">
              <div className="row mt-4">
                <div className="col">
                  <label>제목</label>
                  <input type="text" name="calendarTitle" value={input.calendarTitle} onChange={changeInput} className="form-control" />
                </div>
              </div>

              <div className="row mt-4">
                <div className="col">
                  <label>내용</label>
                  <textarea name="calendarContent" value={input.calendarContent}
                    onChange={changeInput}
                    className="form-control  custom-textarea" />
                </div>
              </div>

              <div className="row mt-4">
                <div className="col">
                  <label>시작일자</label>
                  <Flatpickr
                    data-enable-time
                    data-enable-minute
                    name="calendarStart"
                    value={input.calendarStart}
                    options={{
                      static: true,
                      minuteIncrement: 30,
                    }}
                    onChange={([date]) => setInput(prevInput => ({ ...prevInput, calendarEnd: formatDate(date) }))}
                    className="form-control"
                  />
                </div>

                <div className="col">
                  <label>종료일자</label>
                  <Flatpickr
                    data-enable-time
                    data-enable-minute
                    name="calendarEnd"
                    options={{
                      static: true,
                      minuteIncrement: 30,
                    }}
                    value={input.calendarEnd}
                    onChange={([date]) => setInput(prevInput => ({ ...prevInput, calendarEnd: formatDate(date) }))}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-pink" onClick={editCalendar}><IoSaveOutline /> 수정</button>
              <button type="button" className="btn btn-danger" onClick={closeEditCModal}><MdCancel /> 취소</button>
            </div>
          </div>
        </div>
      </div>


    </>
  );
}

export default EmpMypage;