import {useState} from "react";
import {useNavigate} from "react-router-dom";
import Logo from "../components/Logo";
export default function QuizType() {
  const n=useNavigate(),[t,setT]=useState('');
  return (
  <div className="soft qsel">
    <Logo/>
    <button className="exit" onClick={()=>n('/home')}>나가기</button>
    <h1>문제 풀기</h1>
    <div className="types">
      <button className={t==='short'?'selected':''} onClick={()=>setT('short')}>주관식</button>
      <button className={t==='multi'?'selected':''} onClick={()=>setT('multi')}>객관식</button>
    </div>
    <button className="primary next" disabled={!t} onClick={()=>n('/quiz/play?type='+t)}>학습 시작</button>
  </div>
);
}
