import {useState} from "react";
import {useNavigate} from "react-router-dom";
import Logo from "../components/Logo";
export default function QuizMode() {
  const n=useNavigate(),[m,setM]=useState('');
  const xs=[['문제 풀기','배운 내용을 문제로 확인해요.'],['오답 복습','틀렸던 문제를 다시 풀어봐요.'],['개념 학습','중요한 개념을 다시 확인해요.'],['빠른 학습','짧은 시간 동안 핵심 문제만 풀어요.']];
  return (
  <div className="soft qsel">
    <Logo/>
    <button className="exit" onClick={()=>n('/home')}>나가기</button>
    <h1>어떻게 학습할까요?</h1>
    <div className="modes">{xs.map(([x,d])=>
    <button className={m===x?'selected':''} onClick={()=>setM(x)} key={x}>
    <b>{x}
  </b>
  <small>{d}
</small>
</button>)}
</div>
<button className="primary next" disabled={!m} onClick={()=>n(m==='문제 풀기'?'/quiz/type':'/quiz/play?type=multi')}>학습 시작</button>
</div>
);
}
