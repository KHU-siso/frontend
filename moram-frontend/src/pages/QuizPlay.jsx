import {useState} from "react";
import {useLocation,useNavigate} from "react-router-dom";
import QuizHeader from "../components/QuizHeader";
export default function QuizPlay() {
  const n=useNavigate(),q=new URLSearchParams(useLocation().search),type=q.get('type')||'multi',[ans,setAns]=useState(''),[check,setCheck]=useState(false),correct=ans==='1592';
  const choices=['2006','2007','2005','1592'];
  return (
  <div>
    <QuizHeader red={check&&!correct}/>
    <main className="quiz">
      <div className="chips">
        <span>세계와 시민</span>
        <span>{type==='short'?'주관식':'객관식'}
      </span>
    </div>
    <h1>임진왜란이 발생한 연도는?</h1>{type==='short'?<input className={'short '+(check?(correct?'ok':'bad'):'')} value={ans} onChange={e=>!check&&setAns(e.target.value)} placeholder="정답 입력"/>:<div className="answers">{choices.map((x,i)=>
    <button onClick={()=>!check&&setAns(x)} className={check?(x==='1592'?'ok':x===ans?'bad':'muted'):ans===x?'selected':''} key={x}>
    <span>{i+1}
  </span>{x}
</button>)}
</div>}{check&&<div className={'feedback '+(correct?'ok':'bad')}>
<b>{correct?'정답이에요!':'아쉬워요. 다시 학습해볼까요?'}
</b>
<p>임진왜란은 1592년부터 1598년까지 7년 동안 조선과 일본 사이에 벌어진 전쟁입니다.</p>
</div>}
<button className={(check&&correct?'success':'primary')+' full qbtn'} disabled={!ans} onClick={()=>check?n('/quiz/result'):setCheck(true)}>{check?'다음 문제로 넘어가기':'정답 확인'}
</button>
</main>
</div>
);
}
