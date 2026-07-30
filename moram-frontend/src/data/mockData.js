export const dashboardStats = [
  { label: "완료한 과제", value: "4 / 7", description: "3개 남음" },
  { label: "연속 출석", value: "14일", description: "최고 기록!" },
  { label: "평균 학점", value: "3.82", description: "+0.12" },
  { label: "보유 코인", value: "1,240", description: "옹이 꾸미기" }
];

export const courses = [
  { id: 1, name: "알고리즘", progress: 78 },
  { id: 2, name: "영어 회화", progress: 62 },
  { id: 3, name: "데이터베이스", progress: 41 },
  { id: 4, name: "운영체제", progress: 55 }
];

export const assignments = [
  {
    id: 1,
    course: "알고리즘",
    title: "그래프 탐색 알고리즘 구현",
    dueAt: "2026-07-30 23:59",
    progress: 90,
    status: "마감 임박",
    description: "BFS와 DFS를 각각 구현하고 시간복잡도를 비교하세요."
  },
  {
    id: 2,
    course: "영어 회화",
    title: "학술 에세이 초안 작성",
    dueAt: "2026-08-01 18:00",
    progress: 45,
    status: "진행 중",
    description: "2,000단어 분량의 학술 에세이 초안을 작성하세요."
  },
  {
    id: 3,
    course: "데이터베이스",
    title: "ER 다이어그램 설계 및 정규화",
    dueAt: "2026-08-04 23:59",
    progress: 20,
    status: "진행 중",
    description: "서비스 요구사항을 기준으로 ERD를 작성하고 3NF까지 정규화하세요."
  },
  {
    id: 4,
    course: "운영체제",
    title: "스케줄링 알고리즘 비교",
    dueAt: "2026-08-08 23:59",
    progress: 5,
    status: "시작 전",
    description: "FCFS, SJF, Round Robin의 평균 대기 시간을 비교하세요."
  }
];

export const posts = [
  {
    id: 1,
    category: "질문",
    title: "알고리즘 중간고사 범위 정리한 사람 있나요?",
    author: "김지수",
    createdAt: "10분 전",
    views: 28,
    comments: [
      { id: 1, author: "박민준", content: "7주차까지라고 교수님이 말씀하셨어요." }
    ],
    content: "공지에는 6주차까지라고 적혀 있는데 수업에서는 7주차도 언급한 것 같아서요."
  },
  {
    id: 2,
    category: "자료",
    title: "데이터베이스 정규화 요약 노트 공유",
    author: "이서연",
    createdAt: "1시간 전",
    views: 91,
    comments: [],
    content: "1NF부터 BCNF까지 핵심만 정리한 노트입니다."
  },
  {
    id: 3,
    category: "자유",
    title: "오늘 도서관 같이 공부할 사람",
    author: "최현우",
    createdAt: "2시간 전",
    views: 47,
    comments: [],
    content: "저녁 7시부터 중앙도서관에서 공부할 예정입니다."
  }
];
