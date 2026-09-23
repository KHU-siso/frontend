import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";

/**
 * One "할 일" card: a list of tasks with checkboxes and a progress bar
 * that updates as items are checked off. Used 3x on the dashboard.
 */
export default function TodoCard({ title, titleColor = "text-emerald-700", accent = "#082d66", initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [draft, setDraft] = useState("");

  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter((t) => t.done).length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  const toggleTask = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const addTask = (e) => {
    e.preventDefault();
    const label = draft.trim();
    if (!label) return;
    setTasks((prev) => [...prev, { id: crypto.randomUUID(), label, done: false }]);
    setDraft("");
  };

  return (
    <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_4px_4px_0_#d2dbec]">
      <div className="mb-3 flex items-center justify-between">
        <span className={`text-xs font-bold ${titleColor}`}>{title}</span>
        <span className="text-xs text-gray-400">{progress}%</span>
      </div>

      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: accent }} />
      </div>

      <ul className="flex flex-col gap-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleTask(task.id)}
              aria-pressed={task.done}
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] text-white transition ${
                task.done ? "border-transparent" : "border-gray-300"
              }`}
              style={task.done ? { backgroundColor: accent } : undefined}
            >
              {task.done && "✓"}
            </button>
            <span className={`text-sm ${task.done ? "text-gray-400 line-through" : "text-gray-700"}`}>
              {task.label}
            </span>
          </li>
        ))}
      </ul>

      <form onSubmit={addTask} className="mt-3 flex items-center gap-2 text-gray-300">
        <Plus className="h-4 w-4" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="직접 추가"
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-300"
        />
      </form>
    </div>
  );
}
