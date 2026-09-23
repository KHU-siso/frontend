import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Pencil, ChevronRight } from "lucide-react";
import AppShell from "../components/AppShell";
import ToggleSwitch from "../components/ToggleSwitch";
import { getMe } from "../api/auth";
import { getStoredUser, clearSession } from "../api/client";

function SettingsRow({ label, danger, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-[#d2dbec]/10"
    >
      <span className={`font-medium ${danger ? "text-red-600" : "text-black"}`}>{label}</span>
      <ChevronRight className={`h-4 w-4 ${danger ? "text-red-400" : "text-gray-300"}`} />
    </button>
  );
}

function NotificationRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-5">
      <div>
        <p className="font-medium text-black">{label}</p>
        <p className="mt-1 text-sm text-moram-blue">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { hash } = useLocation();

  // 메뉴의 "설정" → /profile#settings : 이메일 알림·계정 설정 영역(Figma 696:408)으로 스크롤
  useEffect(() => {
    if (hash === "#settings") document.getElementById("settings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);
  const [editing, setEditing] = useState(false);
  // name/email 은 GET /api/auth/me (UserOut.nickname/email). 학과·학년은 명세에 없어 아직 더미.
  const storedUser = getStoredUser();
  const [profile, setProfile] = useState({
    name: storedUser?.nickname ?? "",
    email: storedUser?.email ?? "",
    major: "컴퓨터공학과",
    year: "1학년",
  });

  useEffect(() => {
    getMe()
      .then((me) => setProfile((prev) => ({ ...prev, name: me.nickname, email: me.email })))
      .catch(() => {});
  }, []);
  const [notifications, setNotifications] = useState({
    assignmentDue: true,
    studyTime: true,
    newMaterial: true,
  });

  const handleProfileChange = (field) => (e) => {
    setProfile((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <AppShell>
      <div className="relative mx-auto flex max-w-4xl flex-col gap-8 px-6 py-8 sm:px-10">
        <div>
          <h1 className="text-4xl font-bold text-moram-navy">마이페이지</h1>
          <p className="mt-2 text-moram-blue">계정 정보와 학습 설정을 관리하세요.</p>
        </div>

        {/* 카드 위로 살짝 고개 내민 마스코트 장식 */}
        <div className="pointer-events-none absolute right-10 top-6 -z-0 h-20 w-20 rounded-full bg-white shadow-sm">
          <span className="absolute left-[34%] top-[40%] h-2 w-2 -translate-y-1/2 rounded-full bg-black" />
          <span className="absolute left-[58%] top-[40%] h-2 w-2 -translate-y-1/2 rounded-full bg-black" />
        </div>

        {/* 프로필 카드 */}
        <section className="relative rounded-[2.5rem] border-2 border-black/10 bg-white p-6 shadow-[0_4px_23px_0_rgba(0,0,0,0.1)]">
          <div className="flex flex-wrap items-center gap-6">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-moram-blue to-moram-navy text-3xl font-black text-white">
              {profile.name?.[0]}
            </div>
            <div className="flex-1">
              {editing ? (
                <input
                  value={profile.name}
                  onChange={handleProfileChange("name")}
                  className="w-full max-w-xs rounded-lg border border-gray-200 px-2 py-1 text-2xl font-medium outline-none focus:border-moram-blue"
                />
              ) : (
                <p className="text-2xl font-medium text-black">{profile.name}</p>
              )}
              <p className="text-lg text-moram-blue">{profile.email}</p>
              <div className="mt-2 flex gap-2">
                <span className="rounded-full bg-[#d2dbec]/50 px-4 py-1 text-sm text-moram-navy">{profile.major}</span>
                <span className="rounded-full bg-[#d2dbec]/50 px-4 py-1 text-sm text-moram-navy">{profile.year}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="flex shrink-0 items-center gap-2 rounded-full bg-[#d2dbec]/50 px-5 py-3 text-sm font-medium text-moram-navy"
            >
              <Pencil className="h-4 w-4" />
              {editing ? "저장" : "프로필수정"}
            </button>
          </div>
        </section>

        {/* 나의 학습 정보 */}
        <section>
          <p className="mb-3 text-lg font-medium text-moram-blue">나의 학습 정보</p>
          <div className="rounded-[2.5rem] border-2 border-black/10 bg-white">
            <div className="px-6 py-5">
              <span className="font-medium text-black">현재 학습 과목</span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="px-6 py-5">
              <span className="font-medium text-black">학습 목표</span>
            </div>
          </div>
        </section>

        {/* 이메일 알림 설정 (스크롤하면 나오는 확장 버전 — Figma 696:408) */}
        <section id="settings" className="scroll-mt-6">
          <p className="mb-3 text-lg font-medium text-moram-blue">이메일 알림 설정</p>
          <div className="rounded-[2.5rem] border-2 border-black/10 bg-white">
            <NotificationRow
              label="과제 마감 알림"
              description="마감 24시간 전에 이메일로 알려드릴게요."
              checked={notifications.assignmentDue}
              onChange={(v) => setNotifications((prev) => ({ ...prev, assignmentDue: v }))}
            />
            <div className="h-px bg-gray-100" />
            <NotificationRow
              label="학습 시간 알림"
              description="설정한 학습 목표 시간에 알림을 보내드려요."
              checked={notifications.studyTime}
              onChange={(v) => setNotifications((prev) => ({ ...prev, studyTime: v }))}
            />
            <div className="h-px bg-gray-100" />
            <NotificationRow
              label="새로운 학습 자료 알림"
              description="새 강의 자료가 업로드 되면 알려드릴게요."
              checked={notifications.newMaterial}
              onChange={(v) => setNotifications((prev) => ({ ...prev, newMaterial: v }))}
            />
          </div>
        </section>

        {/* 계정 설정 (스크롤하면 나오는 섹션) */}
        <section>
          <p className="mb-3 text-lg font-medium text-moram-blue">계정 설정</p>
          <div className="rounded-[2.5rem] border-2 border-black/10 bg-white">
            <SettingsRow label="비밀번호 변경" onClick={() => navigate("/find-password")} />
            <div className="h-px bg-gray-100" />
            <SettingsRow label="로그아웃" danger onClick={handleLogout} />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
