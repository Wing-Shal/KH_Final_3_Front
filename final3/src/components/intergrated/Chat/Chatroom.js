import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "bootstrap";
import SockJS from 'sockjs-client';
import Draggable from 'react-draggable';
import throttle from "lodash/throttle";
import axios from "../../utils/CustomAxios";
import { useRecoilState } from 'recoil';
import { loginIdState } from "../../utils/RecoilData";
import { PiGearSixDuotone } from "react-icons/pi";
import { BsSend } from "react-icons/bs";
import { GoPaperclip } from "react-icons/go";
import { HiMagnifyingGlass } from "react-icons/hi2";
import './Chatroom.css';

const ChatRoom = () => {
    const [chatrooms, setChatrooms] = useState([]);
    const [chatroomNo, setChatroomNo] = useState("");
    const [emps, setEmps] = useState([]);
    const [empInfos, setEmpInfos] = useState([]);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [chatroomName, setChatroomName] = useState("");
    const [empInChatroom, setEmpInChatroom] = useState([]); //채팅방 참여자 목록
    const [newChatroomName, setNewChatroomName] = useState(""); //채팅방 이름 변경
    const bsModal = useRef();
    const bsEmpModal = useRef();
    const bsEmpListModal = useRef();
    const bsOutChatroomModal = useRef();
    const bsChatroomNameChangeModal = useRef();
    const scrollRef = useRef();
    const textAreaRef = useRef(null);

    const [showParticipants, setShowParticipants] = useState(false);
    const [isChatModalOpen, setChatModalOpen] = useState(false);
    const [isEmpListModalOpen, setEmpListModalOpen] = useState(false);
    const [showChatroomInfo, setChatroomInfo] = useState(false);

    //채팅방 이름 검색
    const [showSearch, setShowSearch] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    //채팅방 이름 검색 토글
    const toggleSearch = () => {
        setShowSearch(prev => !prev);
        setSearchInput("");
        setSearchResults([]);
    };

    //검색 입력
    const handleSearchInput = (e) => {
        const value = e.target.value;
        setSearchInput(value);

        if (value.trim() !== "") {
            const results = chatrooms.filter(chatroom =>
                chatroom.chatroomName.toLowerCase().includes(value.toLowerCase())
            );
            setSearchResults(results);
        }
        else {
            setSearchResults([]);
        }
    };

    //검색결과 하이라이팅
    const highlightText = (text, highlight) => {
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === highlight.toLowerCase() ? (
                <span key={index} className="highlight">{part}</span>
            ) : (
                part
            )
        );
    };

    //사원 검색
    const [showEmpSearch, setShowEmpSearch] = useState(false);
    const [empSearchInput, setEmpSearchInput] = useState("");
    const [empSearchResults, setEmpSearchResults] = useState([]);

    // 사원 검색 토글
    const toggleEmpSearch = () => {
        setShowEmpSearch(prev => !prev);
        setEmpSearchInput("");
        setEmpSearchResults([]);
    };

    // 검색 입력 핸들러
    const handleEmpSearchInput = (e) => {
        const value = e.target.value;
        setEmpSearchInput(value);

        if (value.trim() !== "") {
            const results = emps.filter(emp =>
                emp.empName.toLowerCase().includes(value.toLowerCase())
            );
            setEmpSearchResults(results);
        } else {
            setEmpSearchResults([]);
        }
    };



    //참여자토글
    const toggleParticipants = () => {
        setShowParticipants(prev => {
            //console.log('현재 상태:', prev, '바뀔 상태:', !prev);
            return !prev;
        });
    };

    //채팅방 관리(채팅방 나가기, 채팅방 이름 변경 등등..)
    const manageChatroom = () => {
        setChatroomInfo(prev => {
            // console.log('현재 상태:', prev, '바뀔 상태:', !prev);
            return !prev;
        });
    };

    //recoil
    const [loginId, setLoginId] = useRecoilState(loginIdState);


    const [page, setPage] = useState(1);
    const [size] = useState(40);
    const [last, setLast] = useState(false);

    const loading = useRef(false);

    const lastAreaRef = useRef(null);
    useEffect(() => {
        if (lastAreaRef.current) {
            lastAreaRef.current.scrollIntoView();
        }
    }, [messages]);

    //메세지 읽었는지
    // const sendReadMessageInfo = useCallback((messageNo) => {
    //     const message = messages.find(msg => msg.messageNo === messageNo);
    //     if (!message) return;  // 메시지를 찾지 못한 경우 함수를 종료

    //     const readMessageRequest = {
    //         readMessageNo: messageNo,
    //         chatroomNo: chatroomNo,
    //         token: axios.defaults.headers.common['Authorization'],
    //         messageSender: message.messageSender,
    //     };

    //     if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
    //         socketRef.current.send(JSON.stringify(readMessageRequest));
    //     }
    // }, [chatroomNo, messages]);



    //채팅룸 불러오는 함수
    useEffect(() => {
        loadChatroomData();
    }, []);

    const loadChatroomData = useCallback(async () => {

        const resp = await axios.get("/chat/list");
        if (resp.data) {
            const chatroomsWithMessages = await Promise.all(
                resp.data.map(async (chatroom) => {
                    try {
                        const messageResp = await axios.get(`/chat/recentMessageList/${chatroom.chatroomNo}`);
                        const lastMessage = messageResp.data.length > 0 ? messageResp.data[0].messageContent : "";
                        const lastMessageTime = messageResp.data.length > 0 ? messageResp.data[0].messageTimeMinute : "";
                        return { ...chatroom, recentMessage: lastMessage, recentMessageTime: lastMessageTime };
                    }
                    catch (error) {
                        return { ...chatroom, recentMessage: "", recentMessageTime: "" };
                    }
                })
            );
            setChatrooms(chatroomsWithMessages);
        }

    }, []);




    const loadCompanyEmpData = useCallback(async () => {
        const resp = await axios.get("/emp/list");
        setEmps(resp.data);
    }, []);

    //사원 정보 불러오는 함수임
    const loadEmpData = useCallback(async () => {
        const resp = await axios.get("/emp/");
        setEmpInfos([resp.data]);
    }, []);

    //회사 사원 불러오는 함수임
    useEffect(() => {
        loadCompanyEmpData();
        loadEmpData();
    }, [])

    //채팅룸 안에 있는 사람들 정보임
    useEffect(() => {
        loadEmpInChatroomData();
    }, [chatroomNo])

    const loadEmpInChatroomData = useCallback(async () => {
        if (!chatroomNo) return;
        const resp = await axios.get(`/chat/chatroomEmpList/${chatroomNo}`);
        setEmpInChatroom(resp.data);
    }, [chatroomNo])

    //사원 초대하는 함수
    const openEmpListModal = useCallback(() => {
        loadCompanyEmpData();
        const modal = new Modal(bsEmpListModal.current);
        modal.show();
    }, [loadCompanyEmpData, bsEmpListModal]);

    const closeEmpListModal = useCallback(() => {
        const modal = Modal.getInstance(bsEmpListModal.current)
        modal.hide();
    }, [bsEmpListModal]);

    useEffect(() => {
        inviteEmp();
    }, [])

    

    //사원초대
    const inviteEmp = useCallback(async (empNo) => {
        if (!chatroomNo) return;
        const resp = await axios.post(`/chat/inviteEmp/${chatroomNo}/${empNo}`);
        // console.log(resp.data);
        if (resp.data) {
            const newChatroomNo = resp.data.chatroomNo;
            
            closeChatModal(); 
            closeEmpListModal(); 
            loadChatroomData();
            
            setTimeout(() => {
                setChatroomNo(newChatroomNo);
                openChatModal(newChatroomNo);
            }, 300); 
        }
    }, [chatroomNo]);


    //채팅방 이름 수정 함수
    const changeChatroomName = useCallback(async () => {
        const chatroomDto = {
            chatroomNo: chatroomNo,
            chatroomName: newChatroomName
        };

        const resp = await axios.patch(`/chat/`, chatroomDto);
        if (resp.status === 200) {
            setChatrooms(prevChatrooms =>
                prevChatrooms.map(chatroom =>
                    chatroom.chatroomNo === chatroomNo
                        ? { ...chatroom, chatroomName: newChatroomName }
                        : chatroom
                )
            );
            setChatroomName(newChatroomName);
            closeChatroomNameChangeModal();
        }

    }, [chatroomNo, newChatroomName]);

    const closeOutChatroomModal = useCallback(() => {
        const modal = Modal.getInstance(bsOutChatroomModal.current)
        modal.hide();
    }, [bsOutChatroomModal]);

    //채팅방 나가기
    const outChatroom = useCallback(async (chatroomNo) => {
        if (!chatroomNo) return;


        const resp = await axios.delete(`/chat/outChatroom/${chatroomNo}`);
        if (resp.status === 200) {
            setChatrooms(chatrooms => chatrooms.filter(c => c.chatroomNo !== chatroomNo));
            closeOutChatroomModal();
            loadChatroomData();
            loadEmpInChatroomData();
            closeChatModal();
        }

    }, [setChatrooms, closeOutChatroomModal]);

    const openOutChatroomModal = useCallback((chatroomNo) => {
        if (!chatroomNo) return;
        const modal = new Modal(bsOutChatroomModal.current);
        modal.show();
    }, [bsOutChatroomModal]);


    // useEffect(() => {
    //     if (scrollRef.current) {
    //         scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    //     }
    // }, [messages]);


    //채팅방 이름 수정 모달
    const openChatroomNameChangeModal = useCallback((chatroomNo) => {
        if (!chatroomNo) return;
        const selectedChatroom = chatrooms.find(chatroom => chatroom.chatroomNo === chatroomNo);
        if (selectedChatroom) {
            setNewChatroomName(selectedChatroom.chatroomName);
        }
        const modal = new Modal(bsChatroomNameChangeModal.current);
        modal.show();
    }, [bsChatroomNameChangeModal, chatrooms]);

    const closeChatroomNameChangeModal = useCallback(() => {
        const modal = Modal.getInstance(bsChatroomNameChangeModal.current)
        modal.hide();
    }, [bsChatroomNameChangeModal]);



    //메세지 불러오는 함수
    const loadMessageData = useCallback(async () => {
        try {
            if (!chatroomNo) return;
            const modalContent = bsModal.current.querySelector('.modal-body');
            const oldScrollHeight = modalContent.scrollHeight; // 데이터 로드 전 스크롤 높이 저장
            const resp = await axios.get(`/chat/${chatroomNo}/page/${page}/size/${size}`);
            setMessages(prevMessages => [...resp.data.list, ...prevMessages]);
            setLast(resp.data.last);

            // resp.data.list.forEach(message => {
            //     sendReadMessageInfo(message.messageNo);
            // });

            //최초에 불러온 경우는 스크롤을 아래로 이동
            //console.log(resp.data.list.length, messages.length);
            if (messages.length === 0 || resp.data.list.length === messages.length) {
                //console.log("처음 불러왔어요");
                setTimeout(() => {
                    // console.log(scrollRef.current, scrollRef.current.scrollTop, scrollRef.current.scrollHeight);
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }, 200);
            }
            //최초가 아니라 나중에 추가한 경우 스크롤을 기존위치로 이동
            else {
                setTimeout(() => {
                    //console.log("무한스크롤로 불러왔어요");
                    const newScrollHeight = modalContent.scrollHeight;
                    modalContent.scrollTop = newScrollHeight - oldScrollHeight;
                }, 10);
            }
        }
        catch (error) {
            console.error("에러임", error);
        }
    }, [chatroomNo, page, size]);

    const socketRef = useRef(null);
    useEffect(() => {
        if (chatroomNo) {
            const connectWebSocket = () => {
                if (socketRef.current) {
                    socketRef.current.close();
                }
                const newSocket = new SockJS(`${process.env.REACT_APP_BASE_URL}/ws/emp`);
                newSocket.onopen = () => {
                    socketRef.current = newSocket;
                };
                newSocket.onmessage = (e) => {
                    const newMessage = JSON.parse(e.data);
                    setMessages(prevMessages => [...prevMessages, newMessage]);
                    loadChatroomData();
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
        loadChatroomData();
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
        }
        setChatroomNo("");
        setMessages([]);
        setShowParticipants(false);
        setChatroomInfo(false);
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
        setChatroomNo(chatroomNo);


        const selectedChatroom = chatrooms.find(chatroom => chatroom.chatroomNo === chatroomNo);
        if (selectedChatroom) {
            setChatroomName(selectedChatroom.chatroomName);
            // console.log("채팅방 이름 : ", selectedChatroom.chatroomName);
            modal.show();
            setPage(1);
            loadMessageData();
        }
        else {
            // console.log("채팅방을 찾을 수 없습니다.");
        }



        const modalContent = bsModal.current.querySelector('.modal-body');
        if (modalContent) {
            modalContent.addEventListener("scroll", modalScrollListener);

            const handleEscKeyPress = (event) => {
                try {
                    if (event.key === 'Escape') {
                        closeEmpListModal();
                        closeChatModal();
                        closeChatroomNameChangeModal();
                        closeOutChatroomModal();
                    }
                }
                catch (error) {

                }
            };

            // document.addEventListener('mousedown', handleOutsideModalClick);
            document.addEventListener('keydown', handleEscKeyPress);

            return () => {
                // document.removeEventListener('mousedown', handleOutsideModalClick);
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
            setEmpInfos([]); // 찾지 못했을 때 빈 배열로 설정
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

        const resp = await axios.post(`chat/findOrCreate/${token}/${selectedEmpNo}`);
        if (resp.data) {
            closeEmpModal();
            openChatModal(resp.data.chatroomNo);
            loadChatroomData();
            //console.log("chatroomNo :", resp.data.chatroomNo);
        }
    };



    return (
        <>
            <div className="row mt-4">
                <div className="col-md-6">
                    <table className="table">
                        <thead className="text-center">
                            <tr>
                                <th>
                                    내 채팅방
                                    <span className="magnifyingGlass ms-2 clickable" onClick={toggleSearch}>
                                        <HiMagnifyingGlass />
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <div className={`chatroom-search-wrapper ${showSearch ? 'show' : ''}`}>
                            {showSearch && (
                                <input
                                    type="text"
                                    className="form-control mt-2"
                                    placeholder="채팅방 이름 검색"
                                    value={searchInput}
                                    onChange={handleSearchInput}
                                />
                            )}
                        </div>
                        <tbody>
                            {(searchResults.length > 0 ? searchResults : chatrooms).map(chatroom => (
                                <React.Fragment key={chatroom.chatroomNo}>
                                    <tr onClick={() => openChatModal(chatroom.chatroomNo)}>
                                        <td>
                                            <span className="chatroom-name">
                                                {searchInput ? highlightText(chatroom.chatroomName, searchInput) : chatroom.chatroomName} <br />
                                            </span>
                                            <span className="last-message mt-2">
                                                {chatroom.recentMessage || ""}
                                            </span>
                                            <span className="last-message-time">
                                                {chatroom.recentMessageTime || ""}
                                            </span>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="col-md-6 table-emp">
                    <table className="table">
                        <thead className="text-center">
                            <tr>
                                <th>
                                    우리회사 사원 ♥
                                    <span className="magnifyingGlass ms-2 clickable" onClick={toggleEmpSearch}>
                                        <HiMagnifyingGlass />
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <div className={`emp-search-wrapper ${showEmpSearch ? 'show' : ''}`}>
                            {showEmpSearch && (
                                <input
                                    type="text"
                                    className="form-control mt-2"
                                    placeholder="사원 이름 검색"
                                    value={empSearchInput}
                                    onChange={handleEmpSearchInput}
                                />
                            )}
                        </div>
                        <tbody className="text-center">
                            {(empSearchResults.length > 0 ? empSearchResults : emps).map(emp => (
                                <tr key={emp.empNo} onClick={() => openEmpModal(emp.empNo)}>
                                    <td>{empSearchInput ? highlightText(emp.empName, empSearchInput) : emp.empName} ({emp.empGrade})</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>


            <div ref={bsModal} className="modal fade" id="chatModal" data-bs-backdrop="static" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <Draggable cancel=".form-control, .chat-container">
                    <div className="modal-dialog modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className='col-3'>
                                    <button className="btn btn-secondary clickable" onClick={toggleParticipants}>참여자</button>
                                    <ul className={`participants-sidebar ${showParticipants ? 'expanded' : ''}`}>
                                        {empInChatroom.map(emp => (
                                            <div key={emp.empNo} className="participant-list">{emp.empName} ({emp.empGrade})</div>
                                        ))}
                                        <button className="mt-2 btn btn-secondary" onClick={() => openEmpListModal(chatroomNo)}>사원초대</button>
                                    </ul>
                                </div>
                                <p className="modal-title chatroom-name" id="staticBackdropLabel">
                                    {chatroomName}
                                </p>
                                <p className="modal-title gear clickable" onClick={manageChatroom}>
                                    <PiGearSixDuotone />
                                </p>
                                <ul className={`manageChatroom-sidebar ${showChatroomInfo ? 'expanded' : ''}`}>
                                    {chatroomName}<br />
                                    <button className="mt-2 btn btn-secondary" onClick={() => openChatroomNameChangeModal(chatroomNo)}>채팅방이름수정</button>
                                    <button className="mt-2 btn btn-danger" onClick={() => openOutChatroomModal(chatroomNo)}>채팅방나가기</button>
                                </ul>
                                <button type="button" className="btn-close" onClick={closeChatModal}></button>
                            </div>

                            <div className="modal-body" ref={scrollRef}>
                                <div className="chat-container">
                                    {messages.map(message => (
                                        <div key={message.messageNo} className={`chat-bubble ${message.messageSender === loginId ? 'mine' : 'others'}`}>
                                            {message.messageSender !== loginId && (
                                                <div className="sender-info">
                                                    {message.messageSenderName} ({message.messageSenderGrade})
                                                </div>
                                            )}
                                            <div className="message-content">
                                                <div dangerouslySetInnerHTML={{ __html: message.messageContent.replace(/\n/g, '<br />') }} />
                                            </div>
                                            <div className="message-time">{message.messageTimeMinute}</div>
                                            {/* <div>{message.readCountForChatroom > 0 ? message.readCountForChatroom : ''}</div> */}
                                        </div>
                                    ))}
                                    <div className="last-area" ref={lastAreaRef}></div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <textarea
                                    className="form-control"
                                    placeholder="할 말 입력하셈"
                                    ref={textAreaRef}
                                    value={messageInput}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                />
                                <button className="btn btn-pink">
                                    <GoPaperclip />
                                </button>
                                <button className="btn btn-pink" onClick={sendMessage}>
                                    <BsSend />
                                </button>
                            </div>
                        </div>
                    </div>
                </Draggable>
            </div>


            <div ref={bsEmpModal} className="modal fade" id="staticBackdrop" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">사원사원</h1>
                            <button type="button" className="btn-close" aria-label="Close" onClick={closeEmpModal}></button>
                        </div>
                        <div className="modal-body">
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
                                empInfo.empNo !== loginId && (
                                    <button key={empInfo.empNo} className="btn btn-pink" onClick={() => startChatWithEmp(empInfo.empNo)}>
                                        채팅하기
                                    </button>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div ref={bsEmpListModal} id="empListModal" className="modal fade" tabIndex="-1">
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">☆ㅋㅋ사원 초대ㅋㅋ☆</h5>
                            <button type="button" className="btn-close" onClick={e => closeEmpListModal()}></button>
                        </div>
                        <div className="modal-body">
                            <table className="table">
                                <tbody>
                                    {emps.filter(emp => !empInChatroom.some(e => e.empNo === emp.empNo)).map(emp => (
                                        <tr key={emp.empNo}>
                                            <td onClick={() => inviteEmp(emp.empNo)}>
                                                {emp.empName} ({emp.empGrade})
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div ref={bsChatroomNameChangeModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">♡채팅방 이름 변경 ^___^♡</h1>
                            <button type="button" className="btn-close" aria-label="Close" onClick={e => closeChatroomNameChangeModal()}></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="newChatroomName"
                                    placeholder="변경할 채팅방 이름을 입력하세요."
                                    value={newChatroomName}
                                    onChange={e => setNewChatroomName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-pink" onClick={changeChatroomName}>이름 변경</button>
                            <button type="button" className="btn btn-secondary" onClick={closeChatroomNameChangeModal}>닫기</button>
                        </div>
                    </div>
                </div>
            </div>

            <div ref={bsOutChatroomModal} className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">ㄹㅇ 나가실건가요 ..? ..</h1>
                            <button type="button" className="btn-close" aria-label="Close" onClick={e => closeOutChatroomModal()}></button>
                        </div>
                        <div className="modal-body">
                            나가기버튼 눌렀을때 나오는거
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-danger" onClick={() => outChatroom(chatroomNo)}>나가기</button>
                            <button type="button" className="btn btn-pink" onClick={closeOutChatroomModal}>안나가기</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatRoom;