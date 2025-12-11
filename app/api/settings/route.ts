import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { SettingsDB } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const settings = SettingsDB.getByUserId(user.id)
    return NextResponse.json({ settings: settings || { userId: user.id, tariff: 0.85 } })
  } catch (error) {
    console.error("[v0] Settings get error:", error)
    return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { tariff } = await request.json()

    if (tariff === undefined || tariff < 0) {
      return NextResponse.json({ error: "Tarifa inválida" }, { status: 400 })
    }

    const settings = SettingsDB.upsert({
      userId: user.id,
      tariff: Number(tariff),
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("[v0] Settings update error:", error)
    return NextResponse.json({ error: "Erro ao atualizar configurações" }, { status: 500 })
  }
}
