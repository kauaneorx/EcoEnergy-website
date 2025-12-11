import { NextResponse } from "next/server"
import { UserDB } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { name, emailOrPhone, password } = body

    if (!name || !emailOrPhone || !password) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Senha deve ter no mínimo 6 caracteres" }, { status: 400 })
    }

    const existingUser = UserDB.getByEmailOrPhone(emailOrPhone)
    if (existingUser) {
      return NextResponse.json({ error: "Email ou telefone já cadastrado" }, { status: 400 })
    }

    const isEmail = emailOrPhone.includes("@")

    const newUser = UserDB.create({
      id: Date.now().toString(),
      name,
      email: isEmail ? emailOrPhone : "",
      phone: !isEmail ? emailOrPhone : "",
      password,
      createdAt: new Date().toISOString(),
    })

    const token = Buffer.from(`${newUser.id}:${Date.now()}`).toString("base64")

    const response = NextResponse.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
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
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 })
  }
}
