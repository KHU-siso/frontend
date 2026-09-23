import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import AppShell from "../components/AppShell";

const COURSES = [
  {
    id: "photo1",
    title: "사진 1",
    professor: "이재용 교수님",
    counts: { 퀴즈: 0, 시험: 0, 과제: 0, 학습: 0 },
    notices: 0,
  },
  {
    id: "digital-design",
    title: "디지털 디자인",
    professor: "조서연 교수님",
    counts: { 퀴즈: 0, 시험: 0, 과제: 0, 학습: 0 },
    notices: 0,
  },
  {
    id: "reflection-01",
    title: "성찰과 표현 01분반",
    professor: "곽윤호 교수님",
    counts: { 퀴즈: 0, 시험: 0, 과제: 0, 학습: 0 },
    notices: 0,
  },
  {
    id: "citizenship-03",
    title: "세계와 시민 03 분반",
    professor: "김재형 교수님",
    counts: { 퀴즈: 0, 시험: 0, 과제: 0, 학습: 0 },
    notices: 0,
  },
];

function AttendanceTracker() {
  const STATES = ["none", "present", "absent"];
  const [weeks, setWeeks] = useState(
    Array.from({ length: 14 }, (_, i) => (i < 3 ? "present" : i === 3 ? "absent" : "none"))
  );

  const cycle = (i) => {
    setWeeks((prev) =>
      prev.map((s, idx) => (idx === i ? STATES[(STATES.indexOf(s) + 1) % STATES.length] : s))
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-col gap-2">
        <Link
          to="#"
          className="flex items-center gap-1 rounded-full bg-gradient-to-r from-moram-navy to-moram-blue px-4 py-2 text-xs font-bold text-white"
        >
          학습하기 <ArrowRight className="h-3 w-3" />
        </Link>
        <span className="rounded-full bg-[#d2dbec]/60 px-4 py-2 text-center text-xs font-semibold text-moram-navy">
          출결 확인
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {weeks.map((state, i) => (
          <button
            key={i}
            type="button"
            onClick={() => cycle(i)}
            className="flex flex-col items-center gap-1 text-xs text-gray-400"
            title="클릭해서 출결 상태 변경"
          >
            <span>{i + 1}</span>
            <span
              className={`grid h-6 w-6 place-items-center rounded-full border-2 text-[10px] font-bold ${
                state === "present"
                  ? "border-emerald-500 text-emerald-600"
                  : state === "absent"
                  ? "border-red-400 text-red-500"
                  : "border-gray-200 text-transparent"
              }`}
            >
              {state === "present" ? "○" : state === "absent" ? "✕" : "-"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CourseRow({ course }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[2rem] border-2 border-black/10 bg-white shadow-[0_4px_23px_0_rgba(0,0,0,0.1)]">
      <div className="flex flex-wrap items-center gap-4 px-6 py-5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="자세히 보기"
          className="text-gray-400 transition hover:text-moram-navy"
        >
          <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        <div className="min-w-[180px] flex-1">
          <p className="text-lg font-bold text-black">{course.title}</p>
          <p className="text-sm text-gray-500">2026년 2학기 · {course.professor}</p>
        </div>

        <div className="flex gap-6 text-center text-sm text-gray-400">
          {Object.entries(course.counts).map(([label, value]) => (
            <div key={label}>
              <p className="font-bold text-gray-500">{value}</p>
              <p>{label}</p>
            </div>
          ))}
        </div>

        <div className="h-8 w-px bg-gray-200" />

        <div className="text-center text-sm text-gray-400">
          <p className="font-bold text-gray-500">{course.notices}</p>
          <p>공지</p>
        </div>

        <Link
          to={`/library/${course.id}`}
          className="ml-auto flex items-center gap-2 rounded-full bg-gradient-to-r from-moram-navy to-moram-blue px-5 py-3 text-sm font-bold text-white"
        >
          과목 홈 바로가기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {open && (
        <div className="border-t border-gray-100 px-6 py-4">
          <AttendanceTracker />
        </div>
      )}
    </div>
  );
}

export default function Library() {
  const [query, setQuery] = useState("");
  const [semester, setSemester] = useState("2026학년도 2학기");

  const filtered = useMemo(
    () => COURSES.filter((c) => c.title.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const totalNotices = COURSES.reduce((sum, c) => sum + c.notices, 0);

  return (
    <AppShell>
      <div className="flex flex-col gap-6 px-6 py-8 sm:px-10">
        <section className="rounded-[2.5rem] bg-gradient-to-r from-moram-navy to-moram-blue px-8 py-10 text-white">
          <h1 className="text-4xl font-bold">자료실</h1>
        </section>

        <div className="flex flex-wrap gap-3">
          <span className="rounded-2xl border-2 border-black/10 bg-white px-4 py-2 text-sm font-medium">학기 선택</span>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="rounded-2xl border-2 border-black/10 bg-white px-4 py-2 text-sm font-medium text-moram-navy outline-none"
          >
            <option>2026학년도 2학기</option>
            <option>2026학년도 1학기</option>
            <option>2025학년도 2학기</option>
          </select>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="과목 검색"
            className="rounded-2xl border-2 border-black/10 bg-white px-4 py-2 text-sm outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-3xl border-2 border-black/10 bg-white px-6 py-5">
            <span className="h-3 w-3 rounded-full bg-red-600" />
            <span className="font-medium text-black">공지</span>
            <span className="ml-auto text-3xl font-bold text-red-700">{totalNotices}</span>
          </div>
          <div className="flex items-center gap-3 rounded-3xl border-2 border-black/10 bg-white px-6 py-5">
            <span className="h-3 w-3 rounded-full bg-emerald-600" />
            <span className="font-medium text-black">메시지</span>
            <span className="ml-auto text-3xl font-bold text-emerald-700">0</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {filtered.map((course) => (
            <CourseRow key={course.id} course={course} />
          ))}
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">검색 결과가 없습니다.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
