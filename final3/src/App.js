//import

import { Route, Routes, useLocation } from 'react-router';
import './App.css';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isLoginState, isPaidState, loginIdState, loginLevelState, socketConnectState } from './components/utils/RecoilData';
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import axios from "./components/utils/CustomAxios";
import LoadingScreen from './components/LoadingScreen';
import SidebarSelector from './components/sidebar/SidebarSelector';
import AdminRoute from './components/CustomRoute/AdminRoute';
import LoginRoute from './components/CustomRoute/LoginRoute';
import CompanyRoute from './components/CustomRoute/CompanyRoute';

//토스티파이 알림용
import SockJS from 'sockjs-client';
import { toast } from 'react-toastify';
import Draggable from 'react-draggable';
import throttle from "lodash/throttle";
import { Modal } from "bootstrap";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminUpload from './components/intergrated/Admin/AdminUpload';

//lazy import
const Header = lazy(() => import("./components/Header"));
const Home = lazy(() => import("./components/Home"));
const BoardBlind = lazy(() => import("./components/intergrated/BoardBlind/BoardBlind"));
const Login = lazy(() => import("./components/intergrated/Login"));
const ChatRoom = lazy(() => import("./components/intergrated/Chat/Chatroom"));
const Document = lazy(() => import("./components/intergrated/Document/Document"));
const Project = lazy(() => import("./components/intergrated/Project/Project"));
const AdminHome = lazy(() => import("./components/intergrated/Admin/AdminHome"));
const AdminCompany = lazy(() => import("./components/intergrated/Admin/AdminCompany"));
const AdminLogin = lazy(() => import("./components/intergrated/Admin/AdminLogin"));
const NEL = lazy(() => import("./components/NEL"));
const PurchaseTest = lazy(() => import("./components/intergrated/kakaopay/PurchaseTest"));
const PurchaseSuccess = lazy(() => import("./components/intergrated/kakaopay/PurchaseSuccess"));
const PurchaseComplete = lazy(() => import("./components/intergrated/kakaopay/PurchaseComplete"));
const SubScriptionInactive = lazy(() => import("./components/intergrated/kakaopay/SubsciptionInacitve"));
const CompanyJoin = lazy(() => import("./components/intergrated/CompanyJoin2"));
const EmpMypage = lazy(() => import("./components/intergrated/Emp/EmpMypage"));
const CompanyHome = lazy(() => import('./components/intergrated/Company/Home'));
const CompanyEmpList = lazy(() => import('./components/intergrated/Company/EmpList'));
const CompanyAddEmp = lazy(() => import('./components/intergrated/Company/AddEmp'));

