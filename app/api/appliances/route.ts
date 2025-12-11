import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { ApplianceDB } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const appliances = ApplianceDB.getByUserId(user.id)
    return NextResponse.json({ appliances })
  } catch (error) {
    console.error("[v0] Appliances get error:", error)
    return NextResponse.json({ error: "Erro ao buscar aparelhos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { name, powerWatts } = await request.json()

    if (!name || !powerWatts) {
      return NextResponse.json({ error: "Nome e potência são obrigatórios" }, { status: 400 })
    }

    const appliance = ApplianceDB.create({
      id: Date.now().toString(),
      userId: user.id,
      name,
      powerWatts: Number(powerWatts),
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ appliance })
  } catch (error) {
    console.error("[v0] Appliance create error:", error)
    return NextResponse.json({ error: "Erro ao criar aparelho" }, { status: 500 })
  }
}
