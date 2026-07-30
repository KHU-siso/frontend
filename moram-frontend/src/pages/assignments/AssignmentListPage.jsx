import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import ProgressBar from "../../components/common/ProgressBar";
import { assignments } from "../../data/mockData";

export default function AssignmentListPage() {
  const [filter, setFilter] = useState("전체");

  const visibleAssignments = useMemo(() => {
    if (filter === "전체") return assignments;
    return assignments.filter((item) => item.status === filter);
  }, [filter]);

  return (
    <div className="stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ASSIGNMENTS</p>
          <h1>과제</h1>
          <p>과제 진행률과 마감 일정을 한눈에 확인하세요.</p>
        </div>
        <button className="primary-button">+ 새 과제</button>
      </div>

      <div className="filter-row">
        {["전체", "마감 임박", "진행 중", "시작 전"].map((item) => (
          <button
            key={item}
            className={filter === item ? "filter active" : "filter"}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <Card>
        <div className="assignment-list">
          {visibleAssignments.map((assignment) => (
            <Link
              key={assignment.id}
              className="assignment-item"
              to={`/assignments/${assignment.id}`}
            >
              <div>
                <span className="badge">{assignment.course}</span>
                <h3>{assignment.title}</h3>
                <p className="muted">마감 {assignment.dueAt}</p>
              </div>
              <div className="assignment-progress">
                <strong>{assignment.progress}%</strong>
                <ProgressBar value={assignment.progress} />
                <span className="status">{assignment.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
