import { useState, useEffect, useCallback, useRef } from "react"
import type { Task, Subject, AppState } from "./types"

const LOCAL_STORAGE_KEY = "taskmanager_v1"
const AUTH_STORAGE_KEY = "taskmanager_auth_v1"

export interface AuthCredentials {
  username: string
  password: string
}

const SEED_SUBJECTS: Subject[] = [
  { id: "subject-patient-care", name: "Patient Care", color: "#E36B91" },
  { id: "subject-clinical", name: "Clinical", color: "#ED9467" },
  { id: "subject-operations", name: "Operations", color: "#7BBB9D" },
  { id: "subject-admin", name: "Admin", color: "#8B7BBE" },
]

const SEED_TASKS: Task[] = [
  {
    id: "1",
    subjectId: "subject-patient-care",
    title: "Confirm tomorrow's patient list",
    description:
      "Call patients with pending treatment plans and confirm their visit times.",
    priority: "critical",
    difficulty: "hard",
    status: "in_progress",
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    tags: ["front desk", "patients"],
  },
  {
    id: "2",
    subjectId: "subject-clinical",
    title: "Prepare whitening room",
    description:
      "Restock trays, shade guides, and aftercare kits before the afternoon block.",
    priority: "critical",
    difficulty: "medium",
    status: "todo",
    dueDate: new Date(Date.now() + 0 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    tags: ["treatment", "supplies"],
  },
  {
    id: "3",
    subjectId: "subject-clinical",
    title: "Review orthodontic consults",
    description:
      "Review notes and x-rays for this week's new consultation appointments.",
    priority: "high",
    difficulty: "medium",
    status: "todo",
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    tags: ["consults", "ortho"],
  },
  {
    id: "4",
    subjectId: "subject-operations",
    title: "Order restorative supplies",
    description:
      "Check stock levels for composite shades, bonding agent, and crowns.",
    priority: "high",
    difficulty: "hard",
    status: "todo",
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    tags: ["supplies", "lab"],
  },
  {
    id: "5",
    subjectId: "subject-patient-care",
    title: "Send post-op care follow-ups",
    description:
      "Message this week's extraction and implant patients with recovery guidance.",
    priority: "medium",
    difficulty: "easy",
    status: "todo",
    dueDate: new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    tags: ["follow-up", "patient care"],
  },
  {
    id: "6",
    subjectId: "subject-operations",
    title: "Update sterilization checklist",
    description:
      "Review weekly equipment logs and add the new autoclave cycle steps.",
    priority: "medium",
    difficulty: "expert",
    status: "todo",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    tags: ["safety", "clinic"],
  },
  {
    id: "7",
    subjectId: "subject-admin",
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
    subjectId: "subject-admin",
    title: "Plan next month's recall reminders",
    description:
      "Segment patients due for routine hygiene appointments next month.",
    priority: "low",
    difficulty: "easy",
    status: "todo",
    dueDate: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    tags: ["recall", "hygiene"],
  },
]

function normalizeState(value: unknown): AppState {
  const state = value as Partial<AppState> | null
  return {
    tasks: Array.isArray(state?.tasks) ? state.tasks : [],
    subjects: Array.isArray(state?.subjects) ? state.subjects : [],
  }
}

function loadLocalState(): AppState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) return normalizeState(JSON.parse(raw))
  } catch {}
  return { tasks: SEED_TASKS, subjects: SEED_SUBJECTS }
}

function saveLocalState(state: AppState) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state))
}

function getStoredCredentials(): AuthCredentials | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function setStoredCredentials(credentials: AuthCredentials | null) {
  if (credentials)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(credentials))
  else localStorage.removeItem(AUTH_STORAGE_KEY)
}

function authHeader(credentials: AuthCredentials) {
  return `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
}

async function requestCloudState(
  credentials: AuthCredentials,
  options?: RequestInit,
): Promise<AppState> {
  const response = await fetch("/api/tasks", {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(credentials),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || "Unable to sync tasks.")
  }

  return normalizeState(await response.json())
}

export function useTaskStore() {
  const [credentials, setCredentials] = useState<AuthCredentials | null>(
    getStoredCredentials,
  )
  const [state, setState] = useState<AppState>(() => ({ tasks: [], subjects: [] }))
  const [loading, setLoading] = useState(Boolean(credentials))
  const [error, setError] = useState<string | null>(null)
  const stateRef = useRef<AppState>(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const persistState = useCallback(
    async (nextState: AppState) => {
      saveLocalState(nextState)
      if (!credentials) return
      setError(null)
      try {
        const cloudState = await requestCloudState(credentials, {
          method: "PUT",
          body: JSON.stringify(nextState),
        })
        setState(cloudState)
        saveLocalState(cloudState)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to save tasks to shared storage.",
        )
      }
    },
    [credentials],
  )

  useEffect(() => {
    if (!credentials) return

    let cancelled = false
    setLoading(true)
    setError(null)
    requestCloudState(credentials)
      .then((cloudState) => {
        if (cancelled) return
        setState(cloudState)
        saveLocalState(cloudState)
      })
      .catch((err) => {
        if (cancelled) return
        setState(loadLocalState())
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load tasks from shared storage.",
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [credentials])

  const login = async (nextCredentials: AuthCredentials) => {
    setLoading(true)
    setError(null)
    try {
      const cloudState = await requestCloudState(nextCredentials)
      setCredentials(nextCredentials)
      setStoredCredentials(nextCredentials)
      setState(cloudState)
      saveLocalState(cloudState)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setCredentials(null)
    setStoredCredentials(null)
    stateRef.current = { tasks: [], subjects: [] }
    setState({ tasks: [], subjects: [] })
    setError(null)
  }

  const commitState = useCallback(
    (nextState: AppState) => {
      stateRef.current = nextState
      setState(nextState)
      void persistState(nextState)
    },
    [persistState],
  )

  const addSubject = (name: string, color: string): Subject => {
    const subject: Subject = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color: color.toUpperCase(),
    }
    const nextState = {
      ...stateRef.current,
      subjects: [...stateRef.current.subjects, subject],
    }
    commitState(nextState)
    return subject
  }

  const addTask = (
    task: Omit<Task, "id" | "createdAt">,
    newSubject?: Omit<Subject, "id">,
  ) => {
    const current = stateRef.current
    const subject = newSubject
      ? {
          ...newSubject,
          id: crypto.randomUUID(),
          name: newSubject.name.trim(),
          color: newSubject.color.toUpperCase(),
        }
      : null
    const nextState = {
      ...current,
      subjects: subject ? [...current.subjects, subject] : current.subjects,
      tasks: [
        ...current.tasks,
        {
          ...task,
          ...(subject ? { subjectId: subject.id } : {}),
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
      ],
    }
    commitState(nextState)
  }

  const updateTask = (id: string, patch: Partial<Task>) => {
    const current = stateRef.current
    const nextState = {
      ...current,
      tasks: current.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }
    commitState(nextState)
  }

  const deleteTask = (id: string) => {
    const current = stateRef.current
    const nextState = {
      ...current,
      tasks: current.tasks.filter((t) => t.id !== id),
    }
    commitState(nextState)
  }

  return {
    tasks: state.tasks,
    subjects: state.subjects,
    addSubject,
    isAuthenticated: Boolean(credentials),
    loading,
    error,
    login,
    logout,
    addTask,
    updateTask,
    deleteTask,
  }
}
