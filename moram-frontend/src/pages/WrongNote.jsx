import {useState} from "react";
import Logo from "../components/Logo";
import {useNavigate} from "react-router-dom";
export default function WrongNote() {
  const n=useNavigate(),[open,setOpen]=useState(true);
  return (
  <div className="soft wrong">
    <Logo/>
    <button className="exit" onClick={()=>n('/home')}>나가기</button>
    <div className="wrongTop">
      <div>
        <h2>복습 현황</h2>
        <p>총 오답 12개 <span>30%</span>
      </p>
      <div className="miniBar">
        <i>
        </i>
      </div>
    </div>
    <div>
      <input placeholder="과목명을 검색하세요."/>
      <button>최근 틀린순</button>
      <button>북마크</button>
    </div>
  </div>
  <div className="wrongCard">
    <h3>Q. 03 - 세계와 시민 (D-2) ⭐</h3>
    <p>Q. 다음 중 임진왜란이 발생한 연도는 무엇인가?</p>
    <p className="badText">ⓧ 2006</p>
    <p className="okText">ⓥ 1592</p>
    <button onClick={()=>setOpen(!open)}>해설 {open?'⌃':'⌄'}
  </button>{open&&<div className="explain">임진왜란은 1592년부터 1598년까지 7년 동안 조선과 일본 사이에 벌어진 전쟁입니다.</div>}
</div>
</div>
);
}
