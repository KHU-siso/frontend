import Button from '../components/common/Button.jsx'
import './FaqPage.css'

const FAQ_ITEMS = [
  {
    q: '코인은 어떻게 얻나요?',
    a: '가입하면 20코인을 받아요. 퀴즈를 풀면 정답률에 따라 받아요(문제별 가장 최근 시도 기준). 75% 이상이면 3코인, 50% 이상 75% 미만이면 1코인, 50% 미만이면 0코인이고 복습을 안내해요.',
  },
  {
    q: '퀴즈를 다시 풀면 코인을 또 받나요?',
    a: '퀴즈 세트 하나당 보상은 한 번만 받아요. 결과 화면을 새로고침해도 코인이 늘지 않아요.',
  },
  {
    q: '코인은 어디에 쓰나요?',
    a: '상점에서 옹이를 꾸밀 아이템을 살 수 있어요. 이미 가진 아이템은 다시 살 수 없고, 코인이 부족하면 살 수 없어요.',
  },
  {
    q: '옹이의 기분은 어떻게 바뀌나요?',
    a: '코인을 받으면 옹이의 기분이 좋아져요. 마감이 지난 과제나 확인하지 않은 알림이 있으면 옹이가 슬퍼해요.',
  },
]

export default function FaqPage() {
  return (
    <section className="faq" aria-labelledby="faq-title">
      <p className="faq__eyebrow">Q&amp;A</p>
      <h1 id="faq-title">자주 묻는 질문</h1>
      <p className="faq__lead">코인 보상에 대해 궁금한 점을 모아뒀어요.</p>
      <div className="faq__list">
        {FAQ_ITEMS.map(({ q, a }) => (
          <details key={q} className="faq__item">
            <summary><span className="faq__mark" aria-hidden="true">Q</span>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
      <Button to="/">홈으로 돌아가기</Button>
    </section>
  )
}
