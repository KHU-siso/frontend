import React, { useState, useRef, useEffect } from "react";
import { Plus, AudioLines } from "lucide-react";
import AppHeader from "../components/AppHeader";
import ChatSidebar from "../components/ChatSidebar";
import MenuDrawer from "../components/MenuDrawer";
import SiteFooterNav from "../components/SiteFooterNav";
import moramMark from "../assets/chat/moram-mark.svg";

const QUICK_ACTIONS = [
  { label: "간단퀴즈", message: "간단한 퀴즈 하나 내줘" },
  { label: "퀴즈 오답기록", message: "내 퀴즈 오답기록 보여줘" },
];

function MascotAvatar({ className = "" }) {
  return (
    <div className={`relative mx-auto h-16 w-16 rounded-full bg-white shadow-sm ${className}`}>
      <span className="absolute left-[32%] top-[40%] h-2 w-2 rounded-full bg-black" />
      <span className="absolute left-[58%] top-[40%] h-2 w-2 rounded-full bg-black" />
    </div>
  );
}

let nextId = 1;

export default function Chat() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const scrollRef = useRef(null);

  const active = conversations.find((c) => c.id === activeId);
  const messages = active?.messages ?? [];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isReplying]);

  const handleNewChat = () => {
    setActiveId(null);
    setInput("");
  };

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    let convId = activeId;
    if (!convId) {
      convId = nextId++;
      const title = trimmed.length > 20 ? `${trimmed.slice(0, 20)}...` : trimmed;
      setConversations((prev) => [{ id: convId, title, messages: [] }, ...prev]);
      setActiveId(convId);
    }

    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, { role: "user", text: trimmed }] } : c))
    );
    setInput("");
    setIsReplying(true);

    // TODO: 실제 AI 챗봇 API 연동
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, { role: "assistant", text: "옹이가 아직 준비 중이에요. 곧 실제 답변으로 연결할게요!" }] }
            : c
        )
      );
      setIsReplying(false);
    }, 700);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleVoiceInput = () => {
    // TODO: 음성 입력(Web Speech API 등) 연동
    console.log("음성 입력 시작");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <AppHeader logoSrc={moramMark} title="AI chat" backLabel="학습 돌아가기" backTo="/dashboard" onMenuClick={() => setMenuOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNewChat={handleNewChat}
        />

        <main className="relative flex flex-1 flex-col overflow-hidden px-6 py-10">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full bg-[#d2dbec]/40 blur-md" />
            <div className="absolute -top-32 left-1/3 h-[300px] w-[300px] rounded-full bg-[#d2dbec]/30 blur-md" />
          </div>

          {messages.length === 0 ? (
            // 177:314 — 빈 상태: 옹이가 입력창 위로 살짝 걸쳐 보이는 구성 + 하단 사이트 푸터
            <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center gap-6">
              <div className="relative flex w-full max-w-xl flex-col items-center">
                <MascotAvatar className="relative z-0 -mb-7" />
                <form
                  onSubmit={handleSubmit}
                  className="relative z-10 flex w-full items-center gap-2 rounded-full bg-[#e4e9f4] px-3 py-2 shadow-sm"
                >
                  <button
                    type="button"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-gray-500 transition hover:text-moram-blue"
                    aria-label="첨부"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="옹이에게 물어보세요!"
                    className="flex-1 bg-transparent px-1 text-moram-blue placeholder:text-moram-blue/60 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-moram-blue/60 transition hover:text-moram-blue"
                    aria-label="음성 입력"
                  >
                    <AudioLines className="h-5 w-5" />
                  </button>
                </form>
              </div>

              <div className="flex gap-3">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => sendMessage(action.message)}
                    className="rounded-full bg-[#e4e9f4] px-4 py-2 text-sm font-semibold italic text-moram-blue transition hover:bg-[#d2dbec]"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden">
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[80%] rounded-3xl px-5 py-3 text-sm ${
                      m.role === "user"
                        ? "self-end bg-gradient-to-r from-moram-navy to-moram-blue text-white"
                        : "self-start bg-[#e4e9f4] text-gray-700"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
                {isReplying && (
                  <div className="self-start rounded-3xl bg-[#e4e9f4] px-5 py-3 text-sm text-gray-400">
                    입력 중...
                  </div>
                )}
                <div ref={scrollRef} />
              </div>

              <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 rounded-full bg-[#e4e9f4] px-3 py-2">
                <button
                  type="button"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-gray-500 transition hover:text-moram-blue"
                  aria-label="첨부"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="옹이에게 물어보세요!"
                  className="flex-1 bg-transparent px-1 text-moram-blue placeholder:text-moram-blue/60 outline-none"
                />
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-moram-blue/60 transition hover:text-moram-blue"
                  aria-label="음성 입력"
                >
                  <AudioLines className="h-5 w-5" />
                </button>
              </form>

              <div className="mt-3 flex gap-3">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => sendMessage(action.message)}
                    className="rounded-full bg-[#e4e9f4] px-4 py-2 text-sm font-semibold italic text-moram-blue transition hover:bg-[#d2dbec]"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.length === 0 && (
            <div className="relative z-10 pt-8">
              <SiteFooterNav />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
