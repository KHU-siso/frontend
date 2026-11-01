// AI 키 공용 상수. 채팅(SubjectChat)과 퀴즈 생성(StudySetupPage)이 같이 쓴다.
export const PROVIDERS = {
  claude: { label: 'Claude (Anthropic)', url: 'https://console.anthropic.com/settings/keys' },
  openai: { label: 'GPT (OpenAI)', url: 'https://platform.openai.com/api-keys' },
}
// 서버가 돌려주는 error_code → 쉬운 안내 문구. (서버 메시지 대신 쓰므로 키 관련 내용이 화면에 섞일 일이 없다.)
export const AI_ERRORS = {
  AI_KEY_REQUIRED: 'API 키를 입력해주세요.',
  AI_KEY_INVALID: '키를 확인해주세요. 입력한 API 키가 올바르지 않거나 만료됐어요.',
  AI_QUOTA_EXCEEDED: '사용 한도를 확인해주세요. 잔액이 부족하거나 요청 한도를 넘었어요.',
  AI_MODEL_ERROR: 'AI 모델을 사용할 수 없어요. 잠시 후 다시 시도해주세요.',
  AI_UNAVAILABLE: 'AI 응답을 일시적으로 만들 수 없어요. 잠시 후 다시 시도해주세요.',
}
export const isAiKeyError = failure => Boolean(failure?.code && AI_ERRORS[failure.code])
