import { useState } from "react";
import type { Task, Priority, Difficulty, Status, Subject } from "../types";

interface Props {
  task?: Task;
  subjects: Subject[];
  onSave: (
    data: Omit<Task, "id" | "createdAt">,
    newSubject?: Omit<Subject, "id">,
  ) => void;
  onSaved?: () => void;
  onClose: () => void;
}

const today = new Date().toISOString().slice(0, 10);
const CREATE_SUBJECT_VALUE = "__create_subject__";
const DEFAULT_SUBJECT_COLOR = "#E36B91";
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export default function TaskModal({ task, subjects, onSave, onSaved, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "medium");
  const [difficulty, setDifficulty] = useState<Difficulty>(task?.difficulty ?? "medium");
  const [status, setStatus] = useState<Status>(task?.status ?? "todo");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? today);
  const [tags, setTags] = useState(task?.tags.join(", ") ?? "");
  const [subjectId, setSubjectId] = useState(task?.subjectId ?? "");
  const [creatingSubject, setCreatingSubject] = useState(!task && subjects.length === 0);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState(DEFAULT_SUBJECT_COLOR);
  const [subjectError, setSubjectError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    let resolvedSubjectId = subjectId || undefined;
    let newSubject: Omit<Subject, "id"> | undefined;

    if (creatingSubject) {
      if (task) {
        setSubjectError("Create a new subject from the New Task form first.");
        return;
      }

      const name = newSubjectName.trim();
      const color = newSubjectColor.trim().toUpperCase();

      if (!name) {
        setSubjectError("Enter a subject name.");
        return;
      }
      if (!HEX_COLOR_RE.test(color)) {
        setSubjectError("Use a 6-digit hex color such as #E36B91.");
        return;
      }

      newSubject = { name, color };
      resolvedSubjectId = undefined;
    }

    if (!task && !resolvedSubjectId) {
      setSubjectError("Select a subject or create a new one.");
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      difficulty,
      status,
      dueDate,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      subjectId: resolvedSubjectId,
    }, newSubject);
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
          <div>
            <label className="mono text-[10px] tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>SUBJECT</label>
            {!task && subjects.length === 0 ? (
              <div className="text-xs rounded-xl px-3 py-2.5" style={{ background: "var(--secondary)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
                No subjects exist yet. Create one below and it will be used for this task.
              </div>
            ) : (
              <select
                className={selectClass}
                style={selectStyle}
                value={creatingSubject ? CREATE_SUBJECT_VALUE : subjectId}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === CREATE_SUBJECT_VALUE) {
                    setCreatingSubject(true);
                    setSubjectError("");
                  } else {
                    setCreatingSubject(false);
                    setSubjectId(value);
                    setSubjectError("");
                  }
                }}
              >
                {task && <option value="">No subject</option>}
                {!task && <option value="" disabled>Select a subject...</option>}
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
                <option value={CREATE_SUBJECT_VALUE}>+ Create new subject...</option>
              </select>
            )}
            {creatingSubject && (
              <div className="mt-2 rounded-xl p-3 space-y-2.5" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                <div>
                  <label className="mono text-[9px] tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>NEW SUBJECT</label>
                  <input
                    className="w-full rounded px-3 py-2 text-sm outline-none focus:ring-1"
                    style={selectStyle}
                    value={newSubjectName}
                    onChange={(e) => { setNewSubjectName(e.target.value); setSubjectError(""); }}
                    placeholder="e.g. Orthodontics"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={HEX_COLOR_RE.test(newSubjectColor) ? newSubjectColor : DEFAULT_SUBJECT_COLOR}
                    onChange={(e) => { setNewSubjectColor(e.target.value.toUpperCase()); setSubjectError(""); }}
                    className="w-10 h-10 rounded-lg p-1 cursor-pointer"
                    aria-label="Subject color picker"
                  />
                  <input
                    className="flex-1 rounded px-3 py-2 text-sm font-mono uppercase outline-none focus:ring-1"
                    style={selectStyle}
                    value={newSubjectColor}
                    onChange={(e) => { setNewSubjectColor(e.target.value); setSubjectError(""); }}
                    placeholder="#E36B91"
                    maxLength={7}
                  />
                  {subjects.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setCreatingSubject(false); setSubjectError(""); }}
                      className="text-[10px] font-semibold"
                      style={{ color: "var(--primary)" }}
                    >
                      Use existing
                    </button>
                  )}
                </div>
                <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Choose any 6-digit hex color.</p>
              </div>
            )}
            {subjectError && <p className="text-[10px] font-semibold mt-1.5" style={{ color: "#d65d74" }}>{subjectError}</p>}
          </div>

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
