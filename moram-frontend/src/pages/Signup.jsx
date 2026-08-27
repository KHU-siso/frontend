import {useState} from "react";
import {useNavigate} from "react-router-dom";
import Logo from "../components/Logo";
export default function Signup() {
  const n=useNavigate(),[step,setStep]=useState(1);
  return (
  <div className="soft signup">
    <Logo/>
    <aside>
      <h1>회원가입</h1>
      <div className="steps">
        <span className="active">✎<small>정보입력</small>
      </span>
      <span>✓<small>가입완료</small>
    </span>
  </div>
</aside>{step===1?<main>
<h2>닉네임</h2>
<div className="row">
  <input/>
  <button>중복확인</button>
</div>
<h2>비밀번호</h2>
<input type="password"/>
<h2>비밀번호 확인</h2>
<input type="password"/>
<div className="two">
  <div>
    <h2>소속 학교</h2>
    <input/>
  </div>
  <div>
    <h2>학과</h2>
    <input/>
  </div>
</div>
<button className="primary full" onClick={()=>setStep(2)}>다음</button>
</main>:<main>
<h2>시간 관리 방식</h2>
<select>
  <option>(선택)</option>
  <option>꾸준형</option>
  <option>집중형</option>
  <option>벼락치기형</option>
</select>
<h2>학습 방식</h2>
<select>
  <option>(선택)</option>
  <option>이해형</option>
  <option>암기형</option>
  <option>문제풀이형</option>
  <option>정리형</option>
</select>
<button className="primary full" onClick={()=>n('/signup/complete')}>가입 완료</button>
</main>}
</div>
);
}
