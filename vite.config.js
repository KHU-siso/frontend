import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // VITE_API_BASE_URL 을 비워두면 axios가 상대경로(/api/...)로 요청 → 이 프록시가 백엔드로 전달.
    // 백엔드 CORS 설정 전까지 로컬에서 CORS 에러를 우회하는 용도.
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true },
      "/health": { target: "http://localhost:8000", changeOrigin: true },
    },
  },
});
