import React from "react";

/**
 * Small circular gradient badge with the moram mascot face — used above
 * headlines on auth-flow screens (login, signup, etc).
 */
export default function MascotBadge({ iconSrc, className = "w-28 h-[90px]" }) {
  return (
    <div className={`relative ${className}`}>
      <img src={iconSrc} alt="" className="absolute inset-0 h-full w-full object-contain" />
      <span
        className="absolute rounded-full bg-black"
        style={{ left: "38.12%", top: "46.27%", width: "4.315%", height: "5.373%" }}
      />
      <span
        className="absolute rounded-full bg-black"
        style={{ left: "56.58%", top: "46.27%", width: "4.315%", height: "5.373%" }}
      />
    </div>
  );
}
