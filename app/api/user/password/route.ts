import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { UserDB } from "@/lib/db"

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    if (user.password !== currentPassword) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Nova senha deve ter no mínimo 6 caracteres" }, { status: 400 })
    }

    // Atualizar senha
    UserDB.update(user.id, { password: newPassword })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Password update error:", error)
    return NextResponse.json({ error: "Erro ao atualizar senha" }, { status: 500 })
  }
}
