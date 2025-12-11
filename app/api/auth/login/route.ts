import { NextResponse } from "next/server"
import { UserDB } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { emailOrPhone, password } = body

    if (!emailOrPhone || !password) {
      return NextResponse.json({ error: "Email/telefone e senha são obrigatórios" }, { status: 400 })
    }

    const user = UserDB.getByEmailOrPhone(emailOrPhone)

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Credenciais incorretas" }, { status: 401 })
    }

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64")

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        photoUrl: user.photoUrl,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar login" }, { status: 500 })
  }
}
