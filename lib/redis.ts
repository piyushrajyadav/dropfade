interface RedisResponse {
  result?: any
  error?: string
}

class RedisClient {
  private baseUrl: string
  private token: string

  constructor() {
    this.baseUrl = process.env.UPSTASH_REDIS_REST_URL!
    this.token = process.env.UPSTASH_REDIS_REST_TOKEN!

    if (!this.baseUrl || !this.token) {
      console.error("Missing Redis configuration:", {
        hasUrl: !!this.baseUrl,
        hasToken: !!this.token,
      })
    }
  }

  private async request(command: string[]): Promise<RedisResponse> {
    try {
      console.log("Redis request:", command[0], "to", this.baseUrl)

      const response = await fetch(`${this.baseUrl}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      })

      const data = await response.json()
      console.log("Redis response:", { status: response.status, data })

      if (!response.ok) {
        console.error("Redis HTTP error:", response.status, data)
        throw new Error(`Redis request failed: ${response.status} ${data.error || response.statusText}`)
      }

      return data
    } catch (error) {
      console.error("Redis error details:", error)
      return { error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      const command = ttlSeconds ? ["SETEX", key, ttlSeconds.toString(), value] : ["SET", key, value]

      console.log("Setting Redis key:", key, "with TTL:", ttlSeconds)
      const response = await this.request(command)

      if (response.error) {
        console.error("Redis SET error:", response.error)
        return false
      }

      console.log("Redis SET success:", response.result)
      return response.result === "OK"
    } catch (error) {
      console.error("Redis SET exception:", error)
      return false
    }
  }

  // Keep other methods the same but add logging
  async get(key: string): Promise<string | null> {
    console.log("Getting Redis key:", key)
    const response = await this.request(["GET", key])
    if (response.error) {
      console.error("Redis GET error:", response.error)
      return null
    }
    return response.result
  }

  async del(key: string): Promise<boolean> {
    console.log("Deleting Redis key:", key)
    const response = await this.request(["DEL", key])
    return !response.error && response.result === 1
  }

  async exists(key: string): Promise<boolean> {
    const response = await this.request(["EXISTS", key])
    return !response.error && response.result === 1
  }

  async ttl(key: string): Promise<number> {
    const response = await this.request(["TTL", key])
    if (response.error) return -1
    return response.result
  }

  // Add a test method
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.request(["PING"])
      return response.result === "PONG"
    } catch (error) {
      console.error("Redis connection test failed:", error)
      return false
    }
  }
}

export const redis = new RedisClient()

export interface DropData {
  type: "file" | "text"
  content: string // URL for files, text content for notes
  filename?: string
  expiresAt: number
  hasDownloaded: boolean
  createdAt: number
}

export async function saveDropData(code: string, data: DropData, ttlSeconds: number): Promise<boolean> {
  return await redis.set(`drop:${code}`, JSON.stringify(data), ttlSeconds)
}

export async function getDropData(code: string): Promise<DropData | null> {
  const data = await redis.get(`drop:${code}`)
  if (!data) return null

  try {
    return JSON.parse(data) as DropData
  } catch {
    return null
  }
}

export async function deleteDropData(code: string): Promise<boolean> {
  return await redis.del(`drop:${code}`)
}

export async function markAsDownloaded(code: string): Promise<boolean> {
  const data = await getDropData(code)
  if (!data) return false

  data.hasDownloaded = true
  const ttl = await redis.ttl(`drop:${code}`)
  return await redis.set(`drop:${code}`, JSON.stringify(data), ttl > 0 ? ttl : undefined)
}
