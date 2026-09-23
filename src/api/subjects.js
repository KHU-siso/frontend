import client from "./client";

// openapi tag: subjects

/**
 * SubjectCreate.day_of_week enum.
 * 받은 openapi.json 의 한글 enum 이 인코딩 깨짐(UTF-8 → CP949) 상태라 바이트를 복원해서 적은 값 — 백엔드 확인 필요.
 */
export const DAYS_OF_WEEK = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];

/** GET /api/subjects  (Bearer) → SubjectOut[] */
export const listSubjects = () => client.get("/api/subjects").then((r) => r.data);

/**
 * POST /api/subjects  (Bearer) → 201 SubjectOut
 * body: SubjectCreate { name, day_of_week, start_time "HH:MM:SS", end_time,
 *                       midterm_ratio?, final_ratio?, assignment_ratio?, attendance_ratio? }
 */
export const createSubject = (subject) => client.post("/api/subjects", subject).then((r) => r.data);

/** POST /api/subjects/{subject_id}/assignments  (Bearer) body: AssignmentCreate { title, due_date "YYYY-MM-DD" } → 201 AssignmentOut */
export const createAssignment = (subjectId, { title, due_date }) =>
  client.post(`/api/subjects/${subjectId}/assignments`, { title, due_date }).then((r) => r.data);

/** PATCH /api/subjects/{subject_id}/cancel-week  (Bearer, body 없음) → SubjectOut  (이번 주 휴강 토글) */
export const toggleCancelWeek = (subjectId) =>
  client.patch(`/api/subjects/${subjectId}/cancel-week`).then((r) => r.data);
