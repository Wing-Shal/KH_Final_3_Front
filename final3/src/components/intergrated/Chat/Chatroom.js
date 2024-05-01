import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "bootstrap";
import { LuSendHorizonal } from "react-icons/lu";
import SockJS from 'sockjs-client';
import Draggable from 'react-draggable';
import axios from "../../utils/CustomAxios";

const ChatRoom = () => {
    const [chatrooms, setChatrooms] = useState([]);
    const [chatroomNo, setChatroomNo] = useState([]);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const bsModal = useRef();
    const scrollRef = useRef();
    // const [page, setPage] = useState(); //불러올 현재 페이지 번호
    // const [size, setSize] = useState(30); //가져올 데이터 개수

    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(async () => {
        const response = await axios.post("/refresh/");
        const empNo = response.data.loginId;
        const resp = await axios.get(`/chat/list/${empNo}`);
        setChatrooms(resp.data);
    }, []);

    const socketRef = useRef(null);
    useEffect(() => {
        connectWebSocket();
    }, []);

    const connectWebSocket = () => {
        const newSocket = new SockJS(`${process.env.REACT_APP_BASE_URL}/ws/emp`);

        newSocket.onopen = () => {
            socketRef.current = newSocket;
        };
        newSocket.onmessage = (e) => {
            const newMessage = JSON.parse(e.data);
            setMessages(prevMessages => [...prevMessages, newMessage]);
        };
        loadData();
    };

    const sendMessage = () => {
        if (!messageInput.trim() || !socketRef.current) return;
        const message = {
            token: axios.defaults.headers.common['Authorization'],
            messageContent: messageInput,
            chatroomNo: chatroomNo
        };
        const json = JSON.stringify(message);
        socketRef.current.send(json);
        setMessageInput("");
    };

    const openModal = useCallback(async (chatroomNo) => {
        const modal = new Modal(bsModal.current);
        modal.show();
        setChatroomNo(chatroomNo);
        const response = await axios.get(`/chat/${chatroomNo}`);
        setMessages(response.data);

        // 모달이 열린 후에 스크롤을 맨 아래로 이동
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 100);
    }, [bsModal]);

    useEffect(() => {
        // messages가 업데이트될 때마다 스크롤을 맨 아래로 내림
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const closeModal = useCallback(() => {
        const modal = Modal.getInstance(bsModal.current);
        modal.hide();
    }, [bsModal]);

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
                                <tr key={chatroom.chatroomNo}>
                                    <td onClick={() => openModal(chatroom.chatroomNo)}>{chatroom.chatroomNo}</td>
                                    <td onClick={() => openModal(chatroom.chatroomNo)}>{chatroom.chatroomName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div ref={bsModal} className="modal fade" id="staticBackdrop" data-bs-keyboard="true" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <Draggable velocity={20}>
                    <div className="modal-dialog modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="staticBackdropLabel">채팅방</h1>
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
                                        <LuSendHorizonal />
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
