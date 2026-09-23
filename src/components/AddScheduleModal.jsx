import React, { useState } from "react";
import { X } from "lucide-react";

const COLORS = [
  { id: "red", value: "#ffa3a3" },
  { id: "green", value: "#b3e4a7" },
  { id: "yellow", value: "#ffe066" },
  { id: "blue", value: "#7dd3fc" },
  { id: "purple", value: "#bb99e2" },
];

const DAY_OPTIONS = ["일", "월", "화", "수", "목", "금", "토"];
const HOUR_OPTIONS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export default function AddScheduleModal({ open, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0].value);
  const [day, setDay] = useState("월");
  const [startHour, setStartHour] = useState(9);
  const [duration, setDuration] = useState(1);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    const ok = await onAdd({
      label: name.trim(),
      color,
      day: DAY_OPTIONS.indexOf(day),
      start: startHour,
      end: startHour + duration,
    });
    setSaving(false);
    if (ok === false) return;
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between rounded-t-[2rem] bg-gradient-to-r from-moram-blue to-moram-navy px-6 py-4">
          <h2 className="text-lg font-black text-white">새 과목 추가</h2>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-white/80 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
          <div>
            <label htmlFor="schedule-name" className="text-sm font-black text-moram-navy">
              시간표 이름
            </label>
            <input
              id="schedule-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요."
              className="mt-2 w-full rounded-full bg-[#d2dbec]/60 px-5 py-3 text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          <div>
            <p className="text-sm font-black text-moram-navy">블록 색상</p>
            <div className="mt-3 flex gap-3">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.value)}
                  aria-label={c.id}
                  className={`h-9 w-9 rounded-full border-2 transition ${
                    color === c.value ? "border-moram-navy" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* Figma 디자인엔 없지만, 실제로 시간표에 추가되려면 요일/시간이 필요해서 넣었어요 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="schedule-day" className="text-xs font-bold text-moram-navy/70">
                요일
              </label>
              <select
                id="schedule-day"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="mt-1 w-full rounded-xl bg-[#d2dbec]/60 px-2 py-2 text-sm outline-none"
              >
                {DAY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}요일
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="schedule-hour" className="text-xs font-bold text-moram-navy/70">
                시작 시간
              </label>
              <select
                id="schedule-hour"
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="mt-1 w-full rounded-xl bg-[#d2dbec]/60 px-2 py-2 text-sm outline-none"
              >
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}시
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="schedule-duration" className="text-xs font-bold text-moram-navy/70">
                길이
              </label>
              <select
                id="schedule-duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="mt-1 w-full rounded-xl bg-[#d2dbec]/60 px-2 py-2 text-sm outline-none"
              >
                {[1, 2, 3].map((h) => (
                  <option key={h} value={h}>
                    {h}시간
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full bg-[#d2dbec]/60 py-3 text-sm font-bold text-moram-navy"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 disabled:opacity-60 rounded-full bg-gradient-to-r from-[#06275a] to-[#0d53c0] py-3 text-sm font-bold text-white"
            >
              {saving ? "추가 중..." : "추가하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
