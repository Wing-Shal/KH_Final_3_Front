const PurchaseSuccess = () => {
    // URL에서 pg_token 읽기
    // URL에서 전체 주소를 가져옵니다.
    const fullUrl = window.location.href;

    // URL 객체를 생성하여 해시 부분을 추출합니다.
    const url = new URL(fullUrl);

    // 해시 부분에서 '?' 이후의 쿼리 스트링 부분을 파싱합니다.
    const hashParts = url.hash.split('?');
    if (hashParts.length > 1) {
        const queryParams = new URLSearchParams(hashParts[1]);

        // 'pg_token' 값을 추출합니다.
        const pgToken = queryParams.get('pg_token');
        
        window.opener.postMessage({ type: 'purchaseComplete', pgToken: pgToken }, '*');
        window.close();
    }
    // 새 창에서 실행될 스크립트
};
export default PurchaseSuccess;