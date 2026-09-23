import React from "react";

/**
 * Soft translucent background circles used on the auth-flow screens.
 * Purely decorative — kept out of the tab order.
 */
export default function BackgroundBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -bottom-24 -left-24 h-[380px] w-[380px] rounded-full bg-[#D2DBEC]/30 blur-md" />
      <div className="absolute bottom-0 left-20 h-[220px] w-[220px] rounded-full bg-[#D2DBEC]/30 blur-md" />
      <div className="absolute -top-40 -right-20 h-[460px] w-[460px] rounded-full bg-[#D2DBEC]/30 blur-md" />
    </div>
  );
}
