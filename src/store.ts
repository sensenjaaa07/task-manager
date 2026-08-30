import { useState, useEffect } from "react";
import type { Task, AppState } from "./types";

const STORAGE_KEY = "taskmanager_v1";

const SEED_TASKS: Task[] = [
  {
    id: "1",
    title: "Confirm tomorrow's patient list",
    description: "Call patients with pending treatment plans and confirm their visit times.",
    priority: "critical",
    difficulty: "hard",
    status: "in_progress",
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    tags: ["front desk", "patients"],
  },
  {
    id: "2",
    title: "Prepare whitening room",
    description: "Restock trays, shade guides, and aftercare kits before the afternoon block.",
    priority: "critical",
    difficulty: "medium",
    status: "todo",
    dueDate: new Date(Date.now() + 0 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    tags: ["treatment", "supplies"],
  },
  {
    id: "3",
    title: "Review orthodontic consults",
    description: "Review notes and x-rays for this week's new consultation appointments.",
    priority: "high",
    difficulty: "medium",
    status: "todo",
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    tags: ["consults", "ortho"],
  },
  {
    id: "4",
    title: "Order restorative supplies",
    description: "Check stock levels for composite shades, bonding agent, and crowns.",
    priority: "high",
    difficulty: "hard",
    status: "todo",
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    tags: ["supplies", "lab"],
  },
  {
    id: "5",
    title: "Send post-op care follow-ups",
    description: "Message this week's extraction and implant patients with recovery guidance.",
    priority: "medium",
    difficulty: "easy",
    status: "todo",
    dueDate: new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    tags: ["follow-up", "patient care"],
  },
  {
    id: "6",
    title: "Update sterilization checklist",
    description: "Review weekly equipment logs and add the new autoclave cycle steps.",
    priority: "medium",
    difficulty: "expert",
    status: "todo",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    tags: ["safety", "clinic"],
  },
  {
    id: "7",
    title: "Share huddle notes",
    description: "Send the morning huddle summary to the clinical team.",
    priority: "low",
    difficulty: "easy",
    status: "done",
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    tags: ["team"],
  },
  {
    id: "8",
    title: "Plan next month's recall reminders",
    description: "Segment patients due for routine hygiene appointments next month.",
    priority: "low",
    difficulty: "easy",
    status: "todo",
    dueDate: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    tags: ["recall", "hygiene"],
  },
];

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { tasks: SEED_TASKS };
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useTaskStore() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    setState((s) => ({
      ...s,
      tasks: [
        ...s.tasks,
        { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
      ],
    }));
  };

  const updateTask = (id: string, patch: Partial<Task>) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  };

  const deleteTask = (id: string) => {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  };

  return { tasks: state.tasks, addTask, updateTask, deleteTask };
}
