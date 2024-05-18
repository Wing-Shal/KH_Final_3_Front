import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/CustomAxios";
import { isPaidState } from "../../utils/RecoilData";
import { useRecoilState } from "recoil";
import Logo from '../../../assets/PlanetLogo.png';
import './Purchase.css';

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
        try {
            const postData = {
                partnerOrderId,
                partnerUserId,
                tid,
                pgToken
            };
            const resp = await axios.post("/kakaopay/purchase/success", postData);
            setIsPaid("ACTIVE");
            navigator("/company/mypage");
        } catch (error) {
            console.error(error);
        }
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
            <div className="purchase-container">
                <img src={Logo} alt="Logo" className="purchase-logo" />
                <div className="purchase-text">
                    <h1>인증이 완료되신 사장님 환영합니다!</h1>
                    <p>저희 서비스는 사용자가 편리하게 이용할 수 있도록 다양한 기능을 제공하고 있습니다.</p>
                    <p>더 많은 혜택을 누리기 위해서는 정기 결제가 필요합니다.</p>
                    <p>카카오페이를 통해 간편하게 정기결제를 진행할 수 있습니다.</p>
                    <button type="button" className="btn btn-link" data-bs-toggle="modal" data-bs-target="#detailsModal">자세히 보기</button>
                </div>
                <div className="button-container">
                    <button onClick={purchase} className="purchase-button btn btn-secondary">Planet 이용 시작하기</button>
                </div>
            </div>

            <div className="modal fade" id="detailsModal" tabIndex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="detailsModalLabel">정기 결제 안내문</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>정기결제는 첫 결제일 기준으로 매월 해당일에 결제됩니다.</p>
                            <p>결제일이 해당 월에 존재하지 않는 경우 말일에 결제됩니다.</p>
                            <p>플래닛 이용 비용은 월 990,000원이며, 부가세 포함 금액입니다.</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Purchase;