import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
export const dynamic = "force-dynamic"

interface User {
  id: string | null
  name?: string | null
  email?: string | null
  phone?: string | null
  photoUrl?: string | null
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const user = (await getCurrentUser()) as User | null

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const {
      id = null,
      name = null,
      email = null,
      phone = null,
      photoUrl = null,
    } = user

    return NextResponse.json({
      user: {
        id,
        name,
        email,
        phone,
        photoUrl,
      },
    })
  } catch (err: unknown) {
    console.error("[v0] Auth verification error:", err)

    let message = "Erro interno"
    let status = 500

    if (err instanceof Error) {
      if (/token|jwt|auth/i.test(err.message)) {
        message = "Token inválido"
        status = 401
      } else if (err.message) {
        message = err.message
      }
    }

    return NextResponse.json({ error: message }, { status })
  }
}
