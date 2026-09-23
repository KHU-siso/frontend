import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, HelpCircle, NotebookPen, FolderOpen, Coins, User, Settings, LogOut, MessageCircle } from "lucide-react";
import { clearSession } from "../api/client";

const TOP_LINKS = [
  { label: "퀴즈", to: "/quiz", icon: HelpCircle },
  { label: "AI chat", to: "/chat", icon: MessageCircle },
  { label: "오답노트", to: "/quiz/notes", icon: NotebookPen },
  { label: "자료실", to: "/library", icon: FolderOpen },
  { label: "코인샵", to: "/shop", icon: Coins },
];

const BOTTOM_LINKS = [
  { label: "마이페이지", to: "/profile", icon: User },
  { label: "설정", to: "/profile#settings", icon: Settings },
];

export default function MenuDrawer({ open, onClose }) {
  const navigate = useNavigate();

  if (!open) return null;

  const linkClass =
    "flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-moram-navy/80 transition hover:bg-[#d2dbec]/60 hover:text-moram-navy";

  return (
    <div className="fixed inset-0 z-50 flex">
      <aside className="flex w-72 shrink-0 flex-col gap-1 bg-gradient-to-b from-[#d2dbec] to-white p-4 shadow-2xl">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-lg font-black text-moram-navy">메뉴</span>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-moram-navy/60 hover:text-moram-navy">
            <X className="h-5 w-5" />
          </button>
        </div>

        {TOP_LINKS.map(({ label, to, icon: Icon }) => (
          <Link key={label} to={to} onClick={onClose} className={linkClass}>
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}

        <div className="my-2 h-px bg-black/10" />

        {BOTTOM_LINKS.map(({ label, to, icon: Icon }) => (
          <Link key={label} to={to} onClick={onClose} className={linkClass}>
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}

        <button
          type="button"
          onClick={() => {
            onClose();
            clearSession();
            navigate("/login");
          }}
          className={linkClass}
        >
          <LogOut className="h-5 w-5" />
          로그아웃하기
        </button>
      </aside>

      <button type="button" aria-label="메뉴 닫기" onClick={onClose} className="flex-1 bg-black/20 backdrop-blur-sm" />
    </div>
  );
}
