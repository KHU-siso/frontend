import Button from '../components/common/Button.jsx'
import './RoutePlaceholderPage.css'

export default function RoutePlaceholderPage({ title, notFound = false }) {
  return (
    <section className="route-placeholder" aria-labelledby="route-title">
      <p className="route-placeholder__eyebrow">MORAM</p>
      <h1 id="route-title">{notFound ? '페이지를 찾을 수 없어요' : title}</h1>
      <p>{notFound ? '주소를 확인하거나 홈으로 이동해주세요.' : '이 화면은 준비 중이에요.'}</p>
      <Button to="/">홈으로 돌아가기</Button>
    </section>
  )
}
