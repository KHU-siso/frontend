import React from "react";

function TaskRow({ task, cancelled, onToggleCancel }) {
  const isOverdue = task.status === "overdue";

  return (
    <div
      className={`rounded-3xl border-2 p-4 shadow-sm ${
        isOverdue ? "border-black/10 bg-red-50" : "border-black/10 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-black">{task.title}</p>
          <p className="mt-1 text-sm text-gray-600">
            {task.professor} · {task.dueLabel}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${isOverdue ? "bg-red-600" : "bg-emerald-600"}`}
            aria-hidden="true"
          />
          <span className={`text-xs font-bold ${isOverdue ? "text-red-600" : "text-emerald-700"}`}>
            {isOverdue ? "지난 주에 밀렸어요!" : "오늘의 할 일"}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {/* 진행률은 API(PriorityChecklistItem)에 없는 값이라 있을 때만 표시 */}
        {task.progress != null ? (
          <>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#d2dbec]">
              <div
                className="h-full rounded-full"
                style={{ width: `${task.progress}%`, backgroundColor: isOverdue ? "#b91c1c" : "#082d66" }}
              />
            </div>
            <span className="shrink-0 text-xs text-gray-500">현재 진행률 {task.progress}%</span>
          </>
        ) : (
          <div className="flex-1" />
        )}
        <button
          type="button"
          onClick={onToggleCancel}
          className={`ml-auto shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition ${
            cancelled ? "bg-gray-300" : "bg-gradient-to-r from-[#06275a] to-[#0d53c0]"
          }`}
        >
          {cancelled ? "휴강 취소" : "휴강 처리"}
        </button>
      </div>
    </div>
  );
}

export default function TaskListCard({ tasks, cancelledSubjectIds = new Set(), onToggleCancel, loading, error }) {
  return (
    <div className="rounded-[2.5rem] border border-black/10 bg-white p-6 shadow-[0_4px_4px_0_#d2dbec]">
      <p className="mb-4 text-2xl font-bold text-black/70">해야할 일</p>
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            cancelled={cancelledSubjectIds.has(task.subjectId)}
            onToggleCancel={() => onToggleCancel?.(task.subjectId)}
          />
        ))}
        {loading && <p className="py-4 text-center text-sm text-gray-400">불러오는 중...</p>}
        {error && <p className="py-4 text-center text-sm text-red-500">{error}</p>}
        {!loading && !error && tasks.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">마감이 다가오는 과제가 없어요.</p>
        )}
      </div>
    </div>
  );
}
