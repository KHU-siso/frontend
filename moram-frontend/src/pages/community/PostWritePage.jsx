import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";

export default function PostWritePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category: "질문",
    title: "",
    content: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    alert("목업 게시글이 등록되었습니다.");
    navigate("/community");
  }

  return (
    <div className="stack">
      <div className="page-heading">
        <div>
          <h1>글 작성</h1>
          <p>질문이나 학습 자료를 공유해보세요.</p>
        </div>
      </div>

      <Card>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            카테고리
            <select name="category" value={form.category} onChange={handleChange}>
              <option>질문</option>
              <option>자료</option>
              <option>자유</option>
            </select>
          </label>

          <label>
            제목
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="제목을 입력하세요."
            />
          </label>

          <label>
            내용
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="내용을 입력하세요."
              rows="10"
            />
          </label>

          <div className="button-row">
            <button type="button" onClick={() => navigate(-1)}>
              취소
            </button>
            <button className="primary-button">등록</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
