import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Mail } from "lucide-react";
import AppShell from "../components/AppShell";
import { listNotifications, completeNotification } from "../api/schedule";
import { getErrorMessage } from "../api/client";

function formatRelative(iso) {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}시간 전`;
  if (diffMin < 60 * 48) return "어제";
  return new Date(iso).toLocaleDateString("ko-KR");
}

// NotificationOut → 목록 행. is_completed 를 "읽음"으로 사용.
const toItem = (n) => ({
  id: n.id,
  title: n.message,
  body: "",
  time: formatRelative(n.notify_at),
  read: n.is_completed,
});

export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listNotifications()
      .then((list) => setItems(list.map(toItem)))
      .catch((err) => setError(getErrorMessage(err, "알림을 불러오지 못했어요.")))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  const markRead = (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    completeNotification(id).catch(() => {});
  };

  const markAllRead = () => {
    items.filter((n) => !n.read).forEach((n) => markRead(n.id));
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
            {n.body && <p className="text-sm text-gray-500">{n.body}</p>}
            <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-moram-blue">
              <Mail className="h-3.5 w-3.5" />
              이메일로 보기
            </span>
          </button>
        ))}

        {loading && <p className="py-10 text-center text-sm text-gray-400">불러오는 중...</p>}
        {error && <p className="py-10 text-center text-sm text-red-500">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="py-10 text-center text-sm text-gray-400">알림이 없습니다.</p>}
      </div>
    </AppShell>
  );
}
