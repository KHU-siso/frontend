import { Link } from "react-router-dom";
import moramLogo from "../assets/moram-logo.png";

export default function Logo() {
  return (
    <Link className="logo" to="/" aria-label="Moram 홈">
      <img src={moramLogo} alt="moram" />
    </Link>
  );
}
