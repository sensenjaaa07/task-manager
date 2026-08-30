import { useState } from "react";
import { useTaskStore } from "./store";
import Dashboard from "./components/Dashboard";
import Tasks from "./components/Tasks";
import Calendar from "./components/Calendar";

type View = "dashboard" | "tasks" | "calendar";

function Icon({ name }: { name: View }) {
  const common = { width: 21, height: 21, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "dashboard") return <svg {...common}><path d="M4 13h6V4H4v9Zm0 7h6v-3H4v3Zm10 0h6v-9h-6v9Zm0-16v3h6V4h-6Z" /></svg>;
  if (name === "tasks") return <svg {...common}><path d="M8 6h12M8 12h12M8 18h12" /><path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2" /></svg>;
  return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></svg>;
}

const NAV_ITEMS: { id: View; label: string; shortLabel: string }[] = [
  { id: "dashboard", label: "Today", shortLabel: "Today" },
  { id: "tasks", label: "Care Tasks", shortLabel: "Tasks" },
  { id: "calendar", label: "Schedule", shortLabel: "Schedule" },
];

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const { tasks, addTask, updateTask, deleteTask } = useTaskStore();
  const activeCount = tasks.filter((t) => t.status !== "done").length;
  const activeItem = NAV_ITEMS.find((item) => item.id === view)!;

  return (
    <div className="app-shell flex h-full overflow-hidden" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <aside className="desktop-sidebar hidden md:flex flex-col w-60 flex-shrink-0 border-r" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3 px-5 py-6 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="brand-mark">C</div>
          <div><span className="text-sm font-bold tracking-tight">Chichi Dental Tasks</span></div>
        </div>
        <nav className="flex flex-col gap-2 p-3 flex-1" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const active = view === item.id;
            return <button key={item.id} onClick={() => setView(item.id)} className="nav-button" data-active={active}>
              <Icon name={item.id} /><span>{item.label}</span>
              {item.id === "tasks" && activeCount > 0 && <span className="nav-count">{activeCount}</span>}
            </button>;
          })}
        </nav>
        <div className="m-3 rounded-2xl p-4" style={{ background: "var(--secondary)" }}>
          <p className="text-xs font-semibold">For Chichi</p>
          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{activeCount} care task{activeCount === 1 ? "" : "s"} to review. You have got this.</p>
        </div>
      </aside>

      <main className="app-main flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-5 sm:px-7 py-4 border-b flex-shrink-0" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,.78)" }}>
          <div className="flex items-center gap-3">
            <div className="brand-mark md:hidden">C</div>
            <div><p className="text-[10px] font-semibold tracking-[.16em] uppercase" style={{ color: "var(--primary)" }}>Chichi Dental Tasks</p><h1 className="text-xl sm:text-2xl font-bold tracking-tight">{activeItem.label}</h1></div>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full px-3 py-2" style={{ background: "var(--secondary)" }}><span className="w-2 h-2 rounded-full" style={{ background: "#7bbb9d" }} /><span className="text-xs font-medium">Practice open</span></div>
        </header>
        <div className="flex-1 min-h-0 overflow-hidden">
          {view === "dashboard" && <Dashboard tasks={tasks} onUpdateTask={updateTask} onNavigate={setView} />}
          {view === "tasks" && <Tasks tasks={tasks} onAddTask={addTask} onUpdateTask={updateTask} onDeleteTask={deleteTask} />}
          {view === "calendar" && <Calendar tasks={tasks} onUpdateTask={updateTask} />}
        </div>
      </main>

      <nav className="mobile-nav md:hidden" aria-label="Mobile navigation">
        {NAV_ITEMS.map((item) => <button key={item.id} onClick={() => setView(item.id)} className="mobile-nav-button" data-active={view === item.id}>
          <Icon name={item.id} /><span>{item.shortLabel}</span>{item.id === "tasks" && activeCount > 0 && <i>{activeCount > 9 ? "9+" : activeCount}</i>}
        </button>)}
      </nav>
    </div>
  );
}
