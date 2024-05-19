//import

import { Route, Routes, useLocation, Navigate } from 'react-router';
import './App.css';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isCheckedState, isLoginState, isPaidState, loginIdState, loginLevelState, socketConnectState } from './components/utils/RecoilData';
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import axios from "./components/utils/CustomAxios";
import LoadingScreen from './components/LoadingScreen';
import SidebarSelector from './components/sidebar/SidebarSelector';
import AdminRoute from './components/CustomRoute/AdminRoute';
import LoginRoute from './components/CustomRoute/LoginRoute';
import CompanyRoute from './components/CustomRoute/CompanyRoute';
import { BsSend } from "react-icons/bs";
import { PiGearSixDuotone } from "react-icons/pi";
import { HiMagnifyingGlass } from "react-icons/hi2";
import BGI from './assets/bgImage.jpg';

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
const BoardBlind = lazy(() => import("./components/intergrated/BoardBlind/BoardBlind"));
const Login = lazy(() => import("./components/intergrated/Login"));
const ChatRoom = lazy(() => import("./components/intergrated/Chat/Chatroom"));
const Document = lazy(() => import("./components/intergrated/Document/Document"));
const Project = lazy(() => import("./components/intergrated/Project/Project"));
const AdminHome = lazy(() => import("./components/intergrated/Admin/AdminHome"));
const AdminCompany = lazy(() => import("./components/intergrated/Admin/AdminCompany"));
const AdminLogin = lazy(() => import("./components/intergrated/Admin/AdminLogin"));
const NEL = lazy(() => import("./components/NEL"));
const Purchase = lazy(() => import("./components/intergrated/kakaopay/Purchase"));
const PurchaseSuccess = lazy(() => import("./components/intergrated/kakaopay/PurchaseSuccess"));
const SubScriptionInactive = lazy(() => import("./components/intergrated/kakaopay/SubsciptionInacitve"));
const EmpMypage = lazy(() => import("./components/intergrated/Emp/EmpMypage"));
const CompanyEmpList = lazy(() => import('./components/intergrated/Company/EmpList'));
const CompanyAddEmp = lazy(() => import('./components/intergrated/Company/AddEmp'));
const CompanyMypage = lazy(() => import("./components/intergrated/Company/Mypage"));
const CompanyManagement = lazy(() => import("./components/intergrated/Company/Management"));
const CompanyInValid = lazy(() => import('./components/intergrated/Company/InValid'));
const CompInfo = lazy(() => import('./components/intergrated/Emp/CompInfo'));
const EmpCalendar = lazy(() => import('./components/intergrated/Calendar/EmpCalendar'));
const BoardNotice = lazy(() => import('./components/intergrated/BoardNotice/BoardNotice'));
const BoardNoticeAdd = lazy(() => import('./components/intergrated/Company/BoardNoticeAdd'));
const BoardNoticeDetail = lazy(() => import('./components/intergrated/BoardNotice/BoardNoticeDetail'));
const BoardNoticeEdit = lazy(() => import('./components/intergrated/Company/BoardNoticeEdit'));
const BoardNoticeDetailForCompany = lazy(() => import('./components/intergrated/Company/BoardNoticeDetailForCompany'));
const BoardNoticeForCompany = lazy(() => import('./components/intergrated/Company/BoardNoticeForCompany'));
const ErrorPage = lazy(() => import('./components/ErrorPage'));


