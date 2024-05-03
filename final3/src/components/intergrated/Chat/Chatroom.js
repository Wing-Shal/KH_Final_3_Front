import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "bootstrap";
import { LuSendHorizontal } from "react-icons/lu";
import SockJS from 'sockjs-client';
import Draggable from 'react-draggable';
import throttle from "lodash/throttle";
import axios from "../../utils/CustomAxios";
import './Chatroom.css';

const ChatRoom = () => {
    const [chatrooms, setChatrooms] = useState([]);
    const [chatroomNo, setChatroomNo] = useState("");
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [chatroomName, setChatroomName] = useState("");
    const bsModal = useRef();
    const scrollRef = useRef();

    const [page, setPage] = useState(1);
    const [size] = useState(40);
    const [last, setLast] = useState(false);

    const loading = useRef(false);

    //채팅룸 불러오는 함수
    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(async () => {
        const response = await axios.post("/refresh/");
        const empNo = response.data.loginId;
        const resp = await axios.get(`/chat/list/${empNo}`);
        setChatrooms(resp.data);
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

    //메세지 보내는 함수
    const sendMessage = () => {
        if (!messageInput.trim() || !socketRef.current) return;
        const message = {
            token: axios.defaults.headers.common['Authorization'],
            messageContent: messageInput.trim(),
            chatroomNo: chatroomNo
        };
        const json = JSON.stringify(message);
        socketRef.current.send(json);
        setMessageInput("");
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 0);
    };

    const closeModal = useCallback(() => {
        if (bsModal.current) {
            const modal = Modal.getInstance(bsModal.current);
            if (modal) {
                modal.hide();
            }
        }
        setChatroomNo("");
        setMessages([]);
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
    const openModal = useCallback((chatroomNo) => {
        const modal = new Modal(bsModal.current);
        modal.show();
        setChatroomNo(chatroomNo);
        setChatroomName(chatroomName);
        setPage(1);

        loadMessageData();
        
        console.log(chatroomName);

        const modalContent = bsModal.current.querySelector('.modal-body');
        if (modalContent) {
            modalContent.addEventListener("scroll", modalScrollListener);

            const handleOutsideModalClick = (event) => {
                if (!bsModal.current.contains(event.target)) {
                    closeModal();
                }
            };

            //스크롤 맨 밑으로 내리는거
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 400);

            const handleEscKeyPress = (event) => {
                if (event.key === 'Escape') {
                    closeModal();
                }
            };

            document.addEventListener('mousedown', handleOutsideModalClick);
            document.addEventListener('keydown', handleEscKeyPress);

            return () => {
                document.removeEventListener('mousedown', handleOutsideModalClick);
                document.removeEventListener('keydown', handleEscKeyPress);
            };
        }
    }, [bsModal, closeModal, loadMessageData, modalScrollListener]);

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

    

    return (
        <>
            <div className="row mt-4 chatroom-wrapper">
                <div className="col">
                    <table className="table">
                        <thead className="text-center">
                            <tr>
                                <th>방번호</th>
                                <th>방이름</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {chatrooms.map(chatroom => (
                                <tr key={chatroom.chatroomNo} onClick={() => openModal(chatroom.chatroomNo)}>
                                    <td>{chatroom.chatroomNo}</td>
                                    <td>{chatroom.chatroomName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            

            <div ref={bsModal} className="modal fade" id="staticBackdrop" tabIndex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <Draggable>
                    <div className="modal-dialog modal-dialog-scrollable modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="staticBackdropLabel">{chatroomName}</h1>
                                <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
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
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                sendMessage();
                                            }
                                        }}
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
        </>
    );
};

export default ChatRoom;