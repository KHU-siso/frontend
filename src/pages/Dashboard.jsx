import React from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import MascotCard from "../components/MascotCard";
import TaskListCard from "../components/TaskListCard";
import WeeklyTimetable from "../components/WeeklyTimetable";

const QUICK_ACTIONS = [
  { label: "퀴즈하기", href: "/quiz", bg: "bg-[#d2dbec]/60" },
  { label: "복습하기", href: "/quiz/notes", bg: "bg-[#bb99e2]/40" },
  { label: "강의자료실", href: "/library", bg: "bg-[#ffceA0]/60" },
  { label: "AI chat", href: "/chat", bg: "bg-[#b3e4a7]/60" },
];

const TASKS = [
  { id: "1", title: "주제 연구", professor: "김경희 교수님", dueLabel: "중간고사 D-10", progress: 40, status: "overdue" },
  { id: "2", title: "세계와 시민", professor: "조서연 교수님", dueLabel: "중간고사 D-11", progress: 20, status: "today" },
  { id: "3", title: "성찰과 표현", professor: "김재형 교수님", dueLabel: "중간고사 D-9", progress: 60, status: "today" },
  { id: "4", title: "인간 가치의 탐색", professor: "조서연 교수님", dueLabel: "중간고사 D-8", progress: 80, status: "today" },
];

export default function Dashboard() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 px-6 py-8 sm:px-10">
        <section className="rounded-[2.5rem] bg-gradient-to-r from-moram-blue to-moram-navy px-8 py-8 text-white">
          <p className="text-xl font-bold sm:text-2xl">
            김재형 님! F는 Family의 F가 아닙니다... 마감 시각이 코앞으로 다가왔어요!
          </p>
          <p className="mt-3 text-white/80">오늘의 목표 : 2시간 학습하기 · 과제 1개 완료</p>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr_1.3fr]">
          <MascotCard />

          <div className="flex flex-col gap-6">
            <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_4px_4px_0_#d2dbec]">
              <p className="mb-4 font-bold text-black/70">빠른 실행</p>
              <div className="grid grid-cols-2 gap-3">
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.label}
                    to={action.href}
                    className={`rounded-2xl ${action.bg} px-3 py-6 text-center text-sm font-medium text-moram-navy transition hover:brightness-95`}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            <TaskListCard tasks={TASKS} />
          </div>

          <WeeklyTimetable />
        </section>
      </div>
    </AppShell>
  );
}
