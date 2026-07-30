import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import { posts } from "../../data/mockData";

export default function CommunityPage() {
  return (
    <div className="stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">COMMUNITY</p>
          <h1>커뮤니티</h1>
          <p>과목별 질문과 자료를 자유롭게 공유하세요.</p>
        </div>
        <Link className="primary-button" to="/community/write">
          글 작성
        </Link>
      </div>

      <Card>
        <div className="post-list">
          {posts.map((post) => (
            <Link key={post.id} to={`/community/${post.id}`} className="post-item">
              <span className="badge">{post.category}</span>
              <div className="post-main">
                <h3>{post.title}</h3>
                <p className="muted">
                  {post.author} · {post.createdAt}
                </p>
              </div>
              <div className="post-meta">
                <span>조회 {post.views}</span>
                <span>댓글 {post.comments.length}</span>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
