import {useState} from "react";
import {Link} from "react-router-dom";
import Logo from "../components/Logo";
export default function Home() {
  const[menu,setMenu]=useState(false),[modal,setModal]=useState(false);
  return (
  <div>
    <header className="top">
      <Logo/>
      <button onClick={()=>setMenu(!menu)}>☰</button>
      <div className="search">⌕</div>
      <div className="date">2026년 7월 16일 목요일</div>
      <div className="avatar">김</div>
    </header>{menu&&<aside className="drawer">
    <Link to="/quiz/setup">퀴즈</Link>
    <Link to="/wrong-note">오답노트</Link>
    <Link to="/library">자료실</Link>
    <Link to="/chat">AI Chat</Link>
    <Link to="/items">코인샵</Link>
    <span>
    </span>
    <a>설정</a>
  </aside>}
  <main className="home">
    <h3>이번 수업</h3>
    <div className="course">
      <div>
        <h1>주제연구</h1>
        <p>김경희 교수 / 월 · 수 09:00-10:30</p>
        <small>이번주 진행 60%</small>
      </div>
      <div className="stats">
        <b>75<small>공부량</small>
      </b>
      <b>75<small>출석</small>
    </b>
    <b>75<small>성적</small>
  </b>
</div>
<div className="bar">
  <i>
  </i>
</div>
</div>
<div className="homeGrid">
  <section className="character">
    <div className="snow">
      <i>
      </i>
      <i>
      </i>
    </div>
    <div className="cards">
      <div>
        <b>주제연구</b>
        <small>현재 진행률 60%</small>
      </div>
      <div>
        <b>사진</b>
        <small>현재 진행률 35%</small>
      </div>
      <div>
        <b>디지털디자인</b>
        <small>현재 진행률 70%</small>
      </div>
    </div>
  </section>
  <section>
    <Link className="study" to="/quiz/setup">오늘의 학습하러가기　›</Link>
    <Link className="aiChatHome" to="/chat">옹이에게 물어보기 · AI Chat　›</Link>
    <div className="schedule">
      <h3>2026년 2학기　시간표 <button onClick={()=>setModal(true)}>＋</button>
    </h3>
    <div className="grid">
      <i className="p">사진</i>
      <i className="g">디지털디자인</i>
      <i className="y">주제연구</i>
      <i className="b">사회와 시민</i>
    </div>
  </div>
</section>
</div>
</main>{modal&&<div className="overlay">
<div className="modal">
  <button onClick={()=>setModal(false)}>×</button>
  <h3>새 과목 추가</h3>
  <label>학수번호</label>
  <input placeholder="학수번호를 입력하세요."/>
  <label>블록 색상</label>
  <div className="colors">
    <i>
    </i>
    <i>
    </i>
    <i>
    </i>
    <i>
    </i>
    <i>
    </i>
  </div>
  <div className="actions">
    <button onClick={()=>setModal(false)}>취소</button>
    <button className="primary" onClick={()=>setModal(false)}>추가하기</button>
  </div>
</div>
</div>}
</div>
);
}
