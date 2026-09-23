import Logo from "../components/Logo";
export default function Library() {
  const xs=['3주차 - 단테 <신곡>','네트워크 기초 실습','특허와 지식 재산권법 - 5주차','특허와 지식 재산권법 - 6주차','4주차 - 괴테 <파우스트>'];
  return (
  <div>
    <header className="top">
      <Logo/>
      <button>☰</button>
      <div className="search">⌕</div>
      <div className="date">2026년 7월 16일 목요일</div>
      <div className="avatar">김</div>
    </header>
    <main className="library">
      <h1>자료실</h1>
      <input className="libSearch" placeholder="강의명, 과목명으로 검색"/>
      <div className="tabs">전체　　학습자료　　시험자료　　지난자료</div>
      <div className="libGrid">
        <section>{xs.map((x,i)=>
        <div className="file" key={x}>
          <b>▤</b>
          <div>
            <h3>{x}
          </h3>
          <small>교양 · PDF · 1.5MB · 2026.08.17</small>
        </div>
        <button>미리보기</button>
        <button className="primary">↓ 다운로드</button>
      </div>)}
    </section>
    <aside>
      <h2>3주차 - 단테 &lt;
      신곡&gt;
    </h2>
    <p>학습자료　PDF</p>
    <p>자료 설명<br/>선택한 강의 자료의 요약 설명이 표시됩니다.</p>
    <button className="primary">개념학습</button>
    <button>관련 문제풀기</button>
  </aside>
</div>
</main>
</div>
);
}
