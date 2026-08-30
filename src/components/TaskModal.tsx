import { useState } from "react";
import type { Task, Priority, Difficulty, Status } from "../types";

interface Props {
  task?: Task;
  onSave: (data: Omit<Task, "id" | "createdAt">) => void;
  onSaved?: () => void;
  onClose: () => void;
}

const today = new Date().toISOString().slice(0, 10);

export default function TaskModal({ task, onSave, onSaved, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "medium");
  const [difficulty, setDifficulty] = useState<Difficulty>(task?.difficulty ?? "medium");
  const [status, setStatus] = useState<Status>(task?.status ?? "todo");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? today);
  const [tags, setTags] = useState(task?.tags.join(", ") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      difficulty,
      status,
      dueDate,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    onClose();
    onSaved?.();
  }

  const selectClass = "w-full rounded px-3 py-2 text-sm font-medium outline-none focus:ring-1 transition-all";
  const selectStyle = { background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(73,53,64,0.28)" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-5 max-h-[92dvh] overflow-y-auto" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between">
          <span className="mono text-[10px] tracking-widest" style={{ color: "var(--muted-foreground)" }}>{task ? "EDIT TASK" : "NEW TASK"}</span>
          <button onClick={onClose} className="text-lg leading-none hover:opacity-60 transition-opacity" style={{ color: "var(--muted-foreground)" }}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div><label className="mono text-[10px] tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>TITLE</label><input className="w-full rounded px-3 py-2 text-sm outline-none focus:ring-1" style={{ ...selectStyle, "--tw-ring-color": "var(--primary)" } as React.CSSProperties} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required /></div>
          <div><label className="mono text-[10px] tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>DESCRIPTION</label><textarea className="w-full rounded px-3 py-2 text-sm outline-none focus:ring-1 resize-none" style={selectStyle} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mono text-[10px] tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>PRIORITY</label><select className={selectClass} style={selectStyle} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
            <div><label className="mono text-[10px] tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>DIFFICULTY</label><select className={selectClass} style={selectStyle} value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="expert">Expert</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mono text-[10px] tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>STATUS</label><select className={selectClass} style={selectStyle} value={status} onChange={(e) => setStatus(e.target.value as Status)}><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option></select></div>
            <div><label className="mono text-[10px] tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>DUE DATE</label><input type="date" className={selectClass} style={selectStyle} value={dueDate} onChange={(e) => setDueDate(e.target.value)} required /></div>
          </div>
          <div><label className="mono text-[10px] tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>TAGS (comma separated)</label><input className="w-full rounded px-3 py-2 text-sm outline-none focus:ring-1" style={selectStyle} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. backend, design, urgent" /></div>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded text-sm font-medium transition-opacity hover:opacity-70" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>Cancel</button>
            <button type="submit" className="flex-1 py-2 rounded text-sm font-semibold transition-opacity hover:opacity-80" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>{task ? "Save Changes" : "Create Task"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
