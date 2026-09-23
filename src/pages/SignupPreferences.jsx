import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackgroundBlobs from "../components/BackgroundBlobs";
import StepIndicator from "../components/StepIndicator";
import PreferenceSelect from "../components/PreferenceSelect";
import moramMark from "../assets/signup/moram-mark.svg";
import stepInfoIcon from "../assets/signup/step1-info.svg";
import stepDoneIcon from "../assets/signup/step2-done.svg";

const TIME_MANAGEMENT_OPTIONS = [
  { value: "steady", label: "꾸준형", desc: "매일 조금씩 공부" },
  { value: "focused", label: "집중형", desc: "한 번에 오래 집중해서 공부" },
  { value: "cram", label: "벼락치기형", desc: "시험 직전에 몰아서 공부" },
];

const STUDY_STYLE_OPTIONS = [
  { value: "understanding", label: "이해형", desc: "개념과 원리를 이해하며 공부" },
  { value: "memorizing", label: "암기형", desc: "반복해서 외우며 공부" },
  { value: "practice", label: "문제풀이형", desc: "문제를 풀면서 익히는 방식" },
  { value: "organizing", label: "정리형", desc: "필기·노트·요약으로 정리하며 공부" },
];

export default function SignupPreferences() {
  const navigate = useNavigate();
  const [timeManagement, setTimeManagement] = useState(null);
  const [studyStyle, setStudyStyle] = useState(null);

  const handleNext = (e) => {
    e.preventDefault();
    // 둘 다 (선택) 항목이라 값이 없어도 다음 단계로 진행합니다.
    navigate("/signup/complete");
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

        <form onSubmit={handleNext} className="flex flex-col gap-10">
          <PreferenceSelect
            label="시간 관리 방식"
            options={TIME_MANAGEMENT_OPTIONS}
            value={timeManagement}
            onChange={setTimeManagement}
          />
          <PreferenceSelect
            label="학습 방식"
            options={STUDY_STYLE_OPTIONS}
            value={studyStyle}
            onChange={setStudyStyle}
          />

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
