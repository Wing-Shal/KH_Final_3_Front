import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { loginIdState } from "../../utils/RecoilData";
import { Calendar as FullCalendar } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from "../../utils/CustomAxios";
import { MdCancel } from "react-icons/md";
import { IoSaveOutline } from "react-icons/io5";
import { Modal } from "bootstrap";

import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import './EmpCalendar.css';

const EmpCalendar = () => {


  //recoil
  const [loginId, setLoginId] = useRecoilState(loginIdState);

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
    const resp = await axios.get("/calendar/listByDept");
    // console.log(resp);
    const calendarEvents = resp.data.map(event => ({
      id: event.calendarNo.toString(),
      title: `${event.empName} - ${event.calendarTitle}`,
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
      editable: true,
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
    closeEditModal();
    loadCalendarEvents();
    openInfoModal();
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
  const openEditModal = useCallback(() => {
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

  const closeEditModal = useCallback(() => {
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
      <div ref={calendarRef} />

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
                  <button className="btn btn-primary me-2" onClick={openEditModal}>수정</button>
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
                  <textarea name="calendarContent" value={input.calendarContent} onChange={changeInput} className="form-control  custom-textarea" />
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
              </div>

              <div className="row mt-4">
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
              <button className="btn btn-success me-2" onClick={saveInput}><IoSaveOutline /> 등록</button>
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
              <button type="button" className="btn-close" aria-label="Close" onClick={closeEditModal}></button>
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
                  <textarea name="calendarContent" value={input.calendarContent} onChange={changeInput} className="form-control  custom-textarea" />
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
              </div>
              <div className="row mt-4">
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
              <button type="button" className="btn btn-primary" onClick={editCalendar}><IoSaveOutline /> 수정</button>
              <button type="button" className="btn btn-danger" onClick={closeEditModal}><MdCancel /> 취소</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


export default EmpCalendar;