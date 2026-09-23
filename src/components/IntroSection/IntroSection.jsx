import React from "react";
import { Link } from "react-router-dom";

const BADGES = ["학생 전용 무료 플랜", "신용카드 불필요", "모든 대학교 지원"];

export default function IntroSection() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-24 text-center">
      <p
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 select-none whitespace-nowrap bg-gradient-to-r from-[#c3e9fe] to-moram-blue bg-clip-text text-[18vw] font-extrabold leading-none text-transparent opacity-60"
      >
        MORAM
      </p>

      <div className="relative mx-auto max-w-2xl">
        <h2 className="text-2xl font-extrabold text-gray-400 sm:text-3xl">
          작은 배움이 모여 커다란 성장이 되는 공간
        </h2>

        <Link
          to="/signup"
          className="mt-8 inline-block rounded-full bg-gradient-to-r from-[#06275a] to-[#0d53c0] px-10 py-4 text-lg font-extrabold text-white transition hover:brightness-110"
        >
          공부 시작하기
        </Link>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm font-extrabold text-gray-400">
          {BADGES.map((badge, i) => (
            <React.Fragment key={badge}>
              {i > 0 && <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />}
              <span>{badge}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
