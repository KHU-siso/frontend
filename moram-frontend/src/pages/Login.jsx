import {useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import Logo from "../components/Logo";
export default function Login() {
  const n=useNavigate(),[id,setId]=useState('studentkijul'),[pw,setPw]=useState('');
  return (
  <div className="soft">
    <Logo/>
    <div className="corner">계정이 없으신가요? <Link to="/signup">회원가입</Link>
  </div>
  <main className="login">
    <div className="miniOngi">
    </div>
    <h1>환영합니다</h1>
    <p>모람과 함께 더 스마트한 학습을 시작하세요.</p>
    <button className="google">G　Google로 계속하기</button>
    <label>아이디</label>
    <input value={id} onChange={e=>setId(e.target.value)}/>
    <label>비밀번호</label>
    <input type="password" placeholder="비밀번호를 입력하세요." value={pw} onChange={e=>setPw(e.target.value)}/>
    <button className="primary full" onClick={()=>pw?n('/home'):alert('비밀번호를 입력해주세요.')}>로그인 하기</button>
    <Link to="/signup" className="smallLink">회원가입</Link>
  </main>
</div>
);
}
