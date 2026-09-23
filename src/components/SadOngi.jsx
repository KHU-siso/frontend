import React from "react";

/**
 * 슬픈(녹아내리는) 옹이 — Figma 536:246 "옹이가 슬퍼하고 있어요ㅠ"
 * 머리 + 몸통(원 2개) + 녹은 웅덩이 2개 + 안경 + 감은 눈 + 세모 코.
 *
 * 좌표는 Figma 프레임 좌표를 그대로 viewBox 로 사용 (그룹 bbox: x 1987~3919, y 812~2950).
 * 컨테이너에 aspect-[1932/2138] 고정 비율을 걸어 원이 타원으로 찌그러지지 않게 함.
 */
const NAVY = "#06275a";

export default function SadOngi({ className = "" }) {
  return (
    <div className={`relative aspect-[1932/2138] ${className}`}>
      <svg viewBox="1987 812 1932 2138" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {/* 녹아내린 웅덩이 (큰 것) */}
        <ellipse cx="2953" cy="2582" rx="963" ry="227.5" fill="#fff" transform="rotate(-0.73 2953 2582)" />
        {/* 머리 */}
        <ellipse cx="2910" cy="1265" rx="505" ry="453" fill="#fff" />
        {/* 몸통 */}
        <ellipse cx="2908.5" cy="2050.5" rx="853.5" ry="747.5" fill="#fff" />
        {/* 웅덩이 (작은 것) */}
        <ellipse cx="3251.4" cy="2822" rx="513" ry="121" fill="#fff" transform="rotate(-0.73 3251.4 2822)" />

        {/* 안경 */}
        <g fill="none" stroke="#000" strokeWidth="20">
          <circle cx="2706.25" cy="1131.25" r="161.25" />
          <circle cx="3109.75" cy="1131.25" r="161.25" />
          <line x1="2867.5" y1="1131.25" x2="2948.5" y2="1131.25" />
        </g>

        {/* 감은 눈 (바깥쪽이 처진 슬픈 눈) */}
        <g stroke={NAVY} strokeWidth="16" strokeLinecap="round">
          <line x1="2652" y1="1169" x2="2759" y2="1120" />
          <line x1="3061" y1="1120" x2="3169" y2="1169" />
        </g>

        {/* 세모 코 */}
        <polygon points="2910.5,1246 2847,1316 2974,1316" fill="none" stroke={NAVY} strokeWidth="16" strokeLinejoin="miter" />
      </svg>
    </div>
  );
}
