import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function PreferenceSelect({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div>
      <h3 className="text-lg font-extrabold text-black">{label}</h3>
      <div className="mt-2 rounded-3xl bg-gray-100">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2 px-5 py-4 text-left"
        >
          <ChevronDown className={`h-4 w-4 text-moram-navy transition-transform ${open ? "rotate-180" : ""}`} />
          <span className={selected ? "font-bold text-black" : "text-gray-400"}>
            {selected ? selected.label : "(선택)"}
          </span>
        </button>

        {open && (
          <div className="flex flex-col gap-1 px-5 pb-4">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-left hover:bg-white"
              >
                <span
                  className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                    value === opt.value ? "border-moram-navy bg-moram-navy" : "border-gray-300"
                  }`}
                />
                <span className="font-bold text-black">{opt.label}</span>
                <span className="text-sm text-gray-400">{opt.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
