import { cookies } from "next/headers"
import { UserDB } from "./db"

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get("auth-token")?.value || null
}

export async function getUserFromToken(token: string) {
  try {
    // Decodificar token simples (em produção, usar JWT)
    const decoded = Buffer.from(token, "base64").toString()
    const [userId] = decoded.split(":")

    const user = UserDB.getById(userId)
    return user || null
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const token = await getAuthToken()
  if (!token) return null

  return getUserFromToken(token)
}

export function setAuthToken(token: string) {
  // Esta função será chamada no cliente
  document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 dias
}

export function clearAuthToken() {
  document.cookie = "auth-token=; path=/; max-age=0"
}
