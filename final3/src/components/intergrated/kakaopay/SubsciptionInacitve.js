import { useCallback } from "react";

const SubScriptionInactive = ()=> {

    const cancel = useCallback(async ()=> {
        const resp = await axios.get("/kakaopay/purchase/cancel");

    });

    return (
        <>
            <h1 style={{color: "red"}}>쉽고 간단하게 카카오페이 정기결제 취소 하는법</h1>
            <div className="">
                <button onClick={()=>cancel()}>버튼을눌러봐</button>&lt;----눌러서 행복해지기
            </div>
        </>
    );
}
export default SubScriptionInactive;