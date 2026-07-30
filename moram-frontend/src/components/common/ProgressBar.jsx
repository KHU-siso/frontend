export default function ProgressBar({ value }) {
  return (
    <div className="progress-track" aria-label={`진행률 ${value}%`}>
      <div className="progress-value" style={{ width: `${value}%` }} />
    </div>
  );
}
