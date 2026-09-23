import React from "react";

export default function StepIndicator({ current, iconInfo, iconDone }) {
  const steps = [
    { key: "info", label: "정보입력", icon: iconInfo },
    { key: "done", label: "가입완료", icon: iconDone },
  ];

  return (
    <div className="mt-4 flex items-center gap-3">
      {steps.map((step, i) => (
        <React.Fragment key={step.key}>
          {i > 0 && <span className="pb-4 text-gray-300">···</span>}
          <div className="flex flex-col items-center gap-1">
            <img
              src={step.icon}
              alt=""
              className={`h-12 w-12 ${current === step.key ? "" : "opacity-50"}`}
            />
            <span className="text-xs text-gray-500">{step.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
