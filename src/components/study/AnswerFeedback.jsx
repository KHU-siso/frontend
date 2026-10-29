export default function AnswerFeedback({ question, answer, review = false }) {
  return (
    <section className={`answer-feedback ${answer.correct ? 'is-correct' : 'is-incorrect'}`} role="status" aria-label="정답 피드백">
      <header><strong>{answer.correct ? review ? '복습 성공!' : '정답이에요!' : '아쉬워요. 다시 학습해볼까요?'}</strong><span>정답: {question.answer}</span></header>
      <div><h2>해설</h2><p>{question.explanation}</p></div>
    </section>
  )
}
