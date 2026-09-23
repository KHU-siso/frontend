import client from "./client";

// openapi tag: quiz

/** QuizGenerateRequest.quiz_type enum (openapi.json 인코딩 깨짐 → 복원한 값, 백엔드 확인 필요) */
export const QUIZ_TYPES = ["객관식", "주관식"];

/** POST /api/quiz/generate  (Bearer) body: { document_id, quiz_type } → 201 QuizSetOut */
export const generateQuiz = ({ document_id, quiz_type }) =>
  client.post("/api/quiz/generate", { document_id, quiz_type }).then((r) => r.data);

/** GET /api/quiz/{quiz_set_id}/questions/{question_index}  (Bearer) → QuizQuestionOut */
export const getQuestion = (quizSetId, questionIndex) =>
  client.get(`/api/quiz/${quizSetId}/questions/${questionIndex}`).then((r) => r.data);

/** POST /api/quiz/questions/{question_id}/submit  (Bearer) body: { user_answer } → 201 QuizSubmitResponse */
export const submitAnswer = (questionId, user_answer) =>
  client.post(`/api/quiz/questions/${questionId}/submit`, { user_answer }).then((r) => r.data);

/** POST /api/quiz/questions/{question_id}/retry  (Bearer) body: { user_answer } → 201 QuizSubmitResponse */
export const retryAnswer = (questionId, user_answer) =>
  client.post(`/api/quiz/questions/${questionId}/retry`, { user_answer }).then((r) => r.data);

/** GET /api/quiz/{quiz_set_id}/result  (Bearer) → QuizResultOut */
export const getQuizResult = (quizSetId) => client.get(`/api/quiz/${quizSetId}/result`).then((r) => r.data);

/** GET /api/wrong-notes  (Bearer) → WrongNoteOut[] */
export const listWrongNotes = () => client.get("/api/wrong-notes").then((r) => r.data);
