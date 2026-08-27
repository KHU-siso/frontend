import {useState} from "react";
import {Link} from "react-router-dom";
import Logo from "../components/Logo";
export default function Chat() {
  const[o,setO]=useState(false);
  return (
  <div>
    <header className="chatTop">
      <Logo/>
      <button onClick={()=>setO(!o)}>☰</button>
      <b>AI chat</b>
      <Link to="/home">학습 돌아가기</Link>
    </header>{o&&<aside className="chatSide">
    <div>⌕　×</div>
    <b>새 채팅</b>
    <b>채팅 검색</b>
    <b>자료실</b>
    <b>••• 더보기</b>
    <b>최근</b>
  </aside>}
  <main className={'chat '+(o?'shift':'')}>
    <div className="ask">
      <div className="face">
        <i>
        </i>
        <i>
        </i>
      </div>
      <div className="askbox">
        <span>＋</span>
        <input placeholder="옹이에게 물어보세요!"/>
        <button>◍</button>
      </div>
    </div>
    <footer>소개　　고객센터　　자주 묻는 질문(FAQ)</footer>
  </main>
</div>
);
}
