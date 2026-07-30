import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("moram-auth");
    localStorage.removeItem("moram-user-email");
    navigate("/login", { replace: true });
  }

  return (
    <header className="topbar">
      <input className="search-input" placeholder="검색..." />
      <div className="topbar-actions">
        <span>2026년 7월</span>
        <button className="icon-button" aria-label="알림">🔔</button>
        <div className="avatar">윤</div>
        <button className="logout-button" onClick={handleLogout}>로그아웃</button>
      </div>
    </header>
  );
}
