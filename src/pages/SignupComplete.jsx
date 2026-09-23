import React from "react";
import { Link } from "react-router-dom";
import BackgroundBlobs from "../components/BackgroundBlobs";
import moramMark from "../assets/signup-complete/moram-mark.svg";
import checkBadge from "../assets/signup-complete/check-badge.svg";

export default function SignupComplete() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <BackgroundBlobs />

      <header className="relative z-10 px-6 py-5 sm:px-10">
        <Link to="/" className="inline-flex">
          <img src={moramMark} alt="moram" className="h-6" />
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-6 text-center">
        <img src={checkBadge} alt="" className="h-32 w-32" />
        <h1 className="mt-8 text-3xl font-extrabold text-black">가입완료</h1>

        {/* 원본 디자인에는 없지만, 다음 동작으로 이어질 버튼이 필요해 추가했습니다. */}
        <Link
          to="/login"
          className="mt-10 w-full rounded-2xl bg-gradient-to-r from-moram-navy to-moram-blue py-4 text-sm font-bold text-white"
        >
          로그인하러 가기
        </Link>
      </main>
    </div>
  );
}
