import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import AppShell from "../components/AppShell";

/**
 * 오답노트 (오답기록) — Figma 278:602(해설 접힘) / 278:609(해설 펼침)
 * - 상단: 복습 현황 카드(총 오답 수 + 복습 진행률) | 과목 검색 + 정렬/북마크 필터
 * - 오답 카드: 과목·D-day 헤더 + ★북마크 + 복습퀴즈하기, 내 답(빨강)/정답(초록), 해설 토글
 * - 선택된 카드 오른쪽에 옹이가 빼꼼 내다보는 장식(Figma의 Union 도형)
 */

const INITIAL_NOTES = [
  {
    id: "n1",
    subject: "세계와 시민",
    no: 3,
    dday: 2,
    question: "다음 중 임진왜란이 발생한 연도는 무엇인가?",
    yourAnswer: "2006",
    correctAnswer: "1592",
    explanation:
      "임진왜란은 1592년(선조 25)부터 1598년까지 7년 동안 조선과 일본(도요토미 히데요시 정권) 사이에 벌어진 거대한 국제 전쟁이다. 일본의 명나라 침공 구실(정명가도)로 시작되었으나, 조선의 끈질긴 저항과 명나라의 참전으로 동아시아 전체의 판도를 바꿨다.",
    wrongAt: "2026-07-16",
    bookmarked: true,
    reviewed: true,
  },
  {
    id: "n2",
    subject: "주제연구",
    no: 3,
    dday: 6,
    question: "연구 가설을 검증하기 위해 독립변수를 조작하는 연구 방법은?",
    yourAnswer: "상관연구",
    correctAnswer: "실험연구",
    explanation:
      "실험연구는 연구자가 독립변수를 의도적으로 조작하고 다른 변수를 통제하여 종속변수의 변화를 관찰함으로써 인과관계를 검증하는 방법이다. 상관연구는 변수를 조작하지 않고 관계만 살핀다.",
    wrongAt: "2026-07-15",
    bookmarked: false,
    reviewed: false,
  },
  {
    id: "n3",
    subject: "디지털 디자인",
    no: 5,
    dday: 9,
    question: "화면 디자인에서 요소 사이의 빈 공간을 뜻하는 용어는?",
    yourAnswer: "space",
    correctAnswer: "whitespace",
    explanation:
      "화이트스페이스(여백)는 요소 사이의 비어 있는 공간으로, 가독성을 높이고 정보의 위계를 드러내는 역할을 한다.",
    wrongAt: "2026-07-12",
    bookmarked: false,
    reviewed: false,
  },
];

const cardShadow = "shadow-[0_1px_1px_rgba(0,0,0,0.25)]";

function PeekingOngi() {
  // 카드 오른쪽 가장자리에서 옹이 머리가 반쯤 나와 있는 장식.
  // 원 1개(머리)라 aspect-square 로 비율 고정 → 타원으로 찌그러지지 않음.
  const circle = "absolute right-[-92px] top-[80px] aspect-square w-[166px] rounded-full";
  return (
    <>
      {/* 카드 뒤: 테두리 + 그림자가 있는 머리 */}
      <div
        aria-hidden
        className={`${circle} z-0 border border-moram-navy bg-white shadow-[0_0_24px_rgba(84,130,180,0.35)]`}
      />
      {/* 카드 위: 테두리 없는 흰 원으로 카드 오른쪽 테두리 선을 덮어 하나의 도형처럼 보이게 */}
      <div aria-hidden className={`${circle} z-20 scale-[0.988] bg-white`}>
        <span className="absolute left-[60%] top-[17%] aspect-square w-[6.3%] rounded-full bg-black" />
        <span className="absolute left-[60%] top-[45%] aspect-square w-[6.3%] rounded-full bg-black" />
      </div>
    </>
  );
}

function NoteCard({ note, selected, onSelect, onToggleBookmark, onToggleExplanation, open, onReview }) {
  return (
    <div className="relative" onClick={onSelect}>
      {selected && <PeekingOngi />}
      <article
        className={`relative z-10 overflow-hidden rounded-[48px] bg-white transition ${
          selected
            ? "border border-moram-navy shadow-[0_0_28px_rgba(84,130,180,0.35)]"
            : `border-[1.5px] border-black/20 ${cardShadow}`
        }`}
      >
        {/* 헤더 */}
        <header className="flex items-center gap-2 border-b border-black/20 px-9 py-4">
          <h2 className="text-2xl font-semibold text-moram-logo">
            Q. {String(note.no).padStart(2, "0")} - {note.subject} (D-{note.dday})
          </h2>
          <button
            type="button"
            aria-label={note.bookmarked ? "북마크 해제" : "북마크"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark();
            }}
          >
            <Star
              className={`h-7 w-7 ${note.bookmarked ? "fill-[#ffe500] text-[#e8c400]" : "text-black/20"}`}
              strokeWidth={1.5}
            />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReview();
            }}
            className="ml-auto rounded-xl bg-[linear-gradient(93deg,#06275a_0.7%,#0d53c0_96%)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
          >
            복습퀴즈하기
          </button>
        </header>

        {/* 문제 + 답 */}
        <div className="flex flex-col gap-5 px-9 pb-8 pt-4">
          <p className="text-[22px] font-medium text-moram-navy">Q. {note.question}</p>
          <div className="flex flex-col gap-4 pt-3">
            <p className="flex items-center gap-4 text-xl font-medium text-[#b91c1c]">
              <XCircle className="h-7 w-7" strokeWidth={2} />
              {note.yourAnswer}
            </p>
            <p className="flex items-center gap-4 text-xl font-medium text-[#2e7d32]">
              <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#2e7d32]">
                <ChevronDown className="h-4 w-4" strokeWidth={3} />
              </span>
              {note.correctAnswer}
            </p>
          </div>
        </div>

        {/* 해설 */}
        <div className="border-t border-black/20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExplanation();
            }}
            aria-expanded={open}
            className="flex w-full items-center justify-between px-9 py-3 text-left"
          >
            <span className="text-2xl font-semibold text-moram-blue">해설</span>
            {open ? (
              <ChevronUp className="h-7 w-7 text-moram-blue" strokeWidth={3} />
            ) : (
              <ChevronDown className="h-7 w-7 text-moram-blue" strokeWidth={3} />
            )}
          </button>
          {open && (
            <p className="max-w-3xl px-9 pb-6 text-lg font-medium leading-relaxed text-moram-logo">
              {note.explanation}
            </p>
          )}
        </div>
      </article>
    </div>
  );
}

