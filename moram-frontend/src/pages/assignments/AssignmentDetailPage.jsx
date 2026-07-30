import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../../components/common/Card";
import ProgressBar from "../../components/common/ProgressBar";
import { assignments } from "../../data/mockData";

export default function AssignmentDetailPage() {
  const { assignmentId } = useParams();
  const assignment = assignments.find((item) => item.id === Number(assignmentId));
  const [submitted, setSubmitted] = useState(false);

  if (!assignment) {
    return <p>과제를 찾을 수 없습니다.</p>;
  }

  return (
    <div className="stack">
      <Link to="/assignments">← 과제 목록</Link>

      <Card>
        <div className="detail-heading">
          <div>
            <span className="badge">{assignment.course}</span>
            <h1>{assignment.title}</h1>
            <p className="muted">마감 {assignment.dueAt}</p>
          </div>
          <span className="status">{assignment.status}</span>
        </div>

        <ProgressBar value={assignment.progress} />

        <div className="detail-section">
          <h2>과제 설명</h2>
          <p>{assignment.description}</p>
        </div>

        <div className="detail-section">
          <h2>제출 파일</h2>
          <input type="file" />
        </div>

        <button
          className="primary-button"
          onClick={() => setSubmitted(true)}
        >
          제출하기
        </button>

        {submitted && (
          <p className="success-message">목업 제출이 완료되었습니다.</p>
        )}
      </Card>
    </div>
  );
}
