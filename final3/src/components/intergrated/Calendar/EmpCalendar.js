import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Calendar as FullCalendar } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from "../../utils/CustomAxios";
import { MdCancel } from "react-icons/md";
import { IoSaveOutline } from "react-icons/io5";
import { Modal } from "bootstrap";

import './EmpCalendar.css';

const EmpCalendar = () => {
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
    const resp = await axios.post("/calendar/", input, {
      headers: {
        Authorization: token
      }
    });
    console.log(input);
    await loadCalendarEvents();
    clearInput();
    closeInputModal();
  }, [input]);

  const [backup, setBackup] = useState(null)

  useEffect(() => {
    loadCalendarEvents();
  }, []);

  const loadCalendarEvents = useCallback(async () => {
    const resp = await axios.get('/calendar/');
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
      editable: true,
      events: events,
      selectable: true,
      select: dateSelect,
      eventClick: openInfo
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
    const startStr = selectInfo.startStr; // 선택된 시작 날짜
    const endStr = selectInfo.endStr; // 선택된 종료 날짜

    // 입력 폼에 날짜 설정
    setInput({
        calendarTitle: "",
        calendarContent: "",
        calendarStart: startStr,
        calendarEnd: endStr,
    });

    // 일정 등록 모달 열기
    openInputModal();
}, [setInput, openInputModal]);



  return (
    <>
      <div ref={calendarRef} />
      <div className='btn btn-success mt-2' onClick={openInputModal}>일정등록</div>


      <div ref={bsInfoModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="true" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">일정상세</h1>
              <button type="button" className="btn-close" aria-label="Close" onClick={e => closeInfoModal()}></button>
            </div>
            <div className="modal-body">
              {selectedEvent && (
                <table className="table">
                  <tbody>
                    <tr>
                      <td>번호</td>
                      <td>{selectedEvent.calendarNo}</td>
                    </tr>
                    <tr>
                      <td>작성자</td>
                      <td>{selectedEvent.empName}({selectedEvent.empGrade})</td></tr>
                    <tr>
                      <td>제목</td>
                      <td>{selectedEvent.title}</td>
                    </tr>
                    <tr>
                      <td>내용</td>
                      <td><span>{selectedEvent.calendarContent}</span></td>
                    </tr>
                    <tr>
                      <td>시작일자</td>
                      <td>{selectedEvent.start}</td>
                    </tr>
                    <tr>
                      <td>종료일자</td>
                      <td>{selectedEvent.end}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              {/* <button className="btn btn-primary me-2" onClick={e => editCalendar(selectedEvent)}> 수정 </button> */}
              <button className="btn btn-primary me-2"> 수정 </button>
              <button className="btn btn-danger" onClick={e => deleteCalendar(selectedEvent)}> 삭제 </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={bsInputModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="true" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">일정등록</h1>
              <button type="button" className="btn-close" aria-label="Close" onClick={e => closeInputModal()}></button>
            </div>
            <div className="modal-body">
              {/* 등록 화면 */}

              <div className="row mt-4">
                <div className="col">
                  <label>제목</label>
                  <input type="text" name="calendarTitle" value={input.calendarTitle} onChange={e => changeInput(e)}
                    className="form-control" />
                </div>
              </div>

              <div className="row mt-4">
                <div className="col">
                  <label>내용</label>
                  <textarea name="calendarContent" value={input.calendarContent} onChange={e => changeInput(e)}
                    className="form-control" />
                </div>
              </div>

              <div className="row mt-4">
                <div className="col">
                  <label>시작일자</label>
                  <input type="date" name="calendarStart" value={input.calendarStart} onChange={e => changeInput(e)}
                    className="form-control" />
                </div>
              </div>

              <div className="row mt-4">
                <div className="col">
                  <label>종료일자</label>
                  <input type="date" name="calendarEnd" value={input.calendarEnd} onChange={e => changeInput(e)}
                    className="form-control" />
                </div>
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn btn-success me-2" onClick={e => saveInput()}><IoSaveOutline /> 등록</button>
              <button className="btn btn-danger" onClick={e => closeInputModal()}><MdCancel /> 취소</button>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}

export default EmpCalendar;