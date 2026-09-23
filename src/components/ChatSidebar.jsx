import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, X, Plus, ChevronDown } from "lucide-react";

export default function ChatSidebar({ conversations, activeId, onSelect, onNewChat }) {
  const [query, setQuery] = useState("");
  const [showMore, setShowMore] = useState(false);

  const filtered = conversations.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-4 border-r border-black/5 bg-[#d2dbec]/40 px-4 py-4">
      <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="채팅 검색"
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="검색어 지우기">
            <X className="h-4 w-4 text-gray-400 hover:text-moram-navy" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onNewChat}
        className="flex items-center gap-2 rounded-xl px-2 py-2 text-left font-semibold text-moram-blue hover:bg-white/50"
      >
        <Plus className="h-4 w-4" />
        새 채팅
      </button>

      <Link to="/library" className="rounded-xl px-2 py-2 font-semibold text-moram-blue hover:bg-white/50">
        자료실
      </Link>

      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className="flex items-center gap-1 rounded-xl px-2 py-2 text-left font-semibold text-moram-blue hover:bg-white/50"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? "rotate-180" : ""}`} />
        더보기
      </button>
      {showMore && (
        <div className="ml-4 flex flex-col gap-1 text-sm text-moram-navy/70">
          <Link to="/quiz/notes" className="rounded-lg px-2 py-1 hover:bg-white/50">
            오답노트
          </Link>
          <Link to="/shop" className="rounded-lg px-2 py-1 hover:bg-white/50">
            코인샵
          </Link>
        </div>
      )}

      <div className="mt-2 flex flex-1 flex-col gap-1 overflow-y-auto">
        <p className="px-2 text-sm font-semibold text-moram-blue">최근</p>
        {filtered.length === 0 ? (
          <p className="px-2 text-xs text-gray-400">대화 내역이 없어요.</p>
        ) : (
          filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`truncate rounded-xl px-2 py-2 text-left text-sm transition ${
                c.id === activeId ? "bg-white font-semibold text-moram-navy" : "text-moram-navy/70 hover:bg-white/50"
              }`}
            >
              {c.title}
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
