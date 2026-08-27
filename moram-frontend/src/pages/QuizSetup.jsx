import {useState} from "react";
import {useNavigate} from "react-router-dom";
import Logo from "../components/Logo";
export default function QuizSetup() {
  const n=useNavigate(),[a,setA]=useState(''),[b,setB]=useState(''),[c,setC]=useState('');
  return (
  <div className="soft qsel">
    <Logo/>
    <button className="exit" onClick={()=>n('/home')}>나가기</button>
    <h1>오늘의 학습을 시작해볼까요?</h1>
    <div className="setup">
      <div>
        <h2>오늘의 학습 목표</h2>
        <select onChange={e=>setA(e.target.value)}>
        <option value="">(선택)</option>
        <option>30분</option>
        <option>1시간</option>
      </select>
    </div>
    <div>
      <h2>연속 학습</h2>
      <select onChange={e=>setB(e.target.value)}>
      <option value="">(직접 작성)</option>
      <option>3일</option>
    </select>
  </div>
  <div>
    <h2>오늘 풀 문제</h2>
    <select onChange={e=>setC(e.target.value)}>
    <option value="">(선택)</option>
    <option>10문제</option>
    <option>20문제</option>
  </select>
</div>
</div>
<button className="primary next" disabled={!a||!b||!c} onClick={()=>n('/quiz/subject')}>넘어가기</button>
</div>
);
}
