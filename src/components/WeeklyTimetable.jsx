import React, { useState } from "react";
import { Plus } from "lucide-react";
import AddScheduleModal from "./AddScheduleModal";
import { createSubject, DAYS_OF_WEEK } from "../api/subjects";
import { getErrorMessage } from "../api/client";

const DAYS = [
  { label: "일", date: "6일" },
  { label: "월", date: "7일" },
  { label: "화", date: "8일" },
  { label: "수", date: "9일" },
  { label: "목", date: "10일" },
  { label: "금", date: "11일" },
  { label: "토", date: "12일" },
];

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

// 블록 색상은 API(SubjectOut)에 없는 값이라 프론트에서만 관리 (새로고침 시 기본 팔레트로 돌아감)
const PALETTE = ["#ffa3a3", "#b3e4a7", "#bb99e2", "#ffd000", "#7dd3fc", "#c7b3ea"];

const toHour = (time, round) => {
  const [h, m] = time.split(":").map(Number);
  return round === "up" && m > 0 ? h + 1 : h;
};
const pad = (n) => String(n).padStart(2, "0");

// SubjectOut → 블록. dayIndex: 0=일 ... 6=토. start/end are hours (24h).
const toBlock = (subject, color) => ({
  id: subject.id,
  day: DAYS.findIndex((d) => subject.day_of_week.startsWith(d.label)),
  start: toHour(subject.start_time),
  end: toHour(subject.end_time, "up"),
  label: subject.is_canceled_this_week ? `${subject.name} (휴강)` : subject.name,
  color: subject.is_canceled_this_week ? "#e5e7eb" : color,
});

export default function WeeklyTimetable({ subjects = [], onSubjectCreated }) {
  const [view, setView] = useState("주");
  const [colors, setColors] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  const blocks = subjects.map((s, i) => toBlock(s, colors[s.id] ?? PALETTE[i % PALETTE.length]));

  const handleAdd = async (newBlock) => {
    try {
      const created = await createSubject({
        name: newBlock.label,
        // 모달의 요일 인덱스(0=일) → SubjectCreate.day_of_week("월요일" ...)
        day_of_week: DAYS_OF_WEEK[(newBlock.day + 6) % 7],
        start_time: `${pad(newBlock.start)}:00:00`,
        end_time: `${pad(newBlock.end)}:00:00`,
      });
      setColors((prev) => ({ ...prev, [created.id]: newBlock.color }));
      onSubjectCreated?.(created);
      return true;
    } catch (err) {
      alert(getErrorMessage(err, "과목을 추가하지 못했어요."));
      return false;
    }
  };

  return (
    <div className="overflow-x-auto rounded-[2.5rem] border border-black/10 bg-white p-6 shadow-[0_4px_4px_0_#d2dbec]">
      <AddScheduleModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-2xl font-bold text-black/80">2026년 9월 2주차</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            aria-label="일정 추가"
            className="rounded-lg border border-moram-navy/30 text-moram-navy/60 hover:text-moram-navy"
          >
            <Plus className="h-5 w-5" />
          </button>
          <div className="flex gap-1 rounded-full bg-[#d2dbec]/60 p-1 text-sm">
            {["일", "월", "주"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-full px-3 py-1 font-semibold transition ${
                  view === v ? "bg-white text-moram-navy shadow-sm" : "text-moram-navy/60"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid min-w-[420px] grid-cols-[28px_repeat(7,1fr)] gap-1 text-center text-[11px]">
        <div />
        {DAYS.map((d) => (
          <div key={d.label} className="pb-2 font-black text-moram-navy">
            {d.date} ({d.label})
          </div>
        ))}

        {HOURS.map((hour) => (
          <React.Fragment key={hour}>
            <div className="pr-1 text-right font-bold text-moram-navy">{hour}</div>
            {DAYS.map((d, dayIdx) => {
              const block = blocks.find((b) => b.day === dayIdx && b.start === hour);
              if (block) {
                const span = block.end - block.start;
                return (
                  <div
                    key={d.label}
                    title={block.label}
                    className="rounded-md p-1 text-left text-[9px] font-bold leading-tight text-moram-navy"
                    style={{ gridRow: `span ${span}`, backgroundColor: block.color }}
                  >
                    {block.label}
                  </div>
                );
              }
              const covered = blocks.some((b) => b.day === dayIdx && hour > b.start && hour < b.end);
              if (covered) return null;
              return <div key={d.label} className="h-8 border-t border-gray-100" />;
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
