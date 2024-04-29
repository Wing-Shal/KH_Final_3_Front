import { useCallback, useEffect, useState } from "react";
import axios from "../utils/CustomAxios";

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
                                <tr key={message.message_no}>
                                    <td>{message.message_content}</td>
                                    <td>{message.message_sender}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Chat;
