import React from "react";
import { Link } from "react-router-dom";
import styles from "./MoramHero.module.css";
import moramMark from "./assets/moram-mark.svg";

/**
 * Nav / auth links.
 * `left` is a percentage of the canvas width, taken directly from the
 * Figma frame (design width 5802px). `top` defaults to 5.162% unless overridden.
 */
const NAV_ITEMS = [
  { label: "소개", to: "/#intro", left: 17.288 },
  { label: "고객센터", to: "/support", left: 25.06 },
  { label: "자주 묻는 질문(FAQ)", to: "/faq", left: 35.695 },
  { label: "커뮤니티", to: "/community", left: 53.499 },
  { label: "로그인", to: "/login", left: 76.767, top: 5.575 },
  { label: "회원가입", to: "/signup", left: 87.504, top: 5.575 },
];

/**
 * Decorative mascot / background shapes.
 * All of these are plain ellipses in the Figma file, so they're rendered
 * as CSS circles (border-radius: 50%) instead of exported images.
 * Order matters — it matches the original Figma layer order so the
 * mascot's body / feet / eyes overlap correctly.
 */
const BLOBS = [
  // soft shadow puddle under the mascot
  { left: 17.054, top: 74.13, width: 57.099, height: 20.489, background: "#D9D9D9", opacity: 0.35, rotate: -0.75 },
  // torso
  { left: 44.169, top: 16.554, width: 25.953, height: 32.856, background: "#FFFFFF", rotate: 6.79, skew: -0.45 },
  // foot A
  { left: 49.345, top: 58.919, width: 19.444, height: 30.452, background: "#000000", rotate: -32.3, skew: 0.99 },
  // head
  { left: 30.582, top: 30.138, width: 39.79, height: 50.393, background: "#FFFFFF", rotate: 6.79, skew: -0.45 },
  // eyes
  { left: 49.724, top: 24.939, width: 2.172, height: 3.005, background: "#000000" },
  { left: 58.29, top: 28.667, width: 2.172, height: 3.005, background: "#000000" },
  // foot B (front-most)
  { left: 17.235, top: 40.667, width: 33.526, height: 47.851, background: "#000000", rotate: 138.95, skew: 1 },
  // faint background blobs, top right
  { left: 71.992, top: 67.822, width: 21.459, height: 7.135, background: "#D9D9D9", opacity: 0.25, rotate: -0.75 },
  { left: 91.521, top: 64.128, width: 12.191, height: 4.052, background: "#D9D9D9", opacity: 0.2, rotate: -0.75, flipY: true },
];

export default function MoramHero() {
  return (
    <div className={styles.canvas}>
      <div className={styles.headerBg} aria-hidden="true" />

      <img src={moramMark} alt="moram" className={styles.logo} />

      <p className={styles.watermark} aria-hidden="true">
        MORAM
      </p>

      {BLOBS.map((b, i) => (
        <span
          key={i}
          className={styles.blob}
          aria-hidden="true"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: `${b.width}%`,
            height: `${b.height}%`,
            background: b.background,
            opacity: b.opacity ?? 1,
            transform: `${b.flipY ? "scaleY(-1) " : ""}rotate(${b.rotate ?? 0}deg)${
              b.skew ? ` skewX(${b.skew}deg)` : ""
            }`,
          }}
        />
      ))}

      <nav className={styles.nav} aria-label="주요 메뉴">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={styles.navLink}
            style={{ left: `${item.left}%`, top: `${item.top ?? 5.162}%` }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
