import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackgroundBlobs from "../components/BackgroundBlobs";
import MascotBadge from "../components/MascotBadge";
import moramMark from "../assets/login/moram-mark.svg";
import birdFace from "../assets/login/bird-face.svg";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20.4H24v7.2h11.3C33.6 32 29.2 34.8 24 34.8c-6 0-10.8-4.9-10.8-10.8S18 13.2 24 13.2c2.7 0 5.2 1 7.1 2.7l5.1-5.1C33 7.7 28.7 6 24 6 13.5 6 5 14.5 5 25s8.5 19 19 19 19-8.5 19-19c0-1.2-.1-2.4-.4-3.5Z"
      />
      <path
        fill="#FF3D00"
        d="m6.9 14.7 5.9 4.3C14.4 15.6 18.9 13.2 24 13.2c2.7 0 5.2 1 7.1 2.7l5.1-5.1C33 7.7 28.7 6 24 6c-7.7 0-14.3 4.3-17.1 10.7Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c4.6 0 8.8-1.6 12-4.6l-5.6-4.6c-2 1.4-4.5 2.3-7.4 2.3-5.2 0-9.6-2.8-11.3-7.4l-5.9 4.5C8.6 39.9 15.7 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.4-2.4 4.4-4.5 5.8l5.6 4.6C40.5 35.3 43 30.6 43 25c0-1.2-.1-2.4-.4-3.5Z"
      />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      // TODO: 실제 로그인 API 연동
      await new Promise((r) => setTimeout(r, 500));
      navigate("/dashboard");
    } catch {
      setError("로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: 실제 Google OAuth 연동
    console.log("Google 로그인 시작");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <BackgroundBlobs />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link to="/" className="flex items-center gap-2">
          <img src={moramMark} alt="moram" className="h-6" />
        </Link>
        <p className="text-sm text-gray-400">
          계정이 없으신가요?{" "}
          <Link to="/signup" className="font-semibold text-moram-blue/70">
            회원가입
          </Link>
        </p>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-6 pb-16 pt-6 sm:pt-10">
        <MascotBadge iconSrc={birdFace} className="h-[90px] w-28" />

        <h1 className="mt-6 text-3xl font-extrabold text-black">환영합니다</h1>
        <p className="mt-2 text-center text-gray-400">모람과 함께 더 스마트한 학습을 시작하세요.</p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <GoogleIcon />
          Google로 계속하기
        </button>

        <form onSubmit={handleSubmit} className="mt-6 w-full" noValidate>
          <label htmlFor="username" className="block text-sm font-bold text-black">
            아이디
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="studentkijul"
            value={form.username}
            onChange={handleChange("username")}
            className="mt-2 w-full rounded-2xl bg-[#D2DBEC]/50 px-4 py-4 text-gray-700 placeholder:text-gray-400 outline-none ring-moram-blue/40 focus:ring-2"
          />

          <div className="mt-5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-semibold text-black">
              비밀번호
            </label>
            <Link to="/find-password" className="text-sm font-semibold text-moram-blue">
              비밀번호 찾기
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호를 입력하세요."
            value={form.password}
            onChange={handleChange("password")}
            className="mt-2 w-full rounded-2xl bg-[#D2DBEC]/50 px-4 py-4 text-gray-700 placeholder:text-gray-400 outline-none ring-moram-blue/40 focus:ring-2"
          />

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-moram-navy to-moram-blue py-4 text-sm font-bold text-white transition disabled:opacity-60"
          >
            {submitting ? "로그인 중..." : "로그인 하기"}
          </button>
        </form>

        <Link to="/signup" className="mt-4 text-sm font-semibold text-moram-blue">
          회원가입
        </Link>

        <p className="mt-10 text-center text-xs text-gray-300">
          로그인 시 <span className="text-moram-blue">이용약관</span> 및{" "}
          <span className="text-moram-blue">개인정보 처리방침</span>에 동의합니다.
        </p>
      </main>
    </div>
  );
}
