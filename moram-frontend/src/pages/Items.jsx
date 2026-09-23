import Logo from "../components/Logo";
export default function Items(){return (
<div>
  <header className="itemsHead">
    <Logo/>
  </header>
  <div className="items">
    <section>
      <div className="snow bigsnow">
        <i>
        </i>
        <i>
        </i>
      </div>
    </section>
    <aside>
      <h2>아이템 보관함</h2>
      <div className="tabs">모자　 모자　 모자　 모자　 모자</div>
      <div className="itemGrid">{Array.from({length:9}).map((_,i)=>
      <div key={i}>
      </div>)}
    </div>
  </aside>
</div>
</div>
);
}
