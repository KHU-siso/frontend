import {useState} from "react";
import {useNavigate} from "react-router-dom";
import Logo from "../components/Logo";
export default function QuizSubject() {
  const n=useNavigate(),[s,setS]=useState('');
  const xs=['세계와 시민','인간의 가치 탐색','성찰과 표현','대학 영어','미적분'];
  return (
  <div className="soft qsel">
    <Logo/>
    <button className="exit" onClick={()=>n('/home')}>나가기</button>
    <h1>무엇을 공부할까요?</h1>
    <div className="list">{xs.map(x=>
    <button className={s===x?'selected':''} onClick={()=>setS(x)} key={x}>{x}
  </button>)}
</div>
<button className="primary next" disabled={!s} onClick={()=>n('/quiz/mode')}>넘어가기</button>
</div>
);
}