export default function WrongAnswerNotes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [query, setQuery] = useState("");
  const [sortRecent, setSortRecent] = useState(true);
  const [bookmarkOnly, setBookmarkOnly] = useState(false);
  const [openIds, setOpenIds] = useState(() => new Set());
  const [selectedId, setSelectedId] = useState(INITIAL_NOTES[0].id);

  const total = notes.length;
  const reviewedPct = total ? Math.round((notes.filter((n) => n.reviewed).length / total) * 100) : 0;

  const visible = useMemo(() => {
    const q = query.trim();
    let list = notes.filter((n) => (!q || n.subject.includes(q)) && (!bookmarkOnly || n.bookmarked));
    if (sortRecent) list = [...list].sort((a, b) => b.wrongAt.localeCompare(a.wrongAt));
    return list;
  }, [notes, query, sortRecent, bookmarkOnly]);

  const update = (id, patch) => setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch(n) } : n)));

  const toggleExplanation = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    update(id, () => ({ reviewed: true })); // 해설을 한 번 열어보면 복습한 것으로 집계
  };

  const filterBtn = (active) =>
    `flex-1 rounded-[20px] border-[1.5px] bg-white py-3 text-lg font-medium text-moram-navy ${cardShadow} transition ${
      active ? "border-moram-navy bg-[#d2dbec]/40" : "border-black/20 hover:bg-[#d2dbec]/20"
    }`;

  return (
    <AppShell>
      <div className="relative overflow-hidden">
        {/* 배경 원 장식 */}
        <div aria-hidden className="pointer-events-none absolute -left-[180px] -top-[260px] h-[640px] w-[620px] rounded-full bg-[#d2dbec]/30" />

        <div className="relative mx-auto flex max-w-[1015px] flex-col gap-10 px-6 py-8 pr-28">
          {/* 타이틀 행 */}
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-moram-logo">오답기록</h1>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="ml-auto rounded-xl bg-[linear-gradient(92deg,#06275a_0.7%,#0d53c0_96%)] px-5 py-2 text-sm font-medium text-white hover:brightness-110"
            >
              나가기
            </button>
          </div>

          {/* 상단 2단: 복습 현황 | 검색·필터 */}
          <div className="grid gap-7 md:grid-cols-[1832fr_2062fr]">
            <section className={`flex flex-col justify-center gap-6 rounded-[48px] border-[1.5px] border-black/20 bg-white px-8 py-10 ${cardShadow}`}>
              <h2 className="text-[29px] font-semibold text-moram-logo">복습 현황</h2>
              <div>
                <div className="flex items-end justify-between text-lg font-medium text-moram-navy">
                  <span>총 오답 {total}개</span>
                  <span>{reviewedPct}%</span>
                </div>
                <div className="mt-2 h-[19px] overflow-hidden rounded-full bg-[#d2dbec]/70">
                  <div className="h-full rounded-full bg-moram-logo transition-all" style={{ width: `${reviewedPct}%` }} />
                </div>
              </div>
            </section>

            <section className={`flex flex-col justify-center gap-8 rounded-[48px] border-[1.5px] border-black/20 bg-white px-6 py-10 ${cardShadow}`}>
              <label className="flex items-center gap-3 rounded-full bg-[#d2dbec]/70 px-4 py-3">
                <Search className="h-7 w-7 text-moram-logo" strokeWidth={2.5} />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="과목명을 검색하세요."
                  className="w-full bg-transparent text-lg font-medium text-moram-logo outline-none placeholder:text-moram-logo"
                />
              </label>
              <div className="flex gap-6">
                <button type="button" onClick={() => setSortRecent((v) => !v)} className={filterBtn(sortRecent)}>
                  최근 틀린순
                </button>
                <button type="button" onClick={() => setBookmarkOnly((v) => !v)} className={filterBtn(bookmarkOnly)}>
                  북마크
                </button>
              </div>
            </section>
          </div>

          {/* 오답 카드 목록 */}
          <div className="flex flex-col gap-8">
            {visible.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                selected={selectedId === note.id}
                onSelect={() => setSelectedId(note.id)}
                open={openIds.has(note.id)}
                onToggleExplanation={() => toggleExplanation(note.id)}
                onToggleBookmark={() => update(note.id, (n) => ({ bookmarked: !n.bookmarked }))}
                onReview={() => {
                  update(note.id, () => ({ reviewed: true }));
                  navigate("/quiz", { state: { reviewSubject: note.subject } });
                }}
              />
            ))}
            {visible.length === 0 && (
              <p className="py-10 text-center text-sm text-gray-400">
                {bookmarkOnly ? "북마크한 오답이 없어요." : "검색 결과가 없어요."}
              </p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
