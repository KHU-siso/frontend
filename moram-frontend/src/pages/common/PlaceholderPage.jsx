import Card from "../../components/common/Card";

export default function PlaceholderPage({ title }) {
  return (
    <div className="stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">COMING SOON</p>
          <h1>{title}</h1>
          <p>라우팅과 기본 페이지 뼈대가 연결되어 있습니다.</p>
        </div>
      </div>
      <Card>
        <p className="muted">
          다음 단계에서 디자인 시안과 실제 API 명세에 맞춰 구현할 페이지입니다.
        </p>
      </Card>
    </div>
  );
}
