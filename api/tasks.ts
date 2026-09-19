import type { AppState } from "../src/types"
import { createClient } from "redis"

interface ApiRequest {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
}

interface ApiResponse {
  setHeader(name: string, value: string): void
  status(code: number): { json(body: unknown): void }
}

const TASKS_KEY = "chichi-dental-tasks"
const USERNAME = process.env.APP_USERNAME || "Dr Carla"
const PASSWORD = process.env.APP_PASSWORD || "ilovemysensen"

const SEED_STATE: AppState = { tasks: [], subjects: [] }

let redisClient: ReturnType<typeof createClient> | null = null
let redisConnectPromise: Promise<void> | null = null

async function getRedisCloudClient() {
  const url = process.env.REDIS_URL
  if (!url) return null

  if (!redisClient) {
    redisClient = createClient({ url })
    redisClient.on("error", (error) => console.error("Storage error:", error))
  }

  if (!redisConnectPromise) {
    redisConnectPromise = redisClient.connect()
  }

  await redisConnectPromise
  return redisClient
}

function getRestRedisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null

  return { url: url.replace(/\/$/, ""), token }
}

async function redisRestCommand<T>(command: unknown[]): Promise<T | null> {
  const config = getRestRedisConfig()
  if (!config) return null

  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([command]),
  })

  if (!response.ok) throw new Error("Unable to access shared storage.")

  const [result] = await response.json()
  if (result.error) throw new Error(result.error)
  return result.result ?? null
}

async function getState() {
  const redis = await getRedisCloudClient()
  if (redis) {
    const raw = await redis.get(TASKS_KEY)
    return raw ? (JSON.parse(raw) as AppState) : null
  }

  const raw = await redisRestCommand<string | null>(["GET", TASKS_KEY])
  if (!raw) return null
  if (typeof raw === "string") return JSON.parse(raw) as AppState
  return raw as AppState
}

async function setState(state: AppState) {
  const redis = await getRedisCloudClient()
  if (redis) {
    await redis.set(TASKS_KEY, JSON.stringify(state))
    return
  }

  if (!getRestRedisConfig()) {
    throw new Error("Shared storage is not configured. Please contact the administrator.")
  }

  await redisRestCommand<string>(["SET", TASKS_KEY, JSON.stringify(state)])
}

function unauthorized(response: ApiResponse) {
  response.setHeader("WWW-Authenticate", 'Basic realm="Chichi Dental Tasks"')
  return response.status(401).json({ error: "Invalid username or password." })
}

function headerValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function isAuthorized(request: ApiRequest) {
  const header = headerValue(request.headers.authorization)
  if (!header?.startsWith("Basic ")) return false

  const decoded = Buffer.from(header.slice("Basic ".length), "base64").toString(
    "utf8",
  )
  const separator = decoded.indexOf(":")
  if (separator === -1) return false

  const username = decoded.slice(0, separator)
  const password = decoded.slice(separator + 1)
  return username === USERNAME && password === PASSWORD
}

function normalizeState(value: unknown): AppState {
  const state = value as Partial<AppState>
  return {
    tasks: Array.isArray(state?.tasks) ? state.tasks : [],
    subjects: Array.isArray(state?.subjects) ? state.subjects : [],
  }
}

function isAppState(value: unknown): value is AppState {
  return Boolean(
    value &&
      typeof value === "object" &&
      Array.isArray((value as AppState).tasks),
  )
}

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  if (!isAuthorized(request)) return unauthorized(response)

  if (request.method !== "GET" && request.method !== "PUT") {
    response.setHeader("Allow", "GET, PUT")
    return response.status(405).json({ error: "Method not allowed." })
  }

  try {
    if (request.method === "GET") {
      const state = await getState()
      if (state) return response.status(200).json(normalizeState(state))

      await setState(SEED_STATE)
      return response.status(200).json(SEED_STATE)
    }

    if (!isAppState(request.body)) {
      return response.status(400).json({ error: "Invalid task data." })
    }

    const nextState = normalizeState(request.body)
    await setState(nextState)
    return response.status(200).json(nextState)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to access shared storage."
    return response.status(500).json({ error: message })
  }
}
