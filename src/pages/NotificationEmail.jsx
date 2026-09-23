import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AppShell from "../components/AppShell";
import SadOngi from "../components/SadOngi";

/**
 * 알림 이메일 미리보기 — "알람UI- 이메일버전" 3개 프레임을 위→아래로 이어붙인 한 통의 메일
 *   ① 485:10  인사/요약 (재형 님, 오늘 학습할 시간이 되었어요.)
 *   ② 532:207 마감 임박 과제 · 오늘의 학습 시간 카드
 *   ③ 536:246 옹이가 슬퍼하고 있어요ㅠ (녹아내리는 옹이) + 푸터 문구
 *
 * 각 섹션은 Figma 프레임 비율(5909 x 3765)을 그대로 쓰고, 글자·여백은 cqw(컨테이너 너비 %) 단위로
 * 환산해서 화면 폭이 바뀌어도 Figma 와 같은 비율로 축소/확대되게 함. (1cqw = 59.09 design px)
 */

const cq = { containerType: "inline-size" };
const FRAME = "relative w-full overflow-hidden aspect-[5909/3765]";

function Bullet() {
  return <span className="inline-block aspect-square w-[1.354cqw] shrink-0 rounded-full bg-black" />;
}

function DocIcon() {
  // 537:292~294 — 테두리 16 / 모서리 30 인 문서 + 줄 2개 (design px → cqw)
  return (
    <span className="relative block h-[3.317cqw] w-[2.758cqw] rounded-[0.508cqw] border-[0.271cqw] border-moram-logo">
      <span className="absolute left-[0.32cqw] top-[0.54cqw] h-[0.237cqw] w-[1.574cqw] rounded-full bg-moram-logo" />
      <span className="absolute left-[0.32cqw] top-[1.12cqw] h-[0.237cqw] w-[1.015cqw] rounded-full bg-moram-logo" />
    </span>
  );
}

function ClockIcon() {
  // 536:266(링) + 536:269(시계 바늘)
  return (
    <svg viewBox="0 0 196 196" className="aspect-square w-[3.317cqw]" aria-hidden="true">
      <circle cx="98" cy="98" r="86" fill="none" stroke="#06275a" strokeWidth="22" />
      <path d="M86 58 V108 H126" fill="none" stroke="#06275a" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EmailCard({ icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex h-[11.14cqw] w-[69.74cqw] items-center rounded-[3.385cqw] border-[max(1px,0.085cqw)] border-black/20 bg-white pl-[3.03cqw] pr-[2.42cqw] shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
      <span className="grid aspect-square w-[6.77cqw] shrink-0 place-items-center rounded-full bg-[#d2dbec]/60">{icon}</span>
      <div className="ml-[2.34cqw] flex min-w-0 flex-1 flex-col gap-[0.4cqw]">
        <p className="truncate text-[2.2cqw] font-semibold text-moram-logo">{title}</p>
        <p className="text-[1.69cqw] font-semibold text-moram-blue">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="h-[4.1cqw] w-[13.6cqw] shrink-0 rounded-full bg-[#d2dbec]/60 text-[1.69cqw] font-semibold text-moram-blue transition hover:bg-[#d2dbec]"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export default function NotificationEmail() {
  const navigate = useNavigate();
  const user = "재형";
  const reviewSubject = "세계와 시민";
  const studiedToday = false; // 오늘 학습을 시작하지 않았으면 ③ 슬픈 옹이 섹션을 보여줌

  return (
    <AppShell>
      <div className="mx-auto flex max-w-[886px] flex-col gap-4 px-4 py-8">
        <Link to="/notifications" className="flex items-center gap-1 text-sm font-medium text-moram-blue hover:underline">
          <ArrowLeft className="h-4 w-4" />
          알림 목록
        </Link>

        <article className="overflow-hidden rounded-2xl border border-black/10 shadow-sm" style={cq}>
          {/* ① 485:10 인사 */}
          <section className={`${FRAME} bg-white`}>
            <span aria-hidden className="absolute left-[-4.28%] top-[-17.82%] aspect-[1537/1523] w-[26.01%] rounded-full bg-moram-blue/30" />
            <span aria-hidden className="absolute left-[15.23%] top-[-6.06%] aspect-square w-[15.33%] rounded-full bg-moram-blue/30" />
            <span aria-hidden className="absolute left-[73.38%] top-[-21.89%] aspect-square w-[27.86%] rounded-full bg-moram-blue/30" />

            <div className="absolute inset-x-0 top-[42.63%] text-center text-[3.554cqw] font-semibold leading-normal text-black">
              <p>{user} 님, 오늘 학습할 시간이 되었어요.</p>
              <p className="mt-[1.2em]">{reviewSubject}을 빨리 복습하세요!</p>
            </div>
            <p className="absolute inset-x-0 top-[73.55%] text-center text-[2.166cqw] font-semibold text-black/60">
              오늘의 학습과 과제 일정을 확인해보세요.
            </p>
          </section>

          {/* ② 532:207 과제 · 학습 시간 */}
          <section className="flex flex-col items-center bg-white pb-[14.52cqw] pt-[10.97cqw]">
            <div className="w-[69.74cqw]">
              <h2 className="flex items-center gap-[1.5cqw] pl-[1.05cqw] text-[3.385cqw] font-semibold text-black">
                <Bullet />
                마감이 얼마 남지 않은 과제
              </h2>
              <div className="mt-[1.84cqw]">
                <EmailCard
                  icon={<DocIcon />}
                  title="글로벌 시민의 권리와 의무 에세이 과제"
                  subtitle="마감까지 2일 남았어요"
                  actionLabel="과제 확인하기"
                  onAction={() => navigate("/library")}
                />
              </div>

              <h2 className="mt-[4.72cqw] flex items-center gap-[1.5cqw] pl-[1.05cqw] text-[3.385cqw] font-semibold text-black">
                <Bullet />
                오늘의 학습 시간
              </h2>
              <div className="mt-[1.84cqw]">
                <EmailCard
                  icon={<ClockIcon />}
                  title="아직 오늘 학습을 시작하지 않았어요."
                  subtitle="지금 딱 30분만 집중해볼까요?"
                  actionLabel="학습 시작하기"
                  onAction={() => navigate("/quiz")}
                />
              </div>
            </div>
          </section>

          {/* ③ 536:246 슬픈 옹이 + 푸터 */}
          {!studiedToday && (
            <section className={`${FRAME} bg-[linear-gradient(to_bottom,#fff_0%,#d2dbec_34.615%)]`}>
              <div className="absolute inset-x-0 bottom-0 top-[72.72%] bg-[#e0e6f2]" />
              <p className="absolute inset-x-0 top-[9.59%] text-center text-[3.385cqw] font-semibold text-moram-logo">
                옹이가 슬퍼하고 있어요ㅠ
              </p>
              <SadOngi className="!absolute left-[33.63%] top-[21.57%] w-[32.7%]" />
              <svg viewBox="0 0 280 134" className="absolute left-[47.6%] top-[84.57%] w-[4.74%]" aria-hidden="true">
                <path d="M0 4 C70 0 138 34 138 134 C58 128 4 88 0 4 Z" fill="#86b179" />
                <path d="M280 4 C210 0 142 34 142 134 C222 128 276 88 280 4 Z" fill="#86b179" />
              </svg>
              <p className="absolute inset-x-0 top-[91.31%] text-center text-[2.166cqw] font-semibold text-moram-blue">
                조금씩 꾸준하게, MORAM과 함께해요.
              </p>
            </section>
          )}
        </article>
      </div>
    </AppShell>
  );
}
