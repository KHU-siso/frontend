import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import MascotCard from "../components/MascotCard";
import TaskListCard from "../components/TaskListCard";
import WeeklyTimetable from "../components/WeeklyTimetable";
import { getPriority } from "../api/schedule";
import { listSubjects, toggleCancelWeek } from "../api/subjects";
import { getStoredUser, getErrorMessage } from "../api/client";

const QUICK_ACTIONS = [
  { label: "퀴즈하기", href: "/quiz", bg: "bg-[#d2dbec]/60" },
  { label: "복습하기", href: "/quiz/notes", bg: "bg-[#bb99e2]/40" },
  { label: "강의자료실", href: "/library", bg: "bg-[#ffceA0]/60" },
  { label: "AI chat", href: "/chat", bg: "bg-[#b3e4a7]/60" },
];

// PriorityChecklistItem → TaskListCard 행 형태
const toTask = (item) => ({
  id: String(item.assignment_id),
  subjectId: item.subject_id,
  title: item.subject_name,
  professor: item.title,
  dueLabel: item.is_overdue ? `마감 ${-item.days_remaining}일 지남` : `마감 D-${item.days_remaining}`,
  status: item.is_overdue ? "overdue" : "today",
});

export default function Dashboard() {
  const nickname = getStoredUser()?.nickname ?? "";
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");

  useEffect(() => {
    getPriority()
      .then((items) => setTasks(items.map(toTask)))
      .catch((err) => setTasksError(getErrorMessage(err, "해야 할 일을 불러오지 못했어요.")))
      .finally(() => setTasksLoading(false));
    listSubjects()
      .then(setSubjects)
      .catch(() => {});
  }, []);

  const cancelledSubjectIds = new Set(subjects.filter((s) => s.is_canceled_this_week).map((s) => s.id));

  const handleToggleCancel = async (subjectId) => {
    try {
      const updated = await toggleCancelWeek(subjectId);
      setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err) {
      alert(getErrorMessage(err, "휴강 처리에 실패했어요."));
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 px-6 py-8 sm:px-10">
        <section className="rounded-[2.5rem] bg-gradient-to-r from-moram-blue to-moram-navy px-8 py-8 text-white">
          <p className="text-xl font-bold sm:text-2xl">
            {nickname} 님! F는 Family의 F가 아닙니다... 마감 시각이 코앞으로 다가왔어요!
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

            <TaskListCard
              tasks={tasks}
              loading={tasksLoading}
              error={tasksError}
              cancelledSubjectIds={cancelledSubjectIds}
              onToggleCancel={handleToggleCancel}
            />
          </div>

          <WeeklyTimetable
            subjects={subjects}
            onSubjectCreated={(created) => setSubjects((prev) => [...prev, created])}
          />
        </section>
      </div>
    </AppShell>
  );
}
