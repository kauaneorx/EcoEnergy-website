// Fetch wrapper com interceptor de token
export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth_token")

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    // Token inválido ou expirado
    localStorage.removeItem("auth_token")
    window.location.href = "/login"
    throw new Error("Sessão expirada")
  }

  return response
}
