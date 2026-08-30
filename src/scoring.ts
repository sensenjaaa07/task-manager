import type { Task, Priority, Difficulty } from "./types";

const PRIORITY_WEIGHT: Record<Priority, number> = {
  critical: 40,
  high: 25,
  medium: 12,
  low: 4,
};

const DIFFICULTY_WEIGHT: Record<Difficulty, number> = {
  easy: 2,
  medium: 5,
  hard: 10,
  expert: 16,
};

export function urgencyScore(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const days = Math.ceil((due.getTime() - today.getTime()) / 86400000);

  if (days < 0) return 50; // overdue — highest urgency
  if (days === 0) return 35;
  if (days <= 2) return 25;
  if (days <= 7) return 15;
  if (days <= 14) return 6;
  return 0;
}

export function taskScore(task: Task): number {
  if (task.status === "done") return -1;
  return (
    PRIORITY_WEIGHT[task.priority] +
    DIFFICULTY_WEIGHT[task.difficulty] +
    urgencyScore(task.dueDate)
  );
}

export function sortedByScore(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => taskScore(b) - taskScore(a));
}

export function daysUntilDue(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
}

export function dueLabelClass(days: number): string {
  if (days < 0) return "text-red-400";
  if (days === 0) return "text-orange-400";
  if (days <= 2) return "text-yellow-400";
  return "text-[var(--muted-foreground)]";
}

export function dueLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days}d left`;
}
