//화면 상단에 배치할 메뉴(예전 navigator.jsp)

//import
import './Header.css'
import { NavLink } from "react-router-dom";

//function
function Header() {

    return (
        <>
            <div className="row header">
                <div className="col-1">

                </div>
                <div className="col-9 text-center">
                    회사 로고 자리
                </div>
                <div className="col-2 text-center">
                    <div className="row">
                        <div className="col-6">
                            채팅
                        </div>
                        <div className="col-6">
                            마이
                        </div>
                    </div>
                </div>
            </div>
        </>
    );


    
}

//export
export default Header;