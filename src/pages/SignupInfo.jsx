import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackgroundBlobs from "../components/BackgroundBlobs";
import StepIndicator from "../components/StepIndicator";
import moramMark from "../assets/signup/moram-mark.svg";
import stepInfoIcon from "../assets/signup/step1-info.svg";
import stepDoneIcon from "../assets/signup/step2-done.svg";

const MIN_PASSWORD_LENGTH = 5;

export default function SignupInfo() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nickname: "",
    password: "",
    passwordConfirm: "",
    school: "",
    department: "",
  });
  const [nicknameStatus, setNicknameStatus] = useState(null); // null | "checking" | "available" | "taken"
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (field === "nickname") setNicknameStatus(null);
  };

  const handleCheckNickname = () => {
    if (!form.nickname.trim()) return;
    setNicknameStatus("checking");
    // TODO: 실제 중복확인 API 연동
    setTimeout(() => {
      setNicknameStatus(form.nickname.trim().toLowerCase() === "admin" ? "taken" : "available");
    }, 400);
  };

  const passwordTooShort = submitted && form.password.length > 0 && form.password.length < MIN_PASSWORD_LENGTH;
  const passwordMismatch = submitted && form.passwordConfirm.length > 0 && form.password !== form.passwordConfirm;

  const isValid = useMemo(() => {
    return (
      form.nickname.trim().length > 0 &&
      nicknameStatus === "available" &&
      form.password.length >= MIN_PASSWORD_LENGTH &&
      form.password === form.passwordConfirm &&
      form.school.trim().length > 0 &&
      form.department.trim().length > 0
    );
  }, [form, nicknameStatus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (isValid) {
      // TODO: 실제 회원가입 API 연동
      navigate("/signup/preferences");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <BackgroundBlobs />

      <header className="relative z-10 px-6 py-5 sm:px-10">
        <Link to="/" className="inline-flex">
          <img src={moramMark} alt="moram" className="h-6" />
        </Link>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-4xl grid-cols-1 gap-10 px-6 pb-16 sm:grid-cols-[220px_1fr]">
        <div>
          <h1 className="text-3xl font-extrabold text-black">회원가입</h1>
          <StepIndicator current="info" iconInfo={stepInfoIcon} iconDone={stepDoneIcon} />
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="nickname" className="text-lg font-semibold text-black">
                닉네임
              </label>
              <button
                type="button"
                onClick={handleCheckNickname}
                className="rounded-2xl bg-gradient-to-r from-moram-navy to-moram-blue px-5 py-2 text-sm font-bold text-white"
              >
                중복확인
              </button>
            </div>
            <input
              id="nickname"
              type="text"
              value={form.nickname}
              onChange={handleChange("nickname")}
              className="mt-2 w-full border-b border-gray-300 py-2 text-gray-700 outline-none focus:border-moram-blue"
            />
            {nicknameStatus === "checking" && <p className="mt-1 text-xs text-gray-400">확인 중...</p>}
            {nicknameStatus === "available" && <p className="mt-1 text-xs text-emerald-600">사용 가능한 닉네임입니다.</p>}
            {nicknameStatus === "taken" && <p className="mt-1 text-xs text-red-500">이미 사용 중인 닉네임입니다.</p>}
          </div>

          <div>
            <label htmlFor="password" className="text-lg font-bold text-black">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder={`(${MIN_PASSWORD_LENGTH}자리 이상 입력해주세요)`}
              value={form.password}
              onChange={handleChange("password")}
              className="mt-2 w-full border-b border-gray-300 py-2 text-gray-700 placeholder:text-gray-300 outline-none focus:border-moram-blue"
            />
            {passwordTooShort && (
              <p className="mt-1 text-xs text-red-500">{MIN_PASSWORD_LENGTH}자리 이상 입력해주세요.</p>
            )}
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="text-lg font-bold text-black">
              비밀번호 확인
            </label>
            <input
              id="passwordConfirm"
              type="password"
              autoComplete="new-password"
              value={form.passwordConfirm}
              onChange={handleChange("passwordConfirm")}
              className="mt-2 w-full border-b border-gray-300 py-2 text-gray-700 outline-none focus:border-moram-blue"
            />
            {passwordMismatch && <p className="mt-1 text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="school" className="text-lg font-bold text-black">
                소속 학교
              </label>
              <input
                id="school"
                type="text"
                value={form.school}
                onChange={handleChange("school")}
                className="mt-2 w-full rounded-2xl bg-gray-100 px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-moram-blue/40"
              />
            </div>
            <div>
              <label htmlFor="department" className="text-lg font-bold text-black">
                학과
              </label>
              <input
                id="department"
                type="text"
                value={form.department}
                onChange={handleChange("department")}
                className="mt-2 w-full rounded-2xl bg-gray-100 px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-moram-blue/40"
              />
            </div>
          </div>

          {/* 원본 디자인에는 없지만, 폼을 실제로 제출할 방법이 필요해 추가했습니다. */}
          <button
            type="submit"
            className="mt-2 w-full rounded-2xl bg-gradient-to-r from-moram-navy to-moram-blue py-4 text-sm font-bold text-white"
          >
            다음
          </button>
        </form>
      </main>
    </div>
  );
}
