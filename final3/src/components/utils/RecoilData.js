//Recoil을 이용해서 전체 애플리케이션에서 사용할 데이터를 선언
// - 기존의 Spring Boot에서 사용하는 HttpSession을 대체할 예정

import {atom, selector} from "recoil";

//atom은 recoil 저장소에 변수를 생성하는 역할
const countState = atom({
    key : 'countState',//식별자(ID)
    default : 0//초기값
});

//로그인과 관련된 저장소 설정
const loginIdState = atom({
    key : 'loginIdState',
    default : ''
});
const loginLevelState = atom({
    key : 'loginLevelState',
    default : ''
});//아톰에서 회사꺼를 새로 만들고 아래에서 또는으로 가능!?

//Company로그인 관련 저장소 설정
const loginIdcState = atom({
    key : 'loginIdcState',
    default : ''
})

//atom으로 생성한 데이터를 조합하여 무언가를 계산할 수 있다(selector)
// -> 외부에서는 useRecoilValue로 부른다
const isLoginState = selector({
    key : 'isLoginState',//식별자
    get : (state)=>{//state를 불러와서 새로운 값을 계산해서 반환하는 함수
        //미리 만든 state 중에 loginIdState에 해당하는 값을 주세요!
        const loginId = state.get(loginIdState);
        //미리 만든 state 중에 loginLevelState에 해당하는 값을 주세요!
        const loginLevel = state.get(loginLevelState);
        
        const loginIdc = state.get(loginIdcState);

        return (loginId && loginId > 0 
                    && loginLevel && loginLevel.length > 0) || loginIdc && loginIdc > 0;

        
    }
});

//default export는 하e나밖에 할 수 없다
//export default countState;

//naming export는 여러 개 할 수 있다.
export {countState, loginIdState, loginLevelState, isLoginState, loginIdcState};