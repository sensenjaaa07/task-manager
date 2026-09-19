export type Priority = "critical" | "high" | "medium" | "low";
export type Difficulty = "easy" | "medium" | "hard" | "expert";
export type Status = "todo" | "in_progress" | "done";

export interface Subject {
  id: string;
  name: string;
  color: string; // Hex color, e.g. #E36B91
}

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
  subjectId?: string;
}

export interface AppState {
  tasks: Task[];
  subjects: Subject[];
}
