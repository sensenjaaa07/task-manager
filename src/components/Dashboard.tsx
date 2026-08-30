import type { Task, Status } from "../types";
import { sortedByScore, daysUntilDue, dueLabel, dueLabelClass } from "../scoring";
import { PriorityBadge, DifficultyBadge, StatusDot } from "./shared";

interface Props {
  tasks: Task[];
  onUpdateTask: (id: string, patch: Partial<Task>) => void;
  onNavigate: (view: "dashboard" | "tasks" | "calendar") => void;
}

const HOME_MESSAGES = [
  "Take it gently today. I love you and I am cheering for you.",
  "A little progress is still progress. Good luck, baby.",
  "You can do hard things, baby. I believe in you.",
  "One task at a time, baby. You have got this.",
];

export default function Dashboard({ tasks, onUpdateTask, onNavigate }: Props) {
  const active = tasks.filter((task) => task.status !== "done");
  const done = tasks.filter((task) => task.status === "done");
  const total = tasks.length;
  const progress = total === 0 ? 0 : Math.round((done.length / total) * 100);
  const priorityTasks = sortedByScore(active).slice(0, 5);
  const currentTask = priorityTasks[0];
  const overdueCount = active.filter((task) => daysUntilDue(task.dueDate) < 0).length;
  const todayCount = active.filter((task) => daysUntilDue(task.dueDate) === 0).length;
  const message = HOME_MESSAGES[new Date().getDate() % HOME_MESSAGES.length];
  const advance = (task: Task) => { const next: Record<Status, Status> = { todo: "in_progress", in_progress: "done", done: "todo" }; onUpdateTask(task.id, { status: next[task.status] }); };

  return (
    <div className="p-4 sm:p-6 grid gap-4 sm:gap-5 overflow-y-auto h-full">
      <section className="rounded-3xl p-5 sm:p-6" style={{ background: "linear-gradient(135deg, #fff0f5, #fffafb)", border: "1px solid var(--border)" }}>
        <p className="text-[10px] font-bold tracking-[.16em] uppercase" style={{ color: "var(--primary)" }}>A note for Chichi, from your Sensen</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mt-1"><div><h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Good luck, Chichi.</h2><p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>{message}</p></div><span className="text-sm font-bold" style={{ color: "var(--primary)" }}>{progress}% complete</span></div>
        <div className="w-full h-3 rounded-full mt-5 overflow-hidden" style={{ background: "#f8dce6" }}><div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #ef91ae, #d85880)" }} /></div>
      </section>

      {currentTask ? <section role="button" tabIndex={0} onClick={() => onNavigate("tasks")} onKeyDown={(event) => event.key === "Enter" && onNavigate("tasks")} className="rounded-3xl p-5 sm:p-6 cursor-pointer" style={{ background: "var(--card)", border: "2px solid #efb3c7", boxShadow: "0 8px 24px rgba(219,109,145,.12)" }}>
        <div className="flex items-center justify-between gap-3"><p className="text-[10px] font-bold tracking-[.16em] uppercase" style={{ color: "var(--primary)" }}>Current focus</p><span className="text-[11px] font-bold px-2 py-1 rounded-full" style={{ background: "var(--secondary)", color: "var(--primary)" }}>You can do this</span></div>
        <div className="flex items-start gap-3 mt-3"><button onClick={(event) => { event.stopPropagation(); advance(currentTask); }} className="w-9 h-9 rounded-full grid place-items-center flex-shrink-0" style={{ background: "var(--secondary)" }} aria-label="Advance current task"><StatusDot status={currentTask.status} /></button><div className="flex-1 min-w-0"><h3 className="text-lg font-bold">{currentTask.title}</h3><p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{currentTask.description}</p><div className="flex gap-2 flex-wrap mt-3"><PriorityBadge priority={currentTask.priority} /><DifficultyBadge difficulty={currentTask.difficulty} /><span className={`text-[10px] font-semibold ${dueLabelClass(daysUntilDue(currentTask.dueDate))}`}>{dueLabel(daysUntilDue(currentTask.dueDate))}</span></div></div><span className="text-xs font-bold whitespace-nowrap" style={{ color: "var(--primary)" }}>Open task</span></div>
      </section> : <section className="rounded-3xl p-5 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}><p className="font-bold">Everything is done, Chichi.</p><p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>You deserve a little happy dance.</p></section>}

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {[{ label: "Care tasks", value: total, color: "#e36b91" }, { label: "Completed", value: done.length, color: "#7bbb9d" }, { label: "Review", value: overdueCount, color: "#d65d74" }, { label: "Today", value: todayCount, color: "#ed9467" }].map((stat) => <div key={stat.label} className="rounded-2xl p-2.5 sm:p-4 min-w-0" style={{ background: "var(--card)", border: "1px solid var(--border)" }}><p className="text-[8px] sm:text-[10px] font-bold tracking-wide sm:tracking-widest uppercase truncate" style={{ color: "var(--muted-foreground)" }}>{stat.label}</p><p className="text-2xl sm:text-3xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p></div>)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-0">
        <section className="rounded-2xl flex flex-col min-h-[260px]" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}><p className="text-[10px] font-bold tracking-widest" style={{ color: "var(--muted-foreground)" }}>NEXT IN CARE</p><button onClick={() => onNavigate("tasks")} className="text-xs font-bold" style={{ color: "var(--primary)" }}>View tasks</button></div>
          <div className="flex-1">{priorityTasks.slice(1, 4).length === 0 ? <p className="p-5 text-sm" style={{ color: "var(--muted-foreground)" }}>Nothing else needs your attention right now.</p> : priorityTasks.slice(1, 4).map((task) => <div key={task.id} role="button" tabIndex={0} onClick={() => onNavigate("tasks")} onKeyDown={(event) => event.key === "Enter" && onNavigate("tasks")} className="flex items-start gap-3 px-5 py-3 border-b last:border-0 cursor-pointer hover-secondary" style={{ borderColor: "var(--border)" }}><button onClick={(event) => { event.stopPropagation(); advance(task); }} className="mt-0.5"><StatusDot status={task.status} /></button><div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{task.title}</p><div className="flex items-center gap-2 flex-wrap mt-1"><PriorityBadge priority={task.priority} /><span className={`text-[10px] ${dueLabelClass(daysUntilDue(task.dueDate))}`}>{dueLabel(daysUntilDue(task.dueDate))}</span></div></div></div>)}</div>
        </section>
        <button onClick={() => onNavigate("calendar")} className="rounded-2xl text-left p-5 min-h-[180px] transition-transform hover:-translate-y-0.5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-[10px] font-bold tracking-widest" style={{ color: "var(--muted-foreground)" }}>UPCOMING CARE</p>
          <p className="text-xl font-bold mt-4">Open Chichi's schedule</p>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>See every appointment and task due date in one calm, simple view.</p>
          <p className="text-sm font-bold mt-5" style={{ color: "var(--primary)" }}>View schedule</p>
        </button>
      </div>
    </div>
  );
}
