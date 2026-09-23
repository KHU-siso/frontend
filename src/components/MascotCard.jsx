import React from "react";

/**
 * Two-circle snowman mascot ("옹이") used on the dashboard.
 * Shape percentages taken directly from the Figma frame (601:30):
 * card 1660x2448 design px, head/body/eyes/shadow positions below.
 */
export default function MascotCard({ className = "" }) {
  return (
    <div
      className={`relative aspect-[1660/2448] overflow-hidden rounded-[2rem] bg-gradient-to-b from-moram-blue to-moram-navy ${className}`}
    >
      <span className="absolute left-[2.6%] top-[2.4%] grid h-9 w-9 place-items-center rounded-lg bg-white/15 text-white">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d="M3 11L12 3l9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 10v10h14V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>

      {/* 바닥 그림자 */}
      <div
        className="absolute rounded-full bg-black/15 blur-[2px]"
        style={{ left: "28.3%", top: "85.1%", width: "43.5%", height: "9.1%" }}
      />

      {/* 몸통 */}
      <div
        className="absolute rounded-full bg-white"
        style={{ left: "10.7%", top: "38.7%", width: "78.5%", height: "50.4%" }}
      />

      {/* 머리 */}
      <div
        className="absolute rounded-full bg-white"
        style={{ left: "26.8%", top: "18.1%", width: "46.4%", height: "30.6%" }}
      />

      {/* 눈 */}
      <span className="absolute rounded-full bg-black" style={{ left: "37.05%", top: "30%", width: "4.3%", height: "3.1%" }} />
      <span className="absolute rounded-full bg-black" style={{ left: "57.2%", top: "30%", width: "4.3%", height: "3.1%" }} />
    </div>
  );
}
