import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { RecordDB } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let records
    if (startDate && endDate) {
      records = RecordDB.getByUserIdAndDateRange(user.id, startDate, endDate)
    } else {
      records = RecordDB.getByUserId(user.id)
    }

    return NextResponse.json({ records })
  } catch (error) {
    console.error("[v0] Records get error:", error)
    return NextResponse.json({ error: "Erro ao buscar registros" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { applianceId, date, hoursUsed } = await request.json()

    if (!applianceId || !date || hoursUsed === undefined) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    const record = RecordDB.create({
      id: Date.now().toString(),
      userId: user.id,
      applianceId,
      date,
      hoursUsed: Number(hoursUsed),
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ record })
  } catch (error) {
    console.error("[v0] Record create error:", error)
    return NextResponse.json({ error: "Erro ao criar registro" }, { status: 500 })
  }
}
