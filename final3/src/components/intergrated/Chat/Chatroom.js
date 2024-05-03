import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "bootstrap";
import { LuSendHorizontal } from "react-icons/lu";
import SockJS from 'sockjs-client';
import Draggable from 'react-draggable';
import throttle from "lodash/throttle";
import axios from "../../utils/CustomAxios";
import { constSelector, useRecoilState } from 'recoil';
import { loginIdState } from "../../utils/RecoilData";
import './Chatroom.css';

const ChatRoom = () => {
    const [chatrooms, setChatrooms] = useState([]);
    const [chatroomNo, setChatroomNo] = useState("");
    const [emps, setEmps] = useState([]);
    const [empInfos, setEmpInfos] = useState([]);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [chatroomName, setChatroomName] = useState("");
    const bsModal = useRef();
    const bsEmpModal = useRef();
    const scrollRef = useRef();
    const textAreaRef = useRef(null);

    //recoil
    const [loginId, setLoginId] = useRecoilState(loginIdState);


    const [page, setPage] = useState(1);
    const [size] = useState(40);
    const [last, setLast] = useState(false);

    const loading = useRef(false);

    //채팅룸 불러오는 함수
    useEffect(() => {
        loadChatroomData();
    }, []);

    const loadChatroomData = useCallback(async () => {
        const token = axios.defaults.headers.common['Authorization']
        const resp = await axios.get(`/chat/list/${token}`);
        setChatrooms(resp.data);
    }, []);

    //회사 사원 불러오는 함수임
    useEffect(() => {
        loadCompanyEmpData();
    }, [])

    const loadCompanyEmpData = useCallback(async () => {
        const token = axios.defaults.headers.common['Authorization']
        const resp = await axios.get(`emp/list/${token}`);
        setEmps(resp.data);
    }, []);

    //사원 정보 불러오는 함수임
    useEffect(() => {
        loadEmpData();
    }, [])

    const loadEmpData = useCallback(async () => {
        const token = axios.defaults.headers.common['Authorization']
        // console.log(token);
        const resp = await axios.get(`emp/${token}`);
        setEmpInfos([resp.data]);
    }, []);


    //메세지 불러오는 함수
    const loadMessageData = useCallback(async () => {
        try {
            if (!chatroomNo) return;
            const modalContent = bsModal.current.querySelector('.modal-body');
            const oldScrollHeight = modalContent.scrollHeight; // 데이터 로드 전 스크롤 높이 저장
            const response = await axios.get(`/chat/${chatroomNo}/page/${page}/size/${size}`);
            setMessages(prevMessages => [...response.data.list, ...prevMessages]);
            setLast(response.data.last);

            setTimeout(() => {
                const newScrollHeight = modalContent.scrollHeight; // 데이터 로드 후 스크롤 높이 측정
                modalContent.scrollTop = newScrollHeight - oldScrollHeight; // 이전 스크롤 위치 복원
            }, 0);
        } catch (error) {
            console.error("에러임", error);
        }
    }, [chatroomNo, page, size]);

    const socketRef = useRef(null);
    useEffect(() => {
        if (chatroomNo) {
            const connectWebSocket = () => {
                if (socketRef.current) {
                    socketRef.current.close(); // Close any existing socket connection
                }
                const newSocket = new SockJS(`${process.env.REACT_APP_BASE_URL}/ws/emp`);
                newSocket.onopen = () => {
                    socketRef.current = newSocket;
                };
                newSocket.onmessage = (e) => {
                    const newMessage = JSON.parse(e.data);
                    setMessages(prevMessages => [...prevMessages, newMessage]);
                };
                loadMessageData();
            };

            connectWebSocket();
            return () => {
                if (socketRef.current) {
                    socketRef.current.close();
                }
            };
        }
    }, [chatroomNo, loadMessageData]);

    //textarea 높이 입력 내용에 맞게 조정
    const handleInputChange = (e) => {
        setMessageInput(e.target.value);
        e.target.style.height = '65px';  //높이를 초기화
        e.target.style.height = `${e.target.scrollHeight}px`;  //스크롤 크기만큼 높이 설정
    };

    //메세지 보내는 부분
    const sendMessage = () => {
        if (!messageInput.trim() || !socketRef.current) return;
        const message = {
            token: axios.defaults.headers.common['Authorization'],
            messageContent: messageInput.trim(),
            chatroomNo: chatroomNo
        };
        const json = JSON.stringify(message);
        socketRef.current.send(json);

        setMessageInput(""); //입력한 부분 초기화
        if (textAreaRef.current) {
            textAreaRef.current.style.height = '65px';
        }

        //스크롤 맨 밑으로 내리는거
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 0);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {  //Shift 키와 함께 Enter 키를 누르면 줄바꿈
            e.preventDefault();  //기본 Enter 이벤트(새 줄 추가) 방지
            sendMessage();
        }
    };

    const closeChatModal = useCallback(() => {
        if (bsModal.current) {
            const modal = Modal.getInstance(bsModal.current);
            if (modal) {
                modal.hide();
            }
            setChatroomNo("");
            setMessages([]);
        }
    }, []);

    const modalScrollListener = useCallback(throttle(() => {
        if (!loading.current && !last) {
            const modalContent = bsModal.current.querySelector('.modal-body');
            if (modalContent) {
                const modalScrollTop = modalContent.scrollTop;
                // const modalScrollHeight = modalContent.scrollHeight;
                // const modalClientHeight = modalContent.clientHeight;
                if (modalScrollTop === 0 && !last) { //맨 위에 도달했을 때 페이지 추가
                    setPage(prevPage => prevPage + 1);
                }
            }
        }
    }, 300), [last]);


    //모달오픈
    const openChatModal = useCallback((chatroomNo) => {
        const modal = new Modal(bsModal.current);
        modal.show();
        setChatroomNo(chatroomNo);
        setChatroomName(chatroomName);
        setPage(1);

        loadMessageData();

        // console.log(chatroomName);

        const modalContent = bsModal.current.querySelector('.modal-body');
        if (modalContent) {
            modalContent.addEventListener("scroll", modalScrollListener);

            const handleOutsideModalClick = (event) => {
                if (!bsModal.current.contains(event.target)) {
                    closeChatModal();
                }
            };

            //스크롤 맨 밑으로 내리는거
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 500);

            const handleEscKeyPress = (event) => {
                if (event.key === 'Escape') {
                    closeChatModal();
                }
            };

            document.addEventListener('mousedown', handleOutsideModalClick);
            document.addEventListener('keydown', handleEscKeyPress);

            return () => {
                document.removeEventListener('mousedown', handleOutsideModalClick);
                document.removeEventListener('keydown', handleEscKeyPress);
            };
        }
    }, [bsModal, closeChatModal, loadMessageData, modalScrollListener]);

    //모달 스크롤 이벤트제어
    useEffect(() => {
        const modalContent = bsModal.current.querySelector('.modal-body');
        if (modalContent) {
            modalContent.addEventListener("scroll", modalScrollListener);

            return () => {
                modalContent.removeEventListener("scroll", modalScrollListener);
            };
        }
    }, [modalScrollListener]);


    //사원 모달
    const openEmpModal = useCallback((empNo) => {
        const selectedEmpInfo = emps.find(emp => emp.empNo === empNo);
        if (selectedEmpInfo) {
            setEmpInfos([selectedEmpInfo]);
        }
        else {
            setEmpInfos([]);
        }
        const modal = new Modal(bsEmpModal.current);
        modal.show();
    }, [emps, bsEmpModal]);

    const closeEmpModal = useCallback(() => {
        const modal = Modal.getInstance(bsEmpModal.current)
        modal.hide();
    }, [bsEmpModal]);

    const startChatWithEmp = async (selectedEmpNo) => {
        const token = axios.defaults.headers.common['Authorization'];
        try {
            const resp = await axios.post(`chat/findOrCreate/${token}/${selectedEmpNo}`)
            if (resp.data) {
                closeEmpModal();
                openChatModal(resp.data.chatroomNo);
                loadChatroomData();
                // console.log("chatroomNo :", resp.data.chatroomNo);
            }
        }
        catch (error) {
            // console.error('채팅방 생성 또는 조회 실패:', error);
            // console.log("토큰 :", token);
            // console.log("선택된 empNo :", selectedEmpNo);
        }
    };



    return (
        <>
            <div className="row mt-4">
                <div className="col-md-6">
                    <table className="table">
                        <thead className="text-center">
                            <tr>
                                <th>방번호</th>
                                <th>방이름</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {chatrooms.map(chatroom => (
                                <tr key={chatroom.chatroomNo} onClick={() => openChatModal(chatroom.chatroomNo)}>
                                    <td>{chatroom.chatroomNo}</td>
                                    <td>{chatroom.chatroomName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="col-md-6">
                    <table className="table">
                        <thead className="text-center">
                            <tr>
                                <th>우리회사 사원</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {emps.map(emp => (
                                <tr key={emp.empNo} onClick={() => openEmpModal(emp.empNo)}>
                                    <td>{emp.empName} ({emp.empGrade})</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


            <div ref={bsModal} className="modal fade chat-modal" id="staticBackdrop" tabIndex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <Draggable>
                    <div className="modal-dialog modal-dialog-scrollable modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="staticBackdropLabel">{chatroomName}</h1>
                                <button type="button" className="btn-close" aria-label="Close" onClick={closeChatModal}></button>
                            </div>
                            <div className="modal-body" ref={scrollRef}>
                                <table className="table">
                                    <tbody>
                                        {messages.map(message => (
                                            <tr key={message.messageNo}>
                                                <td>{message.messageContent}</td>
                                                <td>{message.messageSenderName} ({message.messageSenderGrade})</td>
                                                <td>{message.messageTimeMinute}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-footer">
                                <div className="col-9">
                                    <textarea
                                        className="form-control"
                                        placeholder="할 말 입력하센"
                                        ref={textAreaRef}
                                        value={messageInput}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                                <div className="col text-end">
                                    <button className="btn btn-success" onClick={sendMessage}>
                                        전송
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Draggable>
            </div>

            <div ref={bsEmpModal} className="modal fade" id="staticBackdrop" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <Draggable>
                    <div className="modal-dialog modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="staticBackdropLabel">사원사원</h1>
                                <button type="button" className="btn-close" aria-label="Close" onClick={closeEmpModal}></button>
                            </div>
                            <div className="modal-body" ref={scrollRef}>
                                <table className="table text-center">
                                    <tbody>
                                        {empInfos.map(empInfo => (
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-footer">
                                {empInfos.map(empInfo => (
                                    <button key={empInfo.empNo} className="btn btn-primary" onClick={() => startChatWithEmp(empInfo.empNo)}>채팅하기</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Draggable>
            </div>
        </>
    );
};

export default ChatRoom;