import Logo from "./Logo";
import {useNavigate} from "react-router-dom";
export default function QuizHeader({red=false}) {
  const n=useNavigate();
  return (
  <header className="quizHead">
    <Logo/>
    <b>1/10</b>
    <div className="progress">
      <i className={red?'red':''}>
      </i>
    </div>
    <button className={red?'danger':''} onClick={()=>n('/home')}>나가기</button>
  </header>
);
}
