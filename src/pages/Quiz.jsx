import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, XCircle } from "lucide-react";
import moramMark from "../assets/quiz/moram-mark.svg";

/**
 * 퀴즈 학습 흐름 — Figma 281:320(시작) → 281:336/405(학습 설정) → 281:461/522(과목 선택)
 * → 281:544/283:20(학습 방식) → 283:94(문제 유형, 문제풀기 선택시) → 문제 풀이 → 280:357(결과)
 *
 * 대시보드/메뉴에서 "퀴즈하기"를 누르면 항상 이 순서(step 스테이트 머신)를 처음부터 거친다.
 * 오답노트의 "복습퀴즈하기"에서 넘어온 경우(state.reviewSubject)는 설정 단계를 건너뛰고
 * 바로 해당 과목의 문제 풀이로 진입한다.
 */

const SUBJECTS = ["세계와 시민", "인간의 가치 탐색", "성찰과 표현", "대학 영어", "미적분"];

const MODES = [
  { id: "solve", title: "문제 풀기", desc: "배운 내용을 문제로 확인해요." },
  { id: "review", title: "오답 복습", desc: "틀렸던 문제를 다시 풀어봐요." },
  { id: "concept", title: "개념 학습", desc: "중요한 개념을 다시 확인해요." },
  { id: "quick", title: "빠른 학습", desc: "짧은 시간 동안 핵심 문제만 풀어요." },
];

const DURATION_OPTIONS = ["30분", "1시간", "1시간 30분"];
const COUNT_OPTIONS = ["10문제", "20문제", "30문제"];

const QUESTION_BANK = {
  "세계와 시민": [
    { type: "객관식", prompt: "임진왜란이 발생한 연도는?", options: ["2005", "2006", "2007", "1592"], answer: "1592" },
    { type: "객관식", prompt: "대한민국의 수도는?", options: ["부산", "서울", "인천", "대전"], answer: "서울" },
    { type: "주관식", prompt: "세계 시민의 권리와 의무를 실천하는 대표적 활동은? (한 단어)", answer: "봉사" },
  ],
  "인간의 가치 탐색": [
    { type: "객관식", prompt: "매슬로우의 욕구 5단계 중 가장 높은 단계는?", options: ["생리적 욕구", "안전 욕구", "자아실현 욕구", "소속 욕구"], answer: "자아실현 욕구" },
    { type: "주관식", prompt: "타인의 입장에서 함께 느끼는 능력을 뜻하는 단어는? (한글)", answer: "공감" },
    { type: "객관식", prompt: "다음 중 내재적 가치에 해당하는 것은?", options: ["돈", "행복", "명예", "권력"], answer: "행복" },
  ],
  "성찰과 표현": [
    { type: "주관식", prompt: "자신의 생각과 감정을 담은 짧은 글을 무엇이라 하는가?", answer: "수필" },
    { type: "객관식", prompt: "성찰적 글쓰기에 가장 적합한 형식은?", options: ["보고서", "일기", "광고문", "설명서"], answer: "일기" },
    { type: "객관식", prompt: "다음 중 1인칭 시점의 특징은?", options: ["객관적 서술", "화자의 생각 직접 전달", "전지적 시점", "인물 외부 관찰"], answer: "화자의 생각 직접 전달" },
  ],
  "대학 영어": [
    { type: "객관식", prompt: "'whitespace'의 뜻으로 가장 알맞은 것은?", options: ["여백", "검정", "속도", "소리"], answer: "여백" },
    { type: "주관식", prompt: "'책'을 뜻하는 영단어는? (소문자)", answer: "book" },
    { type: "객관식", prompt: "다음 중 완료 시제를 만들 때 쓰는 조동사는?", options: ["do", "have", "will", "can"], answer: "have" },
  ],
  미적분: [
    { type: "객관식", prompt: "f(x) = x² 의 도함수는?", options: ["x", "2x", "x²", "2"], answer: "2x" },
    { type: "주관식", prompt: "함수의 순간 변화율을 구하는 개념은? (한글)", answer: "미분" },
    { type: "객관식", prompt: "∫2x dx 의 결과는? (+C 생략)", options: ["x²", "2x²", "x", "2"], answer: "x²" },
  ],
};

