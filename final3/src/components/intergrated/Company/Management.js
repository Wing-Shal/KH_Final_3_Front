import Jumbotron from "../../Jumbotron";
import Dept from "./Dept";
import Grade from "./Grade";

const Management = () => {
    return (
        <>
            <Jumbotron title="부서/직급 관리" />
            <div className="container w-100">
                <div className="row">
                    <div className="col-md-6">
                        <Dept />
                    </div>
                    <div className="col-md-6">
                        <Grade />
                    </div>
                </div>
            </div>
        </>
    );
}
export default Management;