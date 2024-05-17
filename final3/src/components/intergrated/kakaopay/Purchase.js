import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/CustomAxios";
import { isPaidState } from "../../utils/RecoilData";
import { useRecoilState } from "recoil";
const Purchase = ()=> {
    const navigator = useNavigate();

    const [partnerOrderId, setPartnerOrderId] = useState("");
    const [partnerUserId, setPartnerUserId] = useState("");
    const [tid, setTid] = useState("");
    const [isPaid, setIsPaid] = useRecoilState(isPaidState);

    const purchase = useCallback(async() => {
        const resp = await axios.get("/kakaopay/purchase");
        //useState에 필요한 데이터 저장
        setPartnerOrderId(resp.data.partnerOrderId);
        setPartnerUserId(resp.data.partnerUserId);
        setTid(resp.data.tid);

        //새 창을 열고 결제 프로세스 시작
        window.open(resp.data.nextRedirectPcUrl, "_blank", "width=400px, height=800px");
    });

    const purchaseApprove = useCallback(async (pgToken)=> {
        //console.log("결제 성공");
        const postData = {
            partnerOrderId,
            partnerUserId,
            tid,
            pgToken
        };
        const resp = await axios.post("/kakaopay/purchase/success", postData);
        setIsPaid("ACTIVE");

        navigator("/company/mypage");
    });

    useEffect(()=> {
        const handleMessage = (e)=> {
            if(e.data.type && e.data.type === 'purchaseComplete') {
                purchaseApprove(e.data.pgToken);
            }
        };
        window.addEventListener('message', handleMessage);
        return ()=> {
            window.removeEventListener('message', handleMessage);
        }
    }, [purchaseApprove]);
    

    return (
        <>
            <h1>쉽고 간단하게 카카오페이 정기결제 하는법</h1>
            <div className="">
                <button onClick={()=>purchase()}>버튼을눌러봐</button>&lt;----눌러서 행복해지기
            </div>
        </>
    );
};

export default Purchase;