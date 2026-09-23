import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, XCircle } from "lucide-react";
import moramMark from "../assets/quiz/moram-mark.svg";
import { listDocuments } from "../api/documents";
import { generateQuiz, getQuestion, submitAnswer, retryAnswer, getQuizResult } from "../api/quiz";
import { getErrorMessage } from "../api/client";

/**
 * 퀴즈 학습 흐름 — Figma 281:320(시작) → 281:336/405(학습 설정) → 281:461/522(과목 선택)
 * → 281:544/283:20(학습 방식) → 283:94(문제 유형, 문제풀기 선택시) → 문제 풀이 → 280:357(결과)
 *
 * 대시보드/메뉴에서 "퀴즈하기"를 누르면 항상 이 순서(step 스테이트 머신)를 처음부터 거친다.
 * 오답노트의 "복습퀴즈하기"에서 넘어온 경우(state.reviewNote)는 설정 단계를 건너뛰고
 * 해당 문제 하나를 retry API로 다시 풀어본다.
 *
 * API 연동: 과목 선택 = 업로드한 자료(document) 선택 → POST /api/quiz/generate(document_id, quiz_type)
 * → GET /api/quiz/{set}/questions/{index} 를 한 문제씩 → POST .../submit (다시 풀기는 .../retry)
 * → GET /api/quiz/{set}/result.
 * 학습 목표/연속 학습/문제 수, 학습 방식(문제 풀기/오답 복습/개념/빠른)은 명세에 대응 필드가 없어 UI만 유지.
 */

const MODES = [
  { id: "solve", title: "문제 풀기", desc: "배운 내용을 문제로 확인해요." },
  { id: "review", title: "오답 복습", desc: "틀렸던 문제를 다시 풀어봐요." },
  { id: "concept", title: "개념 학습", desc: "중요한 개념을 다시 확인해요." },
  { id: "quick", title: "빠른 학습", desc: "짧은 시간 동안 핵심 문제만 풀어요." },
];

const DURATION_OPTIONS = ["30분", "1시간", "1시간 30분"];
const COUNT_OPTIONS = ["10문제", "20문제", "30문제"];

// question_index 가 0부터인지 1부터인지 명세에 없음 — 백엔드 확인 후 조정
const QUESTION_INDEX_BASE = 0;

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

