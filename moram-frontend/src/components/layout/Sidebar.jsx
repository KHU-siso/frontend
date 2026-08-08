import { NavLink } from "react-router-dom";

const items = [
  { to: "/dashboard", label: "대시보드", icon: "▦" },
  { to: "/courses", label: "수업", icon: "▤" },
  { to: "/calendar", label: "시간표", icon: "□" },
  { to: "/assignments", label: "과제", icon: "✓" },
  { to: "/quizzes", label: "퀴즈", icon: "?" },
  { to: "/chat", label: "AI Q&A", icon: "✦" },
  { to: "/mypage", label: "마이페이지", icon: "●" }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">M</div>
        <strong>모람</strong>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="avatar">윤</div>
        <div>
          <strong>윤호</strong>
          <small>인공지능학과</small>
        </div>
      </div>
    </aside>
  );
}
