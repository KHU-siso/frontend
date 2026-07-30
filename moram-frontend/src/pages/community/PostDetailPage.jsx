import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../../components/common/Card";
import { posts } from "../../data/mockData";

export default function PostDetailPage() {
  const { postId } = useParams();
  const post = posts.find((item) => item.id === Number(postId));
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post?.comments ?? []);

  if (!post) return <p>게시글을 찾을 수 없습니다.</p>;

  function handleSubmit(event) {
    event.preventDefault();
    if (!comment.trim()) return;

    setComments((current) => [
      ...current,
      { id: Date.now(), author: "윤호", content: comment.trim() }
    ]);
    setComment("");
  }

  return (
    <div className="stack">
      <Link to="/community">← 커뮤니티</Link>

      <Card>
        <span className="badge">{post.category}</span>
        <h1>{post.title}</h1>
        <p className="muted">{post.author} · {post.createdAt} · 조회 {post.views}</p>

        <div className="post-content">{post.content}</div>

        <div className="detail-section">
          <h2>댓글 {comments.length}</h2>
          <div className="comment-list">
            {comments.map((item) => (
              <div className="comment" key={item.id}>
                <strong>{item.author}</strong>
                <p>{item.content}</p>
              </div>
            ))}
          </div>

          <form className="comment-form" onSubmit={handleSubmit}>
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="댓글을 입력하세요."
            />
            <button className="primary-button">등록</button>
          </form>
        </div>
      </Card>
    </div>
  );
}