function SubjectList({ items, value, onSelect }) {
  return (
    <div className="mt-10 flex w-full max-w-sm flex-col gap-4">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item)}
          className={`truncate rounded-3xl border-[1.5px] bg-black/[0.03] px-6 py-4 text-base font-bold text-moram-navy transition ${
            value?.id === item.id ? "border-moram-navy shadow-[0_4px_10px_rgba(0,0,0,0.15)]" : "border-transparent hover:border-black/10"
          }`}
        >
          {item.filename}
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
  // 오답노트 "복습퀴즈하기" → WrongNoteOut 한 건
  const reviewNote = location.state?.reviewNote;

  const [step, setStep] = useState(reviewNote ? "questions" : "intro");
  const [settings, setSettings] = useState({ duration: "", streak: "", count: "" });
  const [documents, setDocuments] = useState(null);
  const [doc, setDoc] = useState(null);
  const [mode, setMode] = useState(reviewNote ? "review" : "");
  const [qType, setQType] = useState("");

  const [quizSet, setQuizSet] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [retrying, setRetrying] = useState(Boolean(reviewNote));
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState(
    reviewNote
      ? { id: reviewNote.quiz_question_id, question_text: reviewNote.question_text, options: reviewNote.options }
      : null
  );
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState(null);
  const [shortAnswer, setShortAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // QuizSubmitResponse
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState([]);
  const [result, setResult] = useState(null); // QuizResultOut

  const total = reviewNote ? 1 : quizSet?.total_questions ?? 0;
  const checked = feedback !== null;
  const isChoice = Array.isArray(question?.options) && question.options.length > 0;

  // 281:320 "퀴즈 학습 시작 (모션 추가)" — 잠시 보여준 뒤 자동으로 설정 단계로 이동
  useEffect(() => {
    if (step !== "intro") return undefined;
    const t = setTimeout(() => setStep("settings"), 1600);
    return () => clearTimeout(t);
  }, [step]);

  // 과목(자료) 선택 단계에 들어가면 업로드한 자료 목록을 불러온다
  useEffect(() => {
    if (step !== "subject" || documents) return;
    listDocuments()
      .then(setDocuments)
      .catch((err) => {
        setDocuments([]);
        setLoadError(getErrorMessage(err, "자료 목록을 불러오지 못했어요."));
      });
  }, [step, documents]);

  // 문제는 한 번에 한 문제씩 서버에서 받아온다
  useEffect(() => {
    if (step !== "questions" || !quizSet) return;
    let cancelled = false;
    setQuestion(null);
    setLoadError("");
    getQuestion(quizSet.id, index + QUESTION_INDEX_BASE)
      .then((q) => !cancelled && setQuestion(q))
      .catch((err) => !cancelled && setLoadError(getErrorMessage(err, "문제를 불러오지 못했어요.")));
    return () => {
      cancelled = true;
    };
  }, [step, quizSet, index]);

  const isLast = index === total - 1;
  const canCheck = isChoice ? selected !== null : shortAnswer.trim().length > 0;

  const exit = () => navigate("/dashboard");

  const startQuiz = async () => {
    if (!doc || !qType || generating) return;
    setGenerating(true);
    setLoadError("");
    try {
      const set = await generateQuiz({ document_id: doc.id, quiz_type: qType });
      setQuizSet(set);
      setIndex(0);
      setResults([]);
      setRetrying(false);
      setStep("questions");
    } catch (err) {
      setLoadError(getErrorMessage(err, "퀴즈를 만들지 못했어요."));
    } finally {
      setGenerating(false);
    }
  };

  const handleCheck = async () => {
    if (!canCheck || checked || !question || submitting) return;
    // 객관식은 선택한 보기 텍스트를 user_answer 로 보냄 (보기 번호인지 텍스트인지 명세에 없음 — 백엔드 확인 필요)
    const answer = isChoice ? selected : shortAnswer.trim();
    setSubmitting(true);
    try {
      const res = await (retrying ? retryAnswer : submitAnswer)(question.id, answer);
      setFeedback(res);
      setResults((prev) => [...prev, { id: question.id, correct: res.is_correct }]);
    } catch (err) {
      setLoadError(getErrorMessage(err, "채점에 실패했어요. 다시 시도해주세요."));
    } finally {
      setSubmitting(false);
    }
  };

  const showResult = async () => {
    setStep("result");
    if (!quizSet) return;
    try {
      setResult(await getQuizResult(quizSet.id));
    } catch {
      setResult(null); // 실패 시 로컬 채점 결과로 표시
    }
  };

  const handleNext = () => {
    setSelected(null);
    setShortAnswer("");
    setFeedback(null);
    setLoadError("");
    if (isLast) showResult();
    else setIndex((i) => i + 1);
  };

  // 다시 풀기: 같은 문제들을 retry API로 다시 제출
  const resetQuiz = () => {
    setIndex(0);
    setResults([]);
    setResult(null);
    setSelected(null);
    setShortAnswer("");
    setFeedback(null);
    setRetrying(true);
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

  /* ---------------- 281:461 / 281:522 과목(자료) 선택 ---------------- */
  if (step === "subject") {
    return (
      <QuizChrome onExit={exit} title="무엇을 공부할까요?" subtitle="자료실에 업로드한 자료로 문제를 만들어요.">
        {documents === null && <p className="mt-10 text-sm text-black/40">불러오는 중...</p>}
        {loadError && <p className="mt-6 text-sm text-red-500">{loadError}</p>}
        {documents?.length === 0 && !loadError && (
          <p className="mt-10 text-sm text-black/50">
            아직 업로드한 자료가 없어요.{" "}
            <Link to="/library" className="font-semibold text-moram-blue hover:underline">
              자료실에서 업로드하기
            </Link>
          </p>
        )}
        {documents?.length > 0 && <SubjectList items={documents} value={doc} onSelect={setDoc} />}
        {doc && (
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
            // 퀴즈 생성 API가 quiz_type 을 필수로 받아서 모든 방식에서 문제 유형을 고르게 함
            onClick={() => setStep("type")}
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
        {loadError && <p className="mt-6 text-sm text-red-500">{loadError}</p>}
        {qType && (
          <button
            type="button"
            onClick={startQuiz}
            disabled={generating}
            className="mt-14 w-full max-w-sm rounded-full bg-gradient-to-r from-[#06275a] to-[#0d53c0] py-4 text-base font-medium text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {generating ? "문제를 만드는 중..." : "학습 시작"}
          </button>
        )}
      </QuizChrome>
    );
  }

  /* ---------------- 280:357 결과 화면 ---------------- */
  if (step === "result") {
    const localCorrect = results.filter((r) => r.correct).length;
    const resultTotal = result?.total_questions ?? total;
    const correctCount = result?.correct_count ?? localCorrect;
    const wrongCount = Math.max(resultTotal - correctCount, 0);
    const percent = result?.score ?? (resultTotal ? Math.round((correctCount / resultTotal) * 100) : 0);
    const message = percent >= 80 ? "정말 잘했어요!" : percent >= 50 ? "좋은 시작이에요!" : "다음엔 더 잘해봐요!";

    return (
      <QuizChrome onExit={exit}>
        <div className="relative mt-6 grid place-items-center">
          <ScoreRing percent={percent} />
          <span className="absolute text-4xl font-bold text-black">{percent}%</span>
        </div>
        <h2 className="mt-8 text-2xl font-bold text-black">{message}</h2>
        <p className="mt-2 text-base font-semibold text-moram-navy">
          총 {resultTotal}문제 중 <span className="text-[#0d53c0]">{correctCount}문제</span> 정답
        </p>
        {result?.coins_awarded > 0 && (
          <p className="mt-1 text-sm font-semibold text-amber-600">코인 {result.coins_awarded}개를 받았어요!</p>
        )}

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
          {!reviewNote && (
            <button
              type="button"
              onClick={resetQuiz}
              className="rounded-full bg-gradient-to-r from-[#06275a] to-[#0d53c0] py-4 text-base font-bold text-white transition hover:brightness-110"
            >
              다시 풀기
            </button>
          )}
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
      <QuizChrome onExit={exit} title={loadError ? "문제를 준비하지 못했어요" : "문제를 불러오는 중..."}>
        {loadError && (
          <>
            <p className="mt-6 text-sm text-black/50">{loadError}</p>
            <button
              type="button"
              onClick={exit}
              className="mt-8 rounded-full bg-gradient-to-r from-[#06275a] to-[#0d53c0] px-8 py-3 text-sm font-bold text-white"
            >
              대시보드로
            </button>
          </>
        )}
      </QuizChrome>
    );
  }

  const progress = total ? ((index + (checked ? 1 : 0)) / total) * 100 : 0;
  const correctAnswer = feedback?.correct_answer;

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center gap-4 px-6 py-6 sm:px-10">
        <img src={moramMark} alt="moram" className="h-6" />
        <span className="text-lg font-medium text-moram-navy">
          {index + 1}/{total}
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
          <span className="max-w-[240px] truncate rounded-full bg-[#d2dbec]/70 px-4 py-2 text-sm text-moram-navy">
            {reviewNote ? "오답 복습" : doc?.filename}
          </span>
          <span className="rounded-full bg-[#0d53c0] px-4 py-2 text-sm text-white">{isChoice ? "객관식" : "주관식"}</span>
        </div>

        <h1 className="mt-8 text-center text-2xl font-semibold text-black sm:text-3xl">{question.question_text}</h1>

        {isChoice ? (
          <div className="mt-8 flex w-full flex-col gap-4">
            {question.options.map((opt, i) => {
              const isSelected = selected === opt;
              const showCorrect = checked && opt === correctAnswer;
              const showWrong = checked && isSelected && !feedback.is_correct;
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
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className={`flex items-center gap-2 text-sm font-semibold ${feedback.is_correct ? "text-emerald-600" : "text-red-600"}`}>
              {!feedback.is_correct && <XCircle className="h-4 w-4" />}
              {feedback.is_correct ? "정답이에요!" : `오답이에요. 정답은 "${correctAnswer}" 입니다.`}
            </p>
            {feedback.explanation && <p className="text-center text-sm text-black/60">{feedback.explanation}</p>}
          </div>
        )}
        {loadError && <p className="mt-4 text-sm text-red-500">{loadError}</p>}

        <button
          type="button"
          onClick={checked ? handleNext : handleCheck}
          disabled={!checked && (!canCheck || submitting)}
          className="mt-10 w-full rounded-3xl bg-[#d2dbec]/60 py-5 text-center font-medium text-moram-navy transition disabled:opacity-60 enabled:bg-moram-blue enabled:text-white"
        >
          {checked ? (isLast ? "결과 보기" : "다음 문제") : submitting ? "채점 중..." : "정답 확인"}
        </button>
      </main>
    </div>
  );
}
