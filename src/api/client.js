import axios from "axios";

const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

// 로그인/회원가입 요청의 401은 "비밀번호 틀림" 등이므로 리다이렉트하지 않는다.
const NO_REDIRECT_PATHS = ["/api/auth/login", "/api/auth/signup"];

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) ?? null;
  } catch {
    return null;
  }
}

/** TokenOut({ access_token, token_type, user }) 을 저장 */
export function saveSession({ access_token, user }) {
  localStorage.setItem(TOKEN_KEY, access_token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    if (status === 401 && !NO_REDIRECT_PATHS.some((p) => url.startsWith(p))) {
      clearSession();
      if (window.location.pathname !== "/login") window.location.assign("/login");
    }
    return Promise.reject(error);
  }
);

/**
 * FastAPI 에러 응답에서 사용자에게 보여줄 메시지를 뽑는다.
 * - 422: { detail: [{ msg, loc, ... }] }  (명세에 있음)
 * - 그 외: { detail: "..." } 로 가정 (명세에 없음 — 백엔드 확인 필요)
 */
export function getErrorMessage(error, fallback = "요청에 실패했습니다. 다시 시도해주세요.") {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  if (!error?.response) return "서버에 연결할 수 없습니다.";
  return fallback;
}

export default client;
