import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Bell } from "lucide-react";
import SiteFooterNav from "./SiteFooterNav";
import MenuDrawer from "./MenuDrawer";
import moramMark from "../assets/dashboard/moram-mark.svg";

export default function AppShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#d2dbec]/10">
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <header className="flex flex-wrap items-center gap-4 border-b border-black/10 bg-white px-6 py-4 sm:px-10">
        <Link to="/dashboard" className="flex items-center">
          <img src={moramMark} alt="moram" className="h-6" />
        </Link>
        <button type="button" aria-label="메뉴" onClick={() => setMenuOpen(true)} className="flex flex-col gap-1.5 px-1">
          <span className="h-1 w-6 rounded-full bg-[#d2dbec]" />
          <span className="h-1 w-6 rounded-full bg-[#d2dbec]" />
          <span className="h-1 w-6 rounded-full bg-[#d2dbec]" />
        </button>
        <div className="flex flex-1 items-center gap-2 rounded-full bg-[#d2dbec]/40 px-4 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="검색"
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>
        <span className="hidden shrink-0 rounded-full bg-[#d2dbec]/50 px-4 py-2 text-sm text-moram-navy sm:inline">
          2026년 7월 16일 목요일
        </span>
        <Link to="/notifications" aria-label="알림" className="relative text-gray-400 hover:text-moram-navy">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
        </Link>
        <Link
          to="/profile"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-moram-blue to-moram-navy text-sm font-bold text-white"
        >
          김
        </Link>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="pb-10 pt-6">
        <SiteFooterNav
          items={[
            { label: "고객센터", href: "/support" },
            { label: "자주 묻는 질문(FAQ)", href: "/faq" },
            { label: "커뮤니티", href: "/community" },
          ]}
        />
      </footer>
    </div>
  );
}
