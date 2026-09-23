import React from "react";
import { Link } from "react-router-dom";

const DEFAULT_LINKS = [
  { label: "소개", href: "/" },
  { label: "고객센터", href: "/support" },
  { label: "자주 묻는 질문(FAQ)", href: "/faq" },
  { label: "커뮤니티", href: "/community" },
];

export default function SiteFooterNav({ className = "", items = DEFAULT_LINKS }) {
  return (
    <nav className={`flex flex-wrap items-center justify-center gap-8 text-sm font-semibold text-moram-blue ${className}`}>
      {items.map((link) => (
        <Link key={link.label} to={link.href} className="hover:underline">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
