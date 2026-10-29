export const courses = [
  { id: 'photo', name: '사진 1', teacher: '담당 교수 A', semester: '2026-2', room: '예405' },
  { id: 'design', name: '디지털 디자인', teacher: '담당 교수 B', semester: '2026-2', room: '예224' },
  { id: 'writing', name: '성찰과 표현', teacher: '담당 교수 C', semester: '2026-2', room: '인101' },
  { id: 'citizen', name: '세계와 시민', teacher: '담당 교수 D', semester: '2026-2', room: '인203' },
  { id: 'values', name: '인간의 가치 탐색', teacher: '담당 교수 E', semester: '2026-1', room: '인204' },
  { id: 'english', name: '대학 영어', teacher: '담당 교수 F', semester: '2026-1', room: '인305' },
  { id: 'math', name: '미적분', teacher: '담당 교수 G', semester: '2026-1', room: '과101' },
]

export const questions = [
  ['citizen-1', 'citizen', '임진왜란이 발생한 연도는?', ['1592', '1600', '1910', '1945'], '1592', '임진왜란은 1592년에 시작되어 1598년까지 이어졌습니다.', ['1592년']],
  ['citizen-2', 'citizen', '민주주의의 기본 원리 중 국가의 주권이 국민에게 있다는 원리는?', ['국민 주권', '신분제', '왕권신수설', '세습제'], '국민 주권', '국민 주권은 국가의 의사를 결정하는 최고 권력이 국민에게 있다는 원리입니다.', ['국민주권']],
  ['citizen-3', 'citizen', '기후 변화 대응을 위한 국제 협약은?', ['파리 협정', '바르샤바 조약', '베르사유 조약', '강화도 조약'], '파리 협정', '파리 협정은 지구 평균 기온 상승을 제한하기 위한 국제적 기후 협약입니다.', ['파리협정']],
  ['citizen-4', 'citizen', '세계인권선언이 채택된 연도는?', ['1948', '1900', '1960', '2000'], '1948', '유엔 총회는 1948년 세계인권선언을 채택했습니다.', ['1948년']],
  ['photo-1', 'photo', '카메라로 들어오는 빛의 양을 조절하는 장치는?', ['조리개', '삼각대', '렌즈 캡', '메모리 카드'], '조리개', '조리개는 렌즈의 구멍 크기를 바꾸어 빛의 양과 피사계 심도에 영향을 줍니다.'],
  ['photo-2', 'photo', '움직임을 멈춘 듯 촬영하려면 어떤 셔터 속도가 적절한가요?', ['빠른 셔터 속도', '느린 셔터 속도', '노출 시간 무제한', '속도와 무관'], '빠른 셔터 속도', '빠른 셔터 속도는 피사체가 움직이는 동안의 노출 시간을 줄여 흔들림을 억제합니다.'],
  ['design-1', 'design', '화면의 가독성을 높이는 방법은?', ['정보의 위계 설정', '모든 글자 크기 통일', '대비 제거', '여백 제거'], '정보의 위계 설정', '정보의 중요도에 따른 크기와 간격은 내용을 빠르게 이해하는 데 도움이 됩니다.'],
  ['design-2', 'design', '인접한 요소를 하나의 집단으로 인식하는 원리는?', ['근접성', '원근법', '확산', '잔상'], '근접성', '근접성의 원리는 가까이 있는 요소를 서로 관련된 집단으로 인식하는 경향입니다.'],
  ['writing-1', 'writing', '논증에서 자신의 주장을 뒷받침하는 것은?', ['근거', '제목만', '글자 수', '글꼴'], '근거', '주장은 적절한 사실과 사례 등의 근거로 뒷받침되어야 합니다.'],
  ['writing-2', 'writing', '다른 사람의 글을 인용할 때 명시해야 하는 것은?', ['출처', '기기 이름', '화면 크기', '파일 색상'], '출처', '인용한 내용의 저자와 자료 등 출처를 밝혀야 합니다.'],
  ['values-1', 'values', '다른 사람의 관점과 감정을 이해하려는 태도는?', ['공감', '배제', '무관심', '단정'], '공감', '공감은 다른 사람의 입장과 감정을 이해하려는 태도입니다.'],
  ['values-2', 'values', '서로 다른 가치관을 논의할 때 필요한 태도는?', ['존중', '비난', '강요', '회피'], '존중', '존중하는 대화는 서로의 가치관을 이해하고 차이를 탐색하게 합니다.'],
  ['english-1', 'english', 'learn의 과거형은?', ['learned', 'learning', 'learns', 'learner'], 'learned', 'learn의 과거형으로 learned 또는 learnt를 사용할 수 있습니다.', ['learnt']],
  ['english-2', 'english', 'study의 의미는?', ['공부하다', '달리다', '잠들다', '닫다'], '공부하다', 'study는 공부하거나 연구한다는 뜻입니다.', ['공부']],
  ['math-1', 'math', 'x²을 x에 대해 미분하면?', ['2x', 'x', 'x³', '0'], '2x', '거듭제곱 함수의 미분법에 따라 x²의 도함수는 2x입니다.'],
  ['math-2', 'math', '상수 함수의 도함수는?', ['0', '1', 'x', '상수의 제곱'], '0', '상수 함수는 x에 관계없이 값이 일정하므로 변화율은 0입니다.'],
].map(([id, courseId, prompt, choices, answer, explanation, aliases = []]) => ({ id, courseId, prompt, choices, answer, explanation, aliases }))

export const questionById = Object.fromEntries(questions.map(q => [q.id, q]))
export const courseById = Object.fromEntries(courses.map(course => [course.id, course]))
export function normalizeAnswer(value) { return String(value).normalize('NFKC').toLowerCase().replace(/\s/g, '').trim() }
export function isCorrectAnswer(question, answer) { return [question.answer, ...question.aliases].some(value => normalizeAnswer(value) === normalizeAnswer(answer)) }

export function makeSession(config, wrongAnswers = []) {
  const pool = config.mode === 'review'
    ? wrongAnswers.filter(record => !record.resolved && (!config.courseId || questionById[record.questionId]?.courseId === config.courseId)).map(record => questionById[record.questionId]).filter(Boolean)
    : questions.filter(q => q.courseId === config.courseId)
  const count = Math.min(config.mode === 'quick' ? 3 : Number(config.count) || 10, 30)
  const questionIds = config.questionIds || (config.mode === 'review' ? pool.map(q => q.id) : Array.from({ length: Math.max(1, count) }, (_, i) => pool[i % pool.length]?.id).filter(Boolean))
  return { ...config, id: crypto.randomUUID(), questionIds, answers: [], currentIndex: 0, status: 'active', createdAt: Date.now() }
}
