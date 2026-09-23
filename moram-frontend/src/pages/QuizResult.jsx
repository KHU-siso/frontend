import {useNavigate} from "react-router-dom";
import Logo from "../components/Logo";
export default function QuizResult() {
  const n=useNavigate();
  return (
  <div className="soft result">
    <Logo/>
    <div className="ring">50%</div>
    <h1>좋은 시작이에요!</h1>
    <p>총 10문제 중 <b>5문제</b> 정답</p>
    <div className="score">
      <div>
        <b>5</b>
        <small>정답</small>
      </div>
      <div>
        <b>5</b>
        <small>오답</small>
      </div>
      <div>
        <b>50%</b>
        <small>정확도</small>
      </div>
    </div>
    <button className="primary rbtn" onClick={()=>n('/quiz/setup')}>다시 풀기</button>
    <button className="rbtn" onClick={()=>n('/home')}>나가기</button>
  </div>
);
}
