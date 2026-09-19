import { useState } from "react";
import type { Task } from "../types";
import { daysUntilDue } from "../scoring";
import { PriorityBadge, StatusDot, SubjectBadge } from "./shared";
import { PRIORITY_COLOR } from "./shared";

interface Props {
  tasks: Task[];
  subjects: import("../types").Subject[];
  onUpdateTask: (id: string, patch: Partial<Task>) => void;
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function Calendar({ tasks, subjects, onUpdateTask }: Props) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());

  const days = getCalendarDays(viewYear, viewMonth);

  const tasksByDay = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return tasks.filter((t) => t.dueDate === dateStr);
  };

  const isToday = (day: number) =>
    day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
    setSelectedDay(null);
  };

  const selectedTasks = selectedDay ? tasksByDay(selectedDay) : [];
  const selectedDateStr = selectedDay
    ? `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : "";

  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row overflow-y-auto md:overflow-hidden">
      {/* calendar grid */}
      <div className="flex flex-col flex-1 min-w-0 p-4 sm:p-6 gap-4">
        {/* header */}
        <div className="flex items-center gap-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded hover:opacity-70 transition-opacity"
            style={{ background: "var(--secondary)", color: "var(--foreground)" }}
          >
            ‹
          </button>
          <span className="text-sm font-semibold flex-1 text-center">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded hover:opacity-70 transition-opacity"
            style={{ background: "var(--secondary)", color: "var(--foreground)" }}
          >
            ›
          </button>
          <button
            onClick={() => { setViewYear(now.getFullYear()); setViewMonth(now.getMonth()); setSelectedDay(now.getDate()); }}
            className="mono text-[10px] px-2.5 py-1 rounded hover:opacity-80 transition-opacity"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            TODAY
          </button>
        </div>

        {/* day names */}
        <div className="grid grid-cols-7 gap-1">
          {DAY_NAMES.map((d) => (
            <div key={d} className="mono text-[9px] text-center py-1" style={{ color: "var(--muted-foreground)" }}>
              {d}
            </div>
          ))}
        </div>

        {/* cells */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {days.map((day, i) => {
            if (day === null) return <div key={i} />;
            const dayTasks = tasksByDay(day);
            const isSelected = selectedDay === day;
            const today = isToday(day);

            return (
              <button
                key={i}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className="rounded-xl flex flex-col p-1.5 text-left transition-all hover:opacity-90 min-h-[48px] sm:min-h-[52px]"
                style={{
                  background: isSelected ? "var(--primary)" : today ? "var(--secondary)" : "var(--card)",
                  border: today && !isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                  color: isSelected ? "var(--primary-foreground)" : "var(--foreground)",
                }}
              >
                <span
                  className="mono text-[11px] font-semibold mb-1"
                  style={{ color: isSelected ? "white" : today ? "var(--primary)" : "inherit" }}
                >
                  {day}
                </span>
                <div className="flex flex-wrap gap-0.5">
                  {dayTasks.slice(0, 3).map((t) => {
                    const subject = subjects.find((item) => item.id === t.subjectId);
                    return (
                      <span
                        key={t.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: isSelected ? "rgba(255,255,255,0.7)" : subject?.color ?? PRIORITY_COLOR[t.priority] }}
                        title={subject ? subject.name + ": " + t.title : t.title}
                      />
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <span className="mono text-[8px]" style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "var(--muted-foreground)" }}>
                      +{dayTasks.length - 3}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* side panel */}
      <div
        className="w-full md:w-72 flex-shrink-0 border-t md:border-t-0 md:border-l flex flex-col min-h-[280px]"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="mono text-[10px] tracking-widest" style={{ color: "var(--muted-foreground)" }}>
            {selectedDay
              ? new Date(selectedDateStr + "T12:00:00").toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()
              : "SELECT A DATE"}
          </div>
          {selectedDay && (
            <div className="mono text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {selectedTasks.length} task{selectedTasks.length !== 1 ? "s" : ""} due
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {!selectedDay ? (
            <div className="flex items-center justify-center h-full text-sm" style={{ color: "var(--muted-foreground)" }}>
              Click a day to see tasks
            </div>
          ) : selectedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: "var(--muted-foreground)" }}>
              <span className="text-2xl">✓</span>
              <span className="text-sm">No tasks this day</span>
            </div>
          ) : (
            selectedTasks.map((task) => {
              const days = daysUntilDue(task.dueDate);
              return (
                <div
                  key={task.id}
                  className="flex items-start gap-3 px-5 py-4 border-b hover-secondary transition-colors"
                  style={{ borderColor: "var(--border)" }}
                >
                  <button
                    onClick={() => {
                      const next = task.status === "done" ? "todo" : task.status === "todo" ? "in_progress" : "done";
                      onUpdateTask(task.id, { status: next });
                    }}
                    className="mt-0.5 flex-shrink-0"
                  >
                    <StatusDot status={task.status} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium mb-1.5 ${task.status === "done" ? "line-through opacity-50" : ""}`}>
                      {task.title}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {subjects.find((item) => item.id === task.subjectId) && <SubjectBadge subject={subjects.find((item) => item.id === task.subjectId)!} />}
                      <PriorityBadge priority={task.priority} />
                      {days < 0 && (
                        <span className="mono text-[10px] text-red-400">{Math.abs(days)}d overdue</span>
                      )}
                      {days === 0 && (
                        <span className="mono text-[10px] text-orange-400">Due today</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* month task summary */}
        <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="mono text-[9px] tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>
            THIS MONTH
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(() => {
              const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
              const monthTasks = tasks.filter((t) => t.dueDate.startsWith(monthStr));
              return [
                { label: "Total", val: monthTasks.length, color: "var(--foreground)" },
                { label: "Done", val: monthTasks.filter((t) => t.status === "done").length, color: "#22c55e" },
                { label: "Overdue", val: monthTasks.filter((t) => daysUntilDue(t.dueDate) < 0 && t.status !== "done").length, color: "#ef4444" },
                { label: "Critical", val: monthTasks.filter((t) => t.priority === "critical").length, color: "#ef4444" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="mono text-[9px]" style={{ color: "var(--muted-foreground)" }}>{s.label.toUpperCase()}</div>
                  <div className="mono text-lg font-bold" style={{ color: s.color }}>{s.val}</div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