const App = () => {
  //recoil state
  const location = useLocation();
  const isAdminPath = location.pathname.includes("admin");
  const isLoginPath = location.pathname.includes("login");
  const isCompanyPath = location.pathname.includes("company");
  const isNELpath = location.pathname.includes("NEL");
  const [loginId, setLoginId] = useRecoilState(loginIdState);
  const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);
  const [isPaid, setIsPaid] = useRecoilState(isPaidState);

  const [socket, setSocket] = useRecoilState(socketConnectState)
  const [userChatroomNos, setUserChatroomNos] = useState([]);

  //recoil value
  const isLogin = useRecoilValue(isLoginState);

  //effect
  useEffect(() => {
    refreshLogin();
  }, []);//최초 1회

  //callback
  const refreshLogin = useCallback(async () => {
    //localStorage에 있는 refreshToken의 유무에 따라 로그인 처리를 수행
    const refreshToken = window.localStorage.getItem("refreshToken");
    //console.log(refreshToken);
    if (refreshToken !== null) {//refreshToken 항목이 존재한다면
      //리프레시 토큰으로 Authorization을 변경하고
      axios.defaults.headers.common["Authorization"] = refreshToken;
      //재로그인 요청을 보낸다
      const resp = await axios.post("/refresh/");
      //결과를 적절한 위치에 설정한다
      setLoginId(resp.data.loginId);
      setLoginLevel(resp.data.loginLevel);
      setIsPaid(resp.data.isPaid);
      axios.defaults.headers.common["Authorization"] = resp.data.accessToken;
      window.localStorage.setItem("refreshToken", resp.data.refreshToken);
    }

  }, []);



  //토스트알림클릭하면 채팅방 모달 띄우려고
  const [messageInput, setMessageInput] = useState("");
  const [chatroomName, setChatroomName] = useState("");
  const [chatroomNo, setChatroomNo] = useState("");
  const [empInChatroom, setEmpInChatroom] = useState([]);
  const bsModal = useRef();
  const textAreaRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [chatrooms, setChatrooms] = useState([]);
  const scrollRef = useRef();

  const [showParticipants, setShowParticipants] = useState(false);

  const toggleParticipants = () => {
    setShowParticipants(prev => {
      // console.log('현재 상태:', prev, '바뀔 상태:', !prev); //상태 변화
      return !prev;
    });
  };

  const [page, setPage] = useState(1);
  const [size] = useState(40);
  const [last, setLast] = useState(false);

  const loading = useRef(false);


  //로그인한 사람이 속해있는 채팅룸 불러오는 함수
  useEffect(() => {
    const fetchUserChatrooms = async () => {
      const token = axios.defaults.headers.common['Authorization'];
      if (!token) return;
      const resp = await axios.get(`/chat/list/${token}`);
      const chatroomNos = resp.data.map(chatroom => chatroom.chatroomNo);
      // console.log(chatroomNos);
      setUserChatroomNos(chatroomNos);
    };
    fetchUserChatrooms();
  }, []);



  //이거 메시지 알림 구현하려고 만드는거
  //오류 계속 떠서 try catch로했는데 이유 아시는분
  useEffect(() => {
    let newSocket;

    const setupWebSocket = () => {
      try {
        newSocket = new SockJS(`${process.env.REACT_APP_BASE_URL}/ws/emp`);
        newSocket.onopen = () => {
          console.log("웹소켓 연결됨");
          setSocket(newSocket);
        };

        newSocket.onmessage = (e) => {
          // console.log(e.data);
          const messageData = JSON.parse(e.data);
          const { messageSenderName, messageSenderGrade, messageContent, messageSender, chatroomNo } = messageData;
          // console.log(loginId);
          // console.log(messageSender);
          if (userChatroomNos.includes(chatroomNo) && messageSender !== loginId) {
            toast(
              <div className="toast-custom" onClick={() => moveChatroom(chatroomNo)}>
                <strong>{messageSenderName} ({messageSenderGrade})</strong>
                <br />
                {messageContent}
              </div>, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          }
        };
      }
      catch (error) {
        console.error("에러 떠서 분조장 온사람");
      }
    };

    setupWebSocket();

    return () => {
      try {
        if (newSocket && newSocket.close) {
          newSocket.close();
        }
      }
      catch (error) {
        console.error("저요");
      }
    };
  }, [setSocket, loginId]);



  //채팅룸 안에 있는 사람들 정보임
  useEffect(() => {
    loadEmpInChatroomData();
  }, [chatroomNo])

  const loadEmpInChatroomData = useCallback(async () => {
    if (!chatroomNo) return;
    const resp = await axios.get(`chat/chatroomEmpList/${chatroomNo}`);
    setEmpInChatroom(resp.data);
  }, [chatroomNo])

  //메세지 불러오는 함수
  const loadMessageData = useCallback(async () => {
    try {
      if (!chatroomNo) return;
      const modalContent = bsModal.current.querySelector('.modal-body');
      const oldScrollHeight = modalContent.scrollHeight; // 데이터 로드 전 스크롤 높이 저장
      const resp = await axios.get(`/chat/${chatroomNo}/page/${page}/size/${size}`);
      setMessages(prevMessages => [...resp.data.list, ...prevMessages]);
      setLast(resp.data.last);

      setTimeout(() => {
        const newScrollHeight = modalContent.scrollHeight; // 데이터 로드 후 스크롤 높이 측정
        modalContent.scrollTop = newScrollHeight - oldScrollHeight; // 이전 스크롤 위치 복원
      }, 0);
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
  const openChatModal = useCallback((chatroomNo) => {
    const modal = new Modal(bsModal.current);
    modal.show();
    setChatroomNo(chatroomNo);

    setPage(1);

    loadMessageData();



    const modalContent = bsModal.current.querySelector('.modal-body');
    if (modalContent) {
      modalContent.addEventListener("scroll", modalScrollListener);

      const handleOutsideModalClick = (event) => {
        if (bsModal.current && !bsModal.current.contains(event.target)) {
          closeChatModal();
        }
      };

      //모달 오픈 시 스크롤 맨 밑으로 내리는거
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 400);

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


  const moveChatroom = (chatroomNo) => {
    console.log(chatroomNo);
    openChatModal(chatroomNo);
  };



  return (
    <>
      {/* 메뉴 */}
      <Header />
      <ToastContainer />
      <div className='container-fluid d-flex py-0'>
        <div className="sidebar">
          <SidebarSelector isLoginPath={isLoginPath} isAdminPath={isAdminPath} 
                                            isCompanyPath={isCompanyPath} isNELpath={isNELpath} />
        </div>
        <div className='container'>
          <div className='row mt-4'>
            <div className='col-10 offset-sm-1'>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route element={<LoginRoute refreshLogin={refreshLogin} />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/NEL" element={<NEL />} />
                    <Route path="/chatroom" element={<ChatRoom />} />
                    <Route path="/boardBlind" element={<BoardBlind />} />
                    <Route path="/project" element={<Project />} />
                    <Route path="/document/project/:projectNo" element={<Document />} />
                    <Route path='/login' element={<Login />} />
                    <Route path="/company/join" element={<CompanyJoin />} />
                    <Route path='/empMypage' element={<EmpMypage />} />
                    <Route path="/kakaopay/purchaseTest" element={<PurchaseTest />} />
                    <Route path="/kakaopay/purchaseSuccess" element={<PurchaseSuccess />} />
                    <Route path="/kakaopay/subscriptionInactive" element={<SubScriptionInactive />} />
                    <Route path="/kakopay/purchaseComplete" element={<PurchaseComplete />} />
                    <Route path="/company" element={<CompanyRoute refreshLogin={refreshLogin}/>} >
                      <Route path="home" element={<CompanyHome />} />  
                      <Route path='empList' element={<CompanyEmpList />} />
                      <Route path='addEmp' element={<CompanyAddEmp />} />
                    </Route> 
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminRoute refreshLogin={refreshLogin} />}>
                      <Route path="company" element={<AdminCompany />} />
                      <Route path='home' element={<AdminHome />} />
                      <Route path="upload" element={<AdminUpload />} />
                    </Route>
                  </Route>
                </Routes>
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      <div ref={bsModal} className="modal fade" id="staticBackdrop" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <Draggable cancel=".form-control, .chat-container">
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <div className='col-3'>
                  <button className="btn btn-primary clickable" onClick={toggleParticipants}>참여자</button>
                  <ul className={`participants-sidebar ${showParticipants ? 'expanded' : ''}`}>
                    <button className="btn btn-primary clickable" onClick={toggleParticipants}>닫기</button>
                    {empInChatroom.map(emp => (
                      <div key={emp.empNo} className="participant-list">{emp.empName} ({emp.empGrade})</div>
                    ))}
                  </ul>
                </div>
                <p className="modal-title chatroom-name" id="staticBackdropLabel">
                  {chatroomName}
                </p>
                <button type="button" className="btn-close" onClick={closeChatModal}></button>
              </div>
              <div className="modal-body">
                <div className="chat-container">
                  {messages.map(message => (
                    <div key={message.messageNo} className={`chat-bubble ${message.messageSender === loginId ? 'mine' : 'others'}`}>
                      {message.messageSender !== loginId && (
                        <div className="sender-info">
                          {message.messageSenderName} ({message.messageSenderGrade})
                        </div>
                      )}
                      <div className="message-content">{message.messageContent}</div>
                      <div className="message-time">{message.messageTimeMinute}</div>
                    </div>
                  ))}
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
                <button className="btn btn-success" onClick={sendMessage}>
                  전송
                </button>
              </div>
            </div>
          </div>
        </Draggable>
      </div>
    </>
  );
}

export default App;