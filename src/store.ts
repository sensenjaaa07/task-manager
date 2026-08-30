import { useState, useEffect, useCallback } from "react"
import type { Task, AppState } from "./types"

const LOCAL_STORAGE_KEY = "taskmanager_v1"
const AUTH_STORAGE_KEY = "taskmanager_auth_v1"

export interface AuthCredentials {
  username: string
  password: string
}

const SEED_TASKS: Task[] = [
  {
    id: "1",
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

function loadLocalState(): AppState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { tasks: SEED_TASKS }
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

  return response.json()
}

export function useTaskStore() {
  const [credentials, setCredentials] = useState<AuthCredentials | null>(
    getStoredCredentials,
  )
  const [state, setState] = useState<AppState>(() => ({ tasks: [] }))
  const [loading, setLoading] = useState(Boolean(credentials))
  const [error, setError] = useState<string | null>(null)

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
            : "Unable to save tasks to Vercel storage.",
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
            : "Unable to load tasks from Vercel storage.",
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
    setState({ tasks: [] })
    setError(null)
  }

  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    const nextState = {
      ...state,
      tasks: [
        ...state.tasks,
        {
          ...task,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
      ],
    }
    setState(nextState)
    void persistState(nextState)
  }

  const updateTask = (id: string, patch: Partial<Task>) => {
    const nextState = {
      ...state,
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }
    setState(nextState)
    void persistState(nextState)
  }

  const deleteTask = (id: string) => {
    const nextState = {
      ...state,
      tasks: state.tasks.filter((t) => t.id !== id),
    }
    setState(nextState)
    void persistState(nextState)
  }

  return {
    tasks: state.tasks,
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
