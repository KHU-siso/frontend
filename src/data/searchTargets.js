import { normalizedName } from './subjectStore.js'

// 상단 검색창이 찾는 고정 페이지들. keywords는 라벨과 다르게 부르는 이름이다.
export const pageTargets = [
  { to: '/dashboard', label: '홈', keywords: ['대시보드', '메인', '시간표', 'home'] },
  { to: '/study/setup', label: '퀴즈', keywords: ['학습', '문제', '시험'] },
  { to: '/wrong-answers', label: '오답노트', keywords: ['오답', '복습', '틀린'] },
  { to: '/materials', label: '자료실', keywords: ['강의자료', '강의', '자료', '과목', 'pdf'] },
  { to: '/chat', label: 'AI 채팅', keywords: ['ai', '챗', '채팅', '질문', 'chat'] },
  { to: '/shop', label: '코인샵', keywords: ['상점', '아이템', '코인', '옷장', '꾸미기'] },
  { to: '/mypage', label: '마이페이지', keywords: ['프로필', '내 정보', '계정', '학습 목표'] },
  { to: '/mypage#account-settings', label: '설정', keywords: ['알림', '비밀번호', '로그아웃', '계정 설정'] },
]

// 한글 부분 일치(공백 무시). 라벨에서 일치하면 먼저, 별칭에서만 일치하면 뒤에 둔다.
const squash = value => normalizedName(value).replace(/\s+/g, '')
export function searchTargets(query, subjects) {
  const needle = squash(query)
  if (!needle) return []
  const direct = [], alias = []
  for (const page of pageTargets) {
    if (squash(page.label).includes(needle)) direct.push({ ...page, kind: '페이지' })
    else if (page.keywords.some(word => squash(word).includes(needle))) alias.push({ ...page, kind: '페이지' })
  }
  const courses = subjects.filter(subject => squash(subject.name).includes(needle)).map(subject => ({ to: `/materials/${subject.id}`, label: subject.name, kind: '과목', detail: subject.teacher }))
  return [...direct, ...courses, ...alias]
}
