import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

export default function AppHeader({ logoSrc, title, backLabel, backTo = "/", onMenuClick }) {
  return (
    <header className="relative z-10 flex items-center gap-6 border-b border-gray-100 px-6 py-5 sm:px-10">
      <Link to="/" className="flex items-center">
        <img src={logoSrc} alt="moram" className="h-6" />
      </Link>
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="메뉴 열기"
        className="text-gray-400 transition hover:text-moram-navy"
      >
        <Menu className="h-5 w-5" />
      </button>
      {title && <h1 className="font-semibold text-moram-navy">{title}</h1>}
      {backLabel && (
        <Link to={backTo} className="ml-auto text-sm font-semibold text-moram-navy">
          {backLabel}
        </Link>
      )}
    </header>
  );
}
