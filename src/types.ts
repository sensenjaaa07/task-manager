export type Priority = "critical" | "high" | "medium" | "low";
export type Difficulty = "easy" | "medium" | "hard" | "expert";
export type Status = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  difficulty: Difficulty;
  status: Status;
  dueDate: string; // ISO date string YYYY-MM-DD
  createdAt: string;
  tags: string[];
}

export interface AppState {
  tasks: Task[];
}
