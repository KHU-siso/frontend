import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import ProgressBar from "../../components/common/ProgressBar";
import { assignments, courses, dashboardStats } from "../../data/mockData";

export default function DashboardPage() {
  return (
    <div className="stack">
      <section className="hero">
        <div>
          <p className="eyebrow">오늘도 한 걸음씩</p>
          <h1>윤호님, 오늘의 학습을 시작해볼까요?</h1>
          <p>가장 급한 과제부터 5분만 시작해보세요.</p>
        </div>
        <button className="primary-button">오늘의 1문제</button>
      </section>

      <section className="stats-grid">
        {dashboardStats.map((stat) => (
          <Card key={stat.label}>
            <p className="muted">{stat.label}</p>
            <strong className="stat-value">{stat.value}</strong>
            <p className="small">{stat.description}</p>
          </Card>
        ))}
      </section>

      <section className="dashboard-grid">
        <Card
          title="과제 진행 상황"
          action={<Link to="/assignments">전체 보기</Link>}
        >
          <div className="list">
            {assignments.slice(0, 3).map((assignment) => (
              <Link
                key={assignment.id}
                to={`/assignments/${assignment.id}`}
                className="list-row"
              >
                <div className="list-row-main">
                  <div>
                    <span className="badge">{assignment.course}</span>
                    <strong>{assignment.title}</strong>
                  </div>
                  <span>{assignment.progress}%</span>
                </div>
                <ProgressBar value={assignment.progress} />
              </Link>
            ))}
          </div>
        </Card>

        <Card title="과목별 이수율">
          <div className="list">
            {courses.map((course) => (
              <div className="course-row" key={course.id}>
                <div className="list-row-main">
                  <strong>{course.name}</strong>
                  <span>{course.progress}%</span>
                </div>
                <ProgressBar value={course.progress} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="빠른 실행">
          <div className="quick-grid">
            <button>새 과제</button>
            <button>노트 작성</button>
            <button>5분 타이머</button>
            <button>플래시카드</button>
          </div>
        </Card>

        <Card title="오늘 일정">
          <div className="timeline">
            <div><span>10:30</span><strong>알고리즘 강의</strong></div>
            <div><span>15:00</span><strong>팀 프로젝트 회의</strong></div>
            <div><span>21:00</span><strong>오늘의 퀴즈 3문제</strong></div>
          </div>
        </Card>
      </section>
    </div>
  );
}
