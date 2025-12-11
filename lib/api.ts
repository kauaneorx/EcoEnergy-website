// lib/api.ts
export async function apiRequest(
  url: string, 
  options: RequestInit = {}, 
  token?: string
): Promise<any> {
  // Inicializa headers como objeto string
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      headers[key] = String(value)
    })
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API Error: ${response.status} - ${error}`)
  }

  return response.json()
}