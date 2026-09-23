import React from "react";

/**
 * The "옹이표정" reference sheet showed three mascot face states used
 * around the app: happy (default, task completed), sad (nothing done
 * yet / overdue), and coin (just earned coins). This renders just the
 * face (eyes + mouth) so it can be dropped onto any mascot body.
 */
export default function MascotFace({ expression = "happy", className = "h-6 w-10" }) {
  const stroke = "currentColor";

  return (
    <svg viewBox="0 0 100 40" className={className} aria-hidden="true">
      {expression === "coin" ? (
        <>
          <circle cx="35" cy="12" r="4" fill={stroke} />
          <circle cx="65" cy="12" r="4" fill={stroke} />
          <path d="M42 24 Q50 30 58 24" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      ) : expression === "sad" ? (
        <>
          <path d="M28 16 Q35 8 42 16" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M58 16 Q65 8 72 16" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M42 28 L50 22 L58 28" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M28 14 Q35 8 42 14" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M58 14 Q65 8 72 14" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M40 24 Q50 32 60 24" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
