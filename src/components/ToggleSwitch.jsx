import React from "react";

export default function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-9 w-16 shrink-0 rounded-full transition ${checked ? "bg-moram-navy" : "bg-gray-200"}`}
    >
      <span
        className={`absolute left-0 top-1 h-7 w-7 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-8" : "translate-x-1"
        }`}
      />
    </button>
  );
}
