// lib/api.ts
export async function apiRequest(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<any> {
  // Cria headers como objeto seguro
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  // headers das opções
  if (options.headers) {
    const optionHeaders = options.headers as Record<string, string>
    for (const [key, value] of Object.entries(optionHeaders)) {
      headers[key] = value
    }
  }

  //Authorization token
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  //requisição
  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API Error: ${response.status} - ${error}`)
  }

  return response.json()
}