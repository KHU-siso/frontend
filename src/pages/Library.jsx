import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight, Upload, Trash2, FileText } from "lucide-react";
import AppShell from "../components/AppShell";
import { listSubjects } from "../api/subjects";
import { listDocuments, uploadDocument, deleteDocument } from "../api/documents";
import { getErrorMessage } from "../api/client";

const hhmm = (time) => time.slice(0, 5);

// SubjectOut → 과목 행. 교수명·퀴즈/시험/과제/학습 개수·공지 수는 명세에 없어 표시하지 않음.
const toCourse = (s) => ({
  id: s.id,
  title: s.name,
  professor: `매주 ${s.day_of_week} ${hhmm(s.start_time)}~${hhmm(s.end_time)}${s.is_canceled_this_week ? " · 이번 주 휴강" : ""}`,
});

function DocumentsSection() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    listDocuments()
      .then(setDocs)
      .catch((err) => setError(getErrorMessage(err, "자료 목록을 불러오지 못했어요.")))
      .finally(() => setLoading(false));
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const created = await uploadDocument(file);
      setDocs((prev) => [created, ...prev]);
    } catch (err) {
      setError(getErrorMessage(err, "업로드에 실패했어요."));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`"${doc.filename}" 자료를 삭제할까요?`)) return;
    try {
      await deleteDocument(doc.id);
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      setError(getErrorMessage(err, "삭제에 실패했어요."));
    }
  };

  return (
    <section className="rounded-[2rem] border-2 border-black/10 bg-white px-6 py-5 shadow-[0_4px_23px_0_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-3">
        <p className="text-lg font-bold text-black">내 학습 자료</p>
        <span className="text-sm text-gray-400">업로드한 자료로 퀴즈·AI chat을 이용할 수 있어요.</span>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="ml-auto flex items-center gap-2 rounded-full bg-gradient-to-r from-moram-navy to-moram-blue px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "업로드 중..." : "자료 업로드"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <ul className="mt-4 flex flex-col divide-y divide-gray-100">
        {docs.map((doc) => (
          <li key={doc.id} className="flex items-center gap-3 py-3 text-sm">
            <FileText className="h-4 w-4 shrink-0 text-moram-blue" />
            <span className="flex-1 truncate font-medium text-black">{doc.filename}</span>
            <span className="shrink-0 text-gray-400">
              {doc.num_pages}쪽 · {new Date(doc.created_at).toLocaleDateString("ko-KR")}
            </span>
            <button
              type="button"
              onClick={() => handleDelete(doc)}
              aria-label="삭제"
              className="shrink-0 text-gray-300 transition hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {loading && <li className="py-3 text-center text-sm text-gray-400">불러오는 중...</li>}
        {!loading && docs.length === 0 && <li className="py-3 text-center text-sm text-gray-400">아직 업로드한 자료가 없어요.</li>}
      </ul>
    </section>
  );
}

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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listSubjects()
      .then((list) => setCourses(list.map(toCourse)))
      .catch((err) => setError(getErrorMessage(err, "과목 목록을 불러오지 못했어요.")))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => courses.filter((c) => c.title.toLowerCase().includes(query.toLowerCase())),
    [courses, query]
  );

  // 공지/메시지 수는 명세에 대응 API가 없음 (아직 더미)
  const totalNotices = 0;

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

        <DocumentsSection />

        <div className="flex flex-col gap-4">
          {loading && <p className="py-10 text-center text-sm text-gray-400">불러오는 중...</p>}
          {error && <p className="py-10 text-center text-sm text-red-500">{error}</p>}
          {filtered.map((course) => (
            <CourseRow key={course.id} course={course} />
          ))}
          {!loading && !error && filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">
              {courses.length === 0 ? "등록된 과목이 없어요. 대시보드 시간표의 + 로 추가해보세요." : "검색 결과가 없습니다."}
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
