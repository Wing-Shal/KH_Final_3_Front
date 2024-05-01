import React, { useEffect, useState, useRef } from "react";
import axios from "../../utils/CustomAxios";
import { LuSendHorizonal } from "react-icons/lu";
import SockJS from 'sockjs-client';
import { useParams } from "react-router";

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const {chatroomNo} = useParams();
    // const [chatroomNo, setChatroomNo] = useState(1);
    const [messageInput, setMessageInput] = useState("");

    const socketRef = useRef(null);

    useEffect(() => {
        connectWebSocket();
    }, []);

    const connectWebSocket = () => {
        const newSocket = new SockJS("http://localhost:8080/ws/emp");
        newSocket.onopen = () => {
            socketRef.current = newSocket;
        };
        newSocket.onmessage = (e) => {
            const newMessage = JSON.parse(e.data);
            setMessages(prevMessages => [...prevMessages, newMessage]);
        };
        loadData();
    };

    const loadData = async () => {
            const resp = await axios.get(`/chat/${chatroomNo}`);
            setMessages(resp.data);

    };

    const sendMessage = () => {
        if (!messageInput.trim() || !socketRef.current) return;
        const message = {
            token: axios.defaults.headers.common['Authorization'],
            messageContent: messageInput,
            chatroomNo: chatroomNo //나중에 받아오기로 찾아올 예정, 
            // messageReply: "null"
        };
        
        const json = JSON.stringify(message);
        socketRef.current.send(json);
        setMessageInput("");
    };

    return (
        <>
            <div className="row mt-4">
                <div className="col">
                    <h1>채팅방</h1>
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
            </div>
            <div className="row">
                <div className="col-9">
                    <input
                        type="text"
                        className="form-control"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                    />
                </div>
                <div className="col">
                    <button className="btn btn-success" onClick={sendMessage}>
                        <LuSendHorizonal />
                    </button>
                </div>
            </div>
        </>
    );
};

export default Chat;