/* ------------------------------------------------------------------ */
/* 공통 배경/헤더 셸 — 로고 + 나가기 버튼 + 은은한 원형 장식 (Figma 배경 Ellipse들 참고) */
function QuizChrome({ onExit, title, subtitle, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div aria-hidden className="pointer-events-none absolute -left-48 -top-56 h-[560px] w-[560px] rounded-full bg-[#d2dbec]/50" />
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-72 h-[520px] w-[520px] rounded-full bg-[#d2dbec]/30" />
      <div aria-hidden className="pointer-events-none absolute right-10 top-24 h-[220px] w-[220px] rounded-full bg-moram-sky/40" />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <img src={moramMark} alt="moram" className="h-6" />
        <button
          type="button"
          onClick={onExit}
          className="rounded-full bg-gradient-to-r from-[#06275a] to-[#0d53c0] px-6 py-3 text-sm font-medium text-white transition hover:brightness-110"
        >
          나가기
        </button>
      </header>

      <main className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pb-16 pt-8 text-center">
        {title && <h1 className="text-2xl font-semibold text-black sm:text-3xl">{title}</h1>}
        {subtitle && <p className="mt-3 text-sm font-medium text-black/50">{subtitle}</p>}
        {children}
      </main>
    </div>
  );
}

/* 281:336/405 — 드롭다운형 선택 필드 (미선택: 옵션 펼침 / 선택: 값만 보이는 pill) */
function FieldSelect({ label, value, options, onSelect, allowCustom = true }) {
  const [open, setOpen] = useState(!value);
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const choose = (v) => {
    onSelect(v);
    setOpen(false);
    setCustomMode(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-lg font-semibold text-black">{label}</h2>
      <div className="w-full max-w-[280px]">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`flex w-full items-center gap-2 rounded-[20px] border-[1.5px] bg-black/[0.03] px-5 py-3 text-sm font-bold transition ${
            value ? "border-moram-navy text-moram-navy" : "border-transparent text-black/30"
          }`}
        >
          <ChevronDown className={`h-4 w-4 shrink-0 text-moram-navy transition-transform ${open ? "" : "-rotate-90"}`} />
          <span className="truncate">{value || "(선택)"}</span>
        </button>

        {open && (
          <div className="mt-2 flex flex-col gap-3">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => choose(opt)}
                className="rounded-full px-4 py-2 text-sm font-bold text-moram-navy transition hover:bg-[#d2dbec]/30"
              >
                {opt}
              </button>
            ))}
            {allowCustom &&
              (customMode ? (
                <input
                  autoFocus
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customValue.trim()) choose(customValue.trim());
                  }}
                  onBlur={() => customValue.trim() && choose(customValue.trim())}
                  placeholder="직접 입력 후 Enter"
                  className="rounded-full border border-black/10 px-4 py-2 text-center text-sm font-medium text-moram-navy outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setCustomMode(true)}
                  className="text-sm font-bold text-black/30 transition hover:text-moram-navy"
                >
                  (직접 작성)
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* 연속 학습(일수) — Figma 상 프리셋 없이 직접 입력만 존재 */
function FieldDays({ label, value, onChange }) {
  const [editing, setEditing] = useState(!value);
  const [draft, setDraft] = useState(value ? value.replace("일", "") : "");

  const commit = () => {
    if (draft.trim()) {
      onChange(`${draft.trim()}일`);
      setEditing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-lg font-semibold text-black">{label}</h2>
      <div className="w-full max-w-[280px]">
        {editing ? (
          <div className="flex items-center gap-2 rounded-[20px] border-[1.5px] border-transparent bg-black/[0.03] px-5 py-3">
            <ChevronDown className="h-4 w-4 shrink-0 text-moram-navy" />
            <input
              autoFocus
              type="number"
              min={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commit()}
              onBlur={commit}
              placeholder="직접 작성"
              className="w-full bg-transparent text-sm font-bold text-moram-navy outline-none placeholder:font-bold placeholder:text-black/30"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex w-full items-center gap-2 rounded-[20px] border-[1.5px] border-moram-navy bg-black/[0.03] px-5 py-3 text-sm font-bold text-moram-navy"
          >
            <ChevronDown className="h-4 w-4 shrink-0" />
            {value}
          </button>
        )}
      </div>
    </div>
  );
}

function SubjectList({ value, onSelect }) {
  return (
    <div className="mt-10 flex w-full max-w-sm flex-col gap-4">
      {SUBJECTS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onSelect(s)}
          className={`rounded-3xl border-[1.5px] bg-black/[0.03] px-6 py-4 text-base font-bold text-moram-navy transition ${
            value === s ? "border-moram-navy shadow-[0_4px_10px_rgba(0,0,0,0.15)]" : "border-transparent hover:border-black/10"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function ModeGrid({ value, onSelect }) {
  return (
    <div className="mt-10 grid w-full max-w-xl grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
      {MODES.map((m) => (
        <button key={m.id} type="button" onClick={() => onSelect(m.id)} className="flex flex-col items-center gap-3">
          <span
            className={`w-full rounded-3xl border-[1.5px] bg-black/[0.03] px-6 py-4 text-base font-bold text-moram-navy transition ${
              value === m.id ? "border-moram-navy shadow-[0_4px_10px_rgba(0,0,0,0.15)]" : "border-transparent hover:border-black/10"
            }`}
          >
            {m.title}
          </span>
          <span className="text-sm font-bold text-moram-navy">{m.desc}</span>
        </button>
      ))}
    </div>
  );
}

function TypeChoice({ value, onSelect }) {
  return (
    <div className="mt-14 flex w-full max-w-lg items-center justify-center gap-8">
      <button
        type="button"
        onClick={() => onSelect("주관식")}
        className={`flex-1 rounded-full py-8 text-2xl font-semibold text-white transition ${
          value === "주관식" ? "bg-moram-blue ring-4 ring-moram-navy/40" : "bg-moram-blue/70 hover:bg-moram-blue"
        }`}
      >
        주관식
      </button>
      <button
        type="button"
        onClick={() => onSelect("객관식")}
        className={`flex-1 rounded-full py-8 text-2xl font-semibold text-white transition ${
          value === "객관식" ? "bg-[#0d53c0] ring-4 ring-moram-navy/40" : "bg-[#0d53c0]/80 hover:bg-[#0d53c0]"
        }`}
      >
        객관식
      </button>
    </div>
  );
}

/* 280:357 — 원형 정확도 그래프 */
function ScoreRing({ percent }) {
  const size = 220;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#123263"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

export default function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const reviewSubject = location.state?.reviewSubject;

  const [step, setStep] = useState(reviewSubject ? "questions" : "intro");
  const [settings, setSettings] = useState({ duration: "", streak: "", count: "" });
  const [subject, setSubject] = useState(reviewSubject || "");
  const [mode, setMode] = useState(reviewSubject ? "review" : "");
  const [qType, setQType] = useState("");

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [shortAnswer, setShortAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState([]);

  // 281:320 "퀴즈 학습 시작 (모션 추가)" — 잠시 보여준 뒤 자동으로 설정 단계로 이동
  useEffect(() => {
    if (step !== "intro") return undefined;
    const t = setTimeout(() => setStep("settings"), 1600);
    return () => clearTimeout(t);
  }, [step]);

  const pool = QUESTION_BANK[subject] || [];
  const activeQuestions = useMemo(() => {
    if (mode === "solve" && qType) {
      const filtered = pool.filter((q) => q.type === qType);
      return filtered.length ? filtered : pool;
    }
    return pool;
  }, [pool, mode, qType]);

  const question = activeQuestions[index];
  const isLast = index === activeQuestions.length - 1;
  const canCheck = question?.type === "객관식" ? selected !== null : shortAnswer.trim().length > 0;

  const isCorrect = useMemo(() => {
    if (!question || !checked) return null;
    if (question.type === "객관식") return selected === question.answer;
    return shortAnswer.trim().toLowerCase() === question.answer.toLowerCase();
  }, [question, checked, selected, shortAnswer]);

  const exit = () => navigate("/dashboard");

  const handleCheck = () => {
    if (!canCheck || checked || !question) return;
    setChecked(true);
    setResults((prev) => [...prev, { id: question.prompt, correct: isCorrect }]);
  };

  const handleNext = () => {
    if (isLast) {
      setStep("result");
    } else {
      setIndex((i) => i + 1);
    }
    setSelected(null);
    setShortAnswer("");
    setChecked(false);
  };

  const resetQuiz = () => {
    setIndex(0);
    setResults([]);
    setSelected(null);
    setShortAnswer("");
    setChecked(false);
    setStep("questions");
  };

  /* ---------------- 281:320 시작 화면 ---------------- */
  if (step === "intro") {
    return (
      <QuizChrome onExit={exit}>
        <button type="button" onClick={() => setStep("settings")} className="mt-16 flex flex-col items-center gap-6">
          <span className="text-3xl font-semibold text-black sm:text-4xl">오늘의 학습을 시작해볼까요?</span>
          <span className="animate-pulse text-sm font-medium text-black/40">탭해서 시작하기</span>
        </button>
      </QuizChrome>
    );
  }

  /* ---------------- 281:336 / 281:405 학습 설정 ---------------- */
  if (step === "settings") {
    const canNext = settings.duration && settings.streak && settings.count;
    return (
      <QuizChrome onExit={exit} title="오늘의 학습을 시작해볼까요?">
        <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-10 sm:grid-cols-3">
          <FieldSelect
            label="오늘의 학습 목표"
            value={settings.duration}
            options={DURATION_OPTIONS}
            onSelect={(v) => setSettings((s) => ({ ...s, duration: v }))}
          />
          <FieldDays label="연속 학습" value={settings.streak} onChange={(v) => setSettings((s) => ({ ...s, streak: v }))} />
          <FieldSelect
            label="오늘 풀 문제"
            value={settings.count}
            options={COUNT_OPTIONS}
            onSelect={(v) => setSettings((s) => ({ ...s, count: v }))}
          />
        </div>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => setStep("subject")}
          className="mt-14 w-full max-w-sm rounded-full bg-[#d2dbec]/60 py-4 text-base font-medium text-moram-navy transition disabled:cursor-not-allowed enabled:bg-gradient-to-r enabled:from-[#06275a] enabled:to-[#0d53c0] enabled:text-white enabled:hover:brightness-110"
        >
          넘어가기
        </button>
      </QuizChrome>
    );
  }

  /* ---------------- 281:461 / 281:522 과목 선택 ---------------- */
  if (step === "subject") {
    return (
      <QuizChrome onExit={exit} title="무엇을 공부할까요?">
        <SubjectList value={subject} onSelect={setSubject} />
        {subject && (
          <button
            type="button"
            onClick={() => setStep("mode")}
            className="mt-10 w-full max-w-sm rounded-full bg-gradient-to-r from-[#06275a] to-[#0d53c0] py-4 text-base font-medium text-white transition hover:brightness-110"
          >
            넘어가기
          </button>
        )}
      </QuizChrome>
    );
  }

  /* ---------------- 281:544 / 283:20 학습 방식 선택 ---------------- */
  if (step === "mode") {
    return (
      <QuizChrome onExit={exit} title="어떻게 학습할까요?">
        <ModeGrid value={mode} onSelect={setMode} />
        {mode && (
          <button
            type="button"
            onClick={() => setStep(mode === "solve" ? "type" : "questions")}
            className="mt-14 w-full max-w-sm rounded-full bg-gradient-to-r from-[#06275a] to-[#0d53c0] py-4 text-base font-medium text-white transition hover:brightness-110"
          >
            학습 시작
          </button>
        )}
      </QuizChrome>
    );
  }

  /* ---------------- 283:94 문제 풀기 선택시 (주관식/객관식) ---------------- */
  if (step === "type") {
    return (
      <QuizChrome onExit={exit} title="문제 풀기">
        <TypeChoice value={qType} onSelect={setQType} />
        {qType && (
          <button
            type="button"
            onClick={() => setStep("questions")}
            className="mt-14 w-full max-w-sm rounded-full bg-gradient-to-r from-[#06275a] to-[#0d53c0] py-4 text-base font-medium text-white transition hover:brightness-110"
          >
            학습 시작
          </button>
        )}
      </QuizChrome>
    );
  }

  /* ---------------- 280:357 결과 화면 ---------------- */
  if (step === "result") {
    const total = activeQuestions.length;
    const correctCount = results.filter((r) => r.correct).length;
    const wrongCount = Math.max(total - correctCount, 0);
    const percent = total ? Math.round((correctCount / total) * 100) : 0;
    const message = percent >= 80 ? "정말 잘했어요!" : percent >= 50 ? "좋은 시작이에요!" : "다음엔 더 잘해봐요!";

    return (
      <QuizChrome onExit={exit}>
        <div className="relative mt-6 grid place-items-center">
          <ScoreRing percent={percent} />
          <span className="absolute text-4xl font-bold text-black">{percent}%</span>
        </div>
        <h2 className="mt-8 text-2xl font-bold text-black">{message}</h2>
        <p className="mt-2 text-base font-semibold text-moram-navy">
          총 {total}문제 중 <span className="text-[#0d53c0]">{correctCount}문제</span> 정답
        </p>

        <div className="mt-8 flex gap-4">
          <div className="flex w-24 flex-col items-center gap-1 rounded-3xl bg-[#d2dbec]/40 py-5">
            <span className="text-2xl font-bold text-emerald-600">{correctCount}</span>
            <span className="text-xs font-semibold text-black/40">정답</span>
          </div>
          <div className="flex w-24 flex-col items-center gap-1 rounded-3xl bg-[#d2dbec]/40 py-5">
            <span className="text-2xl font-bold text-red-500/80">{wrongCount}</span>
            <span className="text-xs font-semibold text-black/40">오답</span>
          </div>
          <div className="flex w-24 flex-col items-center gap-1 rounded-3xl bg-[#d2dbec]/40 py-5">
            <span className="text-2xl font-bold text-moram-logo">{percent}%</span>
            <span className="text-xs font-semibold text-black/40">정확도</span>
          </div>
        </div>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
          <button
            type="button"
            onClick={resetQuiz}
            className="rounded-full bg-gradient-to-r from-[#06275a] to-[#0d53c0] py-4 text-base font-bold text-white transition hover:brightness-110"
          >
            다시 풀기
          </button>
          <button
            type="button"
            onClick={exit}
            className="rounded-full border border-black/20 bg-white py-4 text-base font-bold text-moram-navy/70 transition hover:bg-black/5"
          >
            나가기
          </button>
        </div>

        <Link to="/quiz/notes" className="mt-4 text-sm font-semibold text-moram-blue hover:underline">
          오답노트 보기
        </Link>
      </QuizChrome>
    );
  }

  /* ---------------- 문제 풀이 화면 ---------------- */
  if (!question) {
    return (
      <QuizChrome onExit={exit} title="문제를 준비하지 못했어요">
        <p className="mt-6 text-sm text-black/50">선택한 조건에 맞는 문제가 아직 없어요.</p>
        <button
          type="button"
          onClick={exit}
          className="mt-8 rounded-full bg-gradient-to-r from-[#06275a] to-[#0d53c0] px-8 py-3 text-sm font-bold text-white"
        >
          대시보드로
        </button>
      </QuizChrome>
    );
  }

  const progress = ((index + (checked ? 1 : 0)) / activeQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center gap-4 px-6 py-6 sm:px-10">
        <img src={moramMark} alt="moram" className="h-6" />
        <span className="text-lg font-medium text-moram-navy">
          {index + 1}/{activeQuestions.length}
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-moram-navy transition-all" style={{ width: `${progress}%` }} />
        </div>
        <button
          type="button"
          onClick={exit}
          className="rounded-full bg-gradient-to-r from-[#06275a] to-[#0d53c0] px-6 py-3 text-sm font-medium text-white"
        >
          나가기
        </button>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-10">
        <div className="flex gap-2 self-center">
          <span className="rounded-full bg-[#d2dbec]/70 px-4 py-2 text-sm text-moram-navy">{subject}</span>
          <span className="rounded-full bg-[#0d53c0] px-4 py-2 text-sm text-white">{question.type}</span>
        </div>

        <h1 className="mt-8 text-center text-2xl font-semibold text-black sm:text-3xl">{question.prompt}</h1>

        {question.type === "객관식" ? (
          <div className="mt-8 flex w-full flex-col gap-4">
            {question.options.map((opt, i) => {
              const isSelected = selected === opt;
              const showCorrect = checked && opt === question.answer;
              const showWrong = checked && isSelected && opt !== question.answer;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={checked}
                  onClick={() => setSelected(opt)}
                  className={`flex items-center gap-4 rounded-3xl border-4 px-6 py-5 text-left transition ${
                    showCorrect
                      ? "border-emerald-400 bg-emerald-50"
                      : showWrong
                      ? "border-red-300 bg-red-50"
                      : isSelected
                      ? "border-moram-blue bg-[#d2dbec]/40"
                      : "border-black/10"
                  }`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black/20 text-sm font-semibold">
                    {i + 1}
                  </span>
                  <span className="font-medium text-moram-navy">{opt}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <input
            type="text"
            value={shortAnswer}
            onChange={(e) => setShortAnswer(e.target.value)}
            disabled={checked}
            placeholder="답을 입력하세요"
            className="mt-8 w-full rounded-3xl border-4 border-black/10 px-6 py-5 text-center text-lg outline-none focus:border-moram-blue"
          />
        )}

        {checked && (
          <p className={`mt-4 flex items-center gap-2 text-sm font-semibold ${isCorrect ? "text-emerald-600" : "text-red-600"}`}>
            {!isCorrect && <XCircle className="h-4 w-4" />}
            {isCorrect ? "정답이에요!" : `오답이에요. 정답은 "${question.answer}" 입니다.`}
          </p>
        )}

        <button
          type="button"
          onClick={checked ? handleNext : handleCheck}
          disabled={!checked && !canCheck}
          className="mt-10 w-full rounded-3xl bg-[#d2dbec]/60 py-5 text-center font-medium text-moram-navy transition disabled:opacity-60 enabled:bg-moram-blue enabled:text-white"
        >
          {checked ? (isLast ? "결과 보기" : "다음 문제") : "정답 확인"}
        </button>
      </main>
    </div>
  );
}
