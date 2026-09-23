import {useNavigate} from "react-router-dom";
import Logo from "../components/Logo";
export default function Complete() {
  const n=useNavigate();
  return (
  <div className="soft complete" onClick={()=>n('/login')}>
  <Logo/>
  <div className="check">✓</div>
  <h1>가입완료</h1>
  <p>클릭하면 로그인 화면으로 이동합니다.</p>
</div>
);
}
