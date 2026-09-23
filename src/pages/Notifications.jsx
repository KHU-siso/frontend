import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Mail } from "lucide-react";
import AppShell from "../components/AppShell";

const INITIAL_NOTIFICATIONS = [
  {
    id: "n1",
    title: "재형 님, 오늘 학습할 시간이 되었어요.",
    body: "세계와 시민을 빨리 복습하세요! 오늘의 학습과 과제 일정을 확인해보세요.",
    time: "10분 전",
    read: false,
  },
  {
    id: "n2",
    title: "과제 마감이 얼마 남지 않았어요.",
    body: "「주제 연구」 과제 마감까지 D-10 남았어요.",
    time: "1시간 전",
    read: false,
  },
  {
    id: "n3",
    title: "퀴즈 결과가 도착했어요.",
    body: "세계와 시민 퀴즈에서 코인 20개를 획득했어요!",
    time: "어제",
    read: true,
  },
];

export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = items.filter((n) => !n.read).length;

  const markRead = (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppShell>
      <div className="flex items-center gap-4 border-b border-black/10 bg-white px-6 py-5 sm:px-10">
        <h1 className="flex items-center gap-2 text-lg font-semibold text-moram-navy">
          <Bell className="h-5 w-5" />
          알림
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{unreadCount}</span>
          )}
        </h1>
        <button
          type="button"
          onClick={markAllRead}
          className="ml-auto flex items-center gap-1 text-sm font-medium text-moram-blue hover:underline"
        >
          <CheckCheck className="h-4 w-4" />
          모두 읽음 처리
        </button>
      </div>

      <div className="mx-auto flex max-w-2xl flex-col gap-3 px-6 py-8">
        {items.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => {
              markRead(n.id);
              navigate("/notifications/email");
            }}
            className={`flex flex-col gap-1 rounded-3xl border-2 px-6 py-5 text-left transition ${
              n.read ? "border-black/5 bg-white" : "border-moram-blue/30 bg-[#d2dbec]/30"
            }`}
          >
            <div className="flex items-center gap-2">
              {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />}
              <p className="font-bold text-black">{n.title}</p>
              <span className="ml-auto shrink-0 text-xs text-gray-400">{n.time}</span>
            </div>
            <p className="text-sm text-gray-500">{n.body}</p>
            <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-moram-blue">
              <Mail className="h-3.5 w-3.5" />
              이메일로 보기
            </span>
          </button>
        ))}

        {items.length === 0 && <p className="py-10 text-center text-sm text-gray-400">알림이 없습니다.</p>}
      </div>
    </AppShell>
  );
}