const App = () => {
  //recoil state
  const location = useLocation();
  const isAdminPath = location.pathname.includes("admin");
  const isLoginPath = location.pathname.includes("login");
  const isCompanyPath = location.pathname.includes("company");
  const isNELpath = location.pathname.includes("NEL");
  const isInvalidPath = location.pathname.includes("invalid");
  const isErrorPath = location.pathname.includes("error");
  const isPurchasePath = location.pathname.includes("purchase");
  const [loginId, setLoginId] = useRecoilState(loginIdState);
  const [loginLevel, setLoginLevel] = useRecoilState(loginLevelState);
  const [isPaid, setIsPaid] = useRecoilState(isPaidState);
  const [isChecked, setIsChecked] = useRecoilState(isCheckedState);

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
      setIsChecked(resp.data.isChecked);
      axios.defaults.headers.common["Authorization"] = resp.data.accessToken;
      window.localStorage.setItem("refreshToken", resp.data.refreshToken);
    }

  }, []);



  //토스트알림클릭하면 채팅방 모달 띄우려고
  const [messageInput, setMessageInput] = useState("");
  const [chatroomName, setChatroomName] = useState("");
  const [chatroomNo, setChatroomNo] = useState("");
  const [emps, setEmps] = useState([]);
  const [empInChatroom, setEmpInChatroom] = useState([]);
  const [newChatroomName, setNewChatroomName] = useState(""); //채팅방 이름 변경
  const bsModal = useRef();
  const bsEmpListModal = useRef();
  const bsOutChatroomModal = useRef();
  const bsChatroomNameChangeModal = useRef();
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [chatrooms, setChatrooms] = useState([]);
  const textAreaRef = useRef(null);

  const [showParticipants, setShowParticipants] = useState(false);
  const [showChatroomInfo, setChatroomInfo] = useState(false);

  //사원 초대 검색
  const [inviteSearchInput, setInviteSearchInput] = useState("");
  const [inviteSearchResults, setInviteSearchResults] = useState([]);
  const [showInviteSearch, setShowInviteSearch] = useState(false);

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

  //사원 초대 검색 토글
  const toggleInviteSearch = () => {
    setShowInviteSearch(prev => !prev);
    setInviteSearchInput("");
    setInviteSearchResults([]);
  };

  //초대 검색 입력 핸들러
  const handleInviteSearchInput = (e) => {
    const value = e.target.value;
    setInviteSearchInput(value);

    if (value.trim() !== "") {
      const results = emps.filter(emp =>
        emp.empName.toLowerCase().includes(value.toLowerCase())
      );
      setInviteSearchResults(results);
    } else {
      setInviteSearchResults([]);
    }
  };

  //참여자 토글
  const toggleParticipants = () => {
    setShowParticipants(prev => {
      // console.log('현재 상태:', prev, '바뀔 상태:', !prev); //상태 변화
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

  const [page, setPage] = useState(1);
  const [size] = useState(40);
  const [last, setLast] = useState(false);

  const loading = useRef(false);


  //로그인한 사람이 속해있는 채팅룸 불러오는 함수
  useEffect(() => {
    const fetchUserChatrooms = async () => {
      const token = axios.defaults.headers.common['Authorization'];
      if (!token) return;
      const resp = await axios.get("/chat/list");
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
  }, [userChatroomNos, setSocket, loginId]);

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



  //채팅룸 안에 있는 사람들 정보임
  useEffect(() => {
    loadEmpInChatroomData();
  }, [chatroomNo])

  const loadEmpInChatroomData = useCallback(async () => {
    if (!chatroomNo) return;
    const resp = await axios.get(`chat/chatroomEmpList/${chatroomNo}`);
    setEmpInChatroom(resp.data);
  }, [chatroomNo])

  const loadCompanyEmpData = useCallback(async () => {
    const resp = await axios.get("/emp/list");
    setEmps(resp.data);
  }, []);

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
    setShowParticipants(false);
    setChatroomInfo(false);
    setMessageInput("");
    setInviteSearchInput("");
    setShowInviteSearch(false);
    if (bsEmpListModal.current) {
      const empListModal = Modal.getInstance(bsEmpListModal.current);
      if (empListModal) {
        empListModal.hide();
      }
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

  const closeOutChatroomModal = useCallback(() => {
    if (bsOutChatroomModal.current) {
      const modal = Modal.getInstance(bsOutChatroomModal.current);
      if (modal) {
        modal.hide();
      }
    }
  }, [bsOutChatroomModal]);

  const outChatroom = useCallback(async (chatroomNo) => {
    if (!chatroomNo) return;

    try {
      const resp = await axios.delete(`/chat/outChatroom/${chatroomNo}`);
      if (resp.status === 200) {
        setChatrooms(chatrooms => chatrooms.filter(c => c.chatroomNo !== chatroomNo));
        closeOutChatroomModal();
        closeChatModal();
        loadEmpInChatroomData();
        loadChatroomData();
      }
    }
    catch (error) {
      if (error.response && error.response.status === 404) {
        //채팅방이 이미 삭제된 경우
        setChatrooms(chatrooms => chatrooms.filter(c => c.chatroomNo !== chatroomNo));
        closeOutChatroomModal();
        closeChatModal();
        loadEmpInChatroomData();
      } else {
        console.error("Error leaving chatroom:", error);
      }
    }
  }, [setChatrooms, closeOutChatroomModal, closeChatModal, loadEmpInChatroomData, loadChatroomData]);

  const openOutChatroomModal = useCallback((chatroomNo) => {
    if (!chatroomNo) return;
    if (bsOutChatroomModal.current) {
      const modal = new Modal(bsOutChatroomModal.current);
      modal.show();
    }
  }, [bsOutChatroomModal]);


  //모달오픈
  const openChatModal = useCallback((chatroomNo) => {
    if (bsModal.current) {
      const modal = new Modal(bsModal.current);
      setChatroomNo(chatroomNo);

      if (chatroomNo) {
        setChatroomName(chatroomNo.chatroomName);
        modal.show();
        setPage(1);
        loadMessageData();
      }
    }
  }, [bsModal, loadMessageData]);

  useEffect(() => {
    const modalContent = bsModal.current ? bsModal.current.querySelector('.modal-body') : null;

    if (modalContent) {
      modalContent.addEventListener("scroll", modalScrollListener);

      const handleEscKeyPress = (event) => {
        try {
          if (event.key === 'Escape') {
            closeChatModal();
            closeChatroomNameChangeModal();
            closeOutChatroomModal();
          }
        } catch (error) {
          console.error('Error handling Escape key press:', error);
        }

      };

      // document.addEventListener('mousedown', handleOutsideModalClick);
      document.addEventListener('keydown', handleEscKeyPress);

      return () => {
        modalContent.removeEventListener("scroll", modalScrollListener);
        document.removeEventListener('keydown', handleEscKeyPress);
      };
    }
  }, [bsModal, closeChatModal, closeChatroomNameChangeModal, closeOutChatroomModal, loadMessageData, modalScrollListener]);

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
    // console.log(chatroomNo);
    openChatModal(chatroomNo);
  };



  return (
    <>

      <ToastContainer />
      <div className='container-fluid d-flex py-0' style={isLoginPath ? {
        backgroundImage: `url(${BGI})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh'
      } : {}}>
        <div className="sidebar">
          <SidebarSelector isLoginPath={isLoginPath} isAdminPath={isAdminPath} isErrorPath={isErrorPath}
            isCompanyPath={isCompanyPath} isNELpath={isNELpath} isInvalidPath={isInvalidPath} isPurchasePath={isPurchasePath} />
        </div>
        <div className='container'>
          <div className='row mt-4'>
            <div className='col-10 offset-sm-1'>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route element={<LoginRoute refreshLogin={refreshLogin} />}>
                    <Route path="/NEL" element={<NEL />} />
                    <Route path="/chatroom" element={<ChatRoom />} />
                    <Route path="/calendar" element={<EmpCalendar />} />
                    <Route path="/board/blind" element={<BoardBlind />} />
                    <Route path="/project" element={<Project />} />
                    <Route path="/document/project/:projectNo" element={<Document />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/emp/mypage' element={<EmpMypage />} />
                    <Route path='/emp/CompInfo' element={<CompInfo />} />
                    <Route path="/board/notice" element={<BoardNotice />} />
                    <Route path="/board/notice/:noticeNo" element={<BoardNoticeDetail />} />
                    <Route path="/kakaopay/purchase" element={<Purchase />} />
                    <Route path="/kakaopay/purchaseSuccess" element={<PurchaseSuccess />} />
                    <Route path="/kakaopay/subscriptionInactive" element={<SubScriptionInactive />} />
                    <Route path="/company" element={<CompanyRoute refreshLogin={refreshLogin} />} >
                      <Route path='empList' element={<CompanyEmpList />} />
                      <Route path='addEmp' element={<CompanyAddEmp />} />
                      <Route path="mypage" element={<CompanyMypage />} />
                      <Route path="management" element={<CompanyManagement />} />
                      <Route path='invalid' element={<CompanyInValid />} />
                      <Route path="notice/add" element={<BoardNoticeAdd />} />
                      <Route path="notice/:noticeNo" element={<BoardNoticeDetailForCompany />} />
                      <Route path="notice" element={<BoardNoticeForCompany />} />
                      <Route path="notice/edit/:noticeNo" element={<BoardNoticeEdit />} />
                    </Route>
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminRoute refreshLogin={refreshLogin} />}>
                      <Route path="company" element={<AdminCompany />} />
                      <Route path='home' element={<AdminHome />} />
                      <Route path="upload" element={<AdminUpload />} />
                    </Route>
                    <Route path="/error" element={<ErrorPage />} />
                    <Route path="*" element={<Navigate to="/error" />} />
                  </Route>
                </Routes>
              </Suspense>
            </div>
          </div>
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
                </div>
              </div>

              <div className="modal-footer">
                <textarea
                  className="form-control"
                  placeholder="메세지를 입력하세요."
                  ref={textAreaRef}
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                />
                <button className="btn btn-pink" onClick={sendMessage}>
                  <BsSend />
                </button>
              </div>
            </div>
          </div>
        </Draggable>
      </div>

      <div ref={bsEmpListModal} id="empListModal" className="modal fade" tabIndex="-1">
        <div className="modal-dialog modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">☆사원 초대☆</h5>
              <span className="magnifyingGlass ms-2 clickable" onClick={toggleInviteSearch}>
                <HiMagnifyingGlass />
              </span>
              <button type="button" className="btn-close" onClick={e => closeEmpListModal()}></button>
            </div>
            <div className={`invite-search-wrapper ${showInviteSearch ? 'show' : ''}`}>
              {showInviteSearch && (
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="사원 이름 검색"
                  value={inviteSearchInput}
                  onChange={handleInviteSearchInput}
                />
              )}
            </div>
            <div className="modal-body">
              <table className="table">
                <tbody>
                  {(inviteSearchResults.length > 0 ? inviteSearchResults : emps).filter(emp => !empInChatroom.some(e => e.empNo === emp.empNo)).map(emp => (
                    <tr key={emp.empNo}>
                      <td onClick={() => inviteEmp(emp.empNo)}>
                        {inviteSearchInput ? highlightText(emp.empName, inviteSearchInput) : emp.empName} ({emp.empGrade})
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
}

export default App;