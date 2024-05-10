import { NavLink } from "react-router-dom";


function Home() {

    return (
        <>
            <h1>권한 부족</h1>
            <NavLink to="/">홈으로</NavLink>
        </>
    );
}

export default Home;