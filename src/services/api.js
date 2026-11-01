const TOKEN_KEY = 'siso.accessToken'

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

export function setToken(token) {
  try { localStorage.setItem(TOKEN_KEY, token) } catch { /* storage unavailable */ }
}

export function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY) } catch { /* storage unavailable */ }
}

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

export const AUTH_EXPIRED_EVENT = 'moram:auth-expired'

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiFetch(path, { method = 'GET', body, keepalive = false, headers: extraHeaders } = {}) {
  const headers = { ...authHeaders(), ...extraHeaders }
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json'
  let response
  try {
    response = await fetch(path, { method, headers, keepalive, body: body === undefined ? undefined : isForm ? body : JSON.stringify(body) })
  } catch {
    throw new ApiError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.', 0)
  }
  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (response.status === 401 && getToken() && !path.startsWith('/api/auth/login')) {
    clearToken()
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
  }
  if (!response.ok) throw new ApiError(typeof data?.detail === 'string' ? data.detail : '요청을 처리할 수 없습니다.', response.status, typeof data?.error_code === 'string' ? data.error_code : undefined)
  return data
}

export async function login(email, password) {
  const data = await apiFetch('/api/auth/login', { method: 'POST', body: { email, password } })
  setToken(data.access_token)
  return data.user
}

export async function sendCode(email) {
  await apiFetch('/api/auth/email/send-code', { method: 'POST', body: { email } })
}

export async function verifyCode(email, code) {
  await apiFetch('/api/auth/email/verify-code', { method: 'POST', body: { email, code } })
}

export async function signup(email, password, nickname) {
  const data = await apiFetch('/api/auth/signup', { method: 'POST', body: { email, password, nickname } })
  setToken(data.access_token)
  return data.user
}

export async function checkNickname(nickname) {
  const data = await apiFetch(`/api/auth/nickname/check?nickname=${encodeURIComponent(nickname)}`)
  return data.available
}

export async function fetchBlob(path) {
  const response = await fetch(path, { headers: authHeaders() })
  if (!response.ok) throw new ApiError('파일을 불러오지 못했습니다.', response.status)
  return response.blob()
}

// 사용자 정보 / 상태
export const getMe = () => apiFetch('/api/auth/me')
export const updateMe = nickname => apiFetch('/api/auth/me', { method: 'PATCH', body: { nickname } })
export const setDeadlineEmail = enabled => apiFetch('/api/auth/me/notification-settings', { method: 'PATCH', body: { deadline_email_enabled: enabled } })
export const changePassword = (current_password, new_password) => apiFetch('/api/auth/password', { method: 'POST', body: { current_password, new_password } })
export const getState = async key => (await apiFetch(`/api/state/${key}`)).data
export const putState = (key, data, options) => apiFetch(`/api/state/${key}`, { method: 'PUT', body: { data }, ...options })

// 자료(PDF)
export const listDocuments = () => apiFetch('/api/documents')
export function uploadDocument(file, subjectRef) {
  const form = new FormData()
  form.append('file', file)
  if (subjectRef) form.append('subject_ref', subjectRef)
  return apiFetch('/api/documents/upload', { method: 'POST', body: form })
}
export const deleteDocument = id => apiFetch(`/api/documents/${id}`, { method: 'DELETE' })
export const documentFile = id => fetchBlob(`/api/documents/${id}/file`)

// 퀴즈
export const generateQuiz = (document_id, quiz_type) => apiFetch('/api/quiz/generate', { method: 'POST', body: { document_id, quiz_type } })
export const getQuestion = (setId, index) => apiFetch(`/api/quiz/${setId}/questions/${index}`)
export const submitAnswer = (questionId, user_answer) => apiFetch(`/api/quiz/questions/${questionId}/submit`, { method: 'POST', body: { user_answer } })
export const retryAnswer = (questionId, user_answer) => apiFetch(`/api/quiz/questions/${questionId}/retry`, { method: 'POST', body: { user_answer } })
export const getQuizResult = setId => apiFetch(`/api/quiz/${setId}/result`)
export const listWrongNotes = subjectRef => apiFetch(subjectRef ? `/api/wrong-notes?subject_ref=${encodeURIComponent(subjectRef)}` : '/api/wrong-notes')

// 채팅
export const listConversations = () => apiFetch('/api/chat/conversations')
export const createConversation = (document_id, title) => apiFetch('/api/chat/conversations', { method: 'POST', body: { document_id: document_id ?? null, title: title ?? null } })
export const listSubjectChats = () => apiFetch('/api/chat/subjects')
export const openSubjectChat = (subjectId, title) => apiFetch(`/api/chat/subjects/${encodeURIComponent(subjectId)}/conversation`, { method: 'POST', body: { title } })
export const deleteSubjectChat = subjectId => apiFetch(`/api/chat/subjects/${encodeURIComponent(subjectId)}`, { method: 'DELETE' })
export const listMessages = id => apiFetch(`/api/chat/conversations/${id}/messages`)
// 사용자 본인의 AI API 키: 이 브라우저(localStorage)에만 저장하고, 채팅 요청 헤더로만 보낸다. (본문·쿼리·콘솔·에러 메시지에는 넣지 않는다.)
const AI_KEY_STORAGE = 'siso.aiKey'
export function getAiKey() {
  try {
    const saved = JSON.parse(localStorage.getItem(AI_KEY_STORAGE) || 'null')
    return saved && (saved.provider === 'claude' || saved.provider === 'openai') && typeof saved.key === 'string' && saved.key ? saved : null
  } catch { return null }
}
export function saveAiKey(provider, key) {
  try { localStorage.setItem(AI_KEY_STORAGE, JSON.stringify({ provider, key })); return true } catch { return false }
}
export function clearAiKey() {
  try { localStorage.removeItem(AI_KEY_STORAGE) } catch { /* storage unavailable */ }
}
export function sendMessage(id, content) {
  const saved = getAiKey()
  const headers = saved ? { 'X-AI-Provider': saved.provider, 'X-AI-Key': saved.key } : undefined
  return apiFetch(`/api/chat/conversations/${id}/messages`, { method: 'POST', body: { content }, headers })
}

// 코인샵
export const getShop = () => apiFetch('/api/shop')
export const buyItem = item_id => apiFetch('/api/shop/buy', { method: 'POST', body: { item_id } })
export const saveEquipment = equipped_items => apiFetch('/api/shop/equipment', { method: 'PUT', body: { equipped_items } })
