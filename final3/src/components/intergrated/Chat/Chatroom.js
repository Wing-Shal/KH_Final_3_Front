import { useCallback, useEffect, useState } from "react";
import { NavLink, useHistory } from 'react-router-dom';

import axios from "../../utils/CustomAxios";


const ChatRoom = () => {

    //state
    const [chatrooms, setChatrooms] = useState([]);


    //effect
    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(async () => {

        //토큰 없어서 오류자꾸 뜨는데 어떻게 해야할 지 모르겠음
        //다른페이지 갔다가 토큰 받아오면 되는듯..?ㅠㅠ 모르겠음..
        const response = await axios.post("/refresh/");

        const empNo = response.data.loginId;


        //empNo로 목록가져오기
        const resp = await axios.get(`/chat/list/${empNo}`);
        setChatrooms(resp.data);
    }, []);



    // const moveChatroom = async (chatroomNo) => {
    //     // 클릭한 채팅방으로 이동
    //     history.push(`/chat/${chatroomNo}`);
    // };





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
                                    {/* <td onClick={() => moveChatroom(chatroom.chatroomNo)}>{chatroom.chatroomNo}</td> */}
                                    {/* <td onClick={() => moveChatroom(chatroom.chatroomNo)}>{chatroom.chatroomName}</td> */}
                                    <td><NavLink to={`/chat/${chatroom.chatroomNo}`}>{chatroom.chatroomNo}</NavLink></td>
                                    <td><NavLink to={`/chat/${chatroom.chatroomNo}`}>{chatroom.chatroomName}</NavLink></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="row mt-4 chat-wrapper">
                <div className="col">

                </div>
            </div>
        </>

        
        
    );
};

export default ChatRoom;