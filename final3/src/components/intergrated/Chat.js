import { useCallback, useEffect, useState } from "react";
import axios from "../utils/CustomAxios";
import { LuSendHorizonal } from "react-icons/lu";

const Chat = () => {
    //state
    const [messages, setMessages] = useState([]);
    const [chatroomNo, setChatroomNo] = useState(1);

    //effect
    useEffect(() => {
        loadData();
    }, [chatroomNo]); // chatroomNo가 변경될 때마다 데이터 로드

    const loadData = useCallback(async () => {

        const resp = await axios.get(`/chat/${chatroomNo}`);
        setMessages(resp.data);

    }, [chatroomNo]);

    return (
        <>
            <div className="row mt-4">
                <div className="col">
                    <h1>채팅방 1번</h1>
                    <table className="table">
                        <tbody>
                            {messages.map(message => (
                                <tr key={message.messageNo}>
                                    <td>{message.messageContent}</td>
                                    <td>{message.messageSenderName}
                                        ({message.messageSenderGrade})
                                    </td>
                                    <td>{message.messageTimeMinute}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="row">
                <div className="col-9">
                    <input type="text" className="form-control" />
                </div>
                <div className="col">
                    <button className="btn btn-success">
                        <LuSendHorizonal />
                    </button>
                </div>
            </div>
        </>
    );
};

export default Chat;
