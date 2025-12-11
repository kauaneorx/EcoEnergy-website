import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { RecordDB } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id } = await params
    const record = RecordDB.getAll().find((r) => r.id === id)

    if (!record || record.userId !== user.id) {
      return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 })
    }

    const updates = await request.json()
    const updatedRecord = RecordDB.update(id, updates)

    return NextResponse.json({ record: updatedRecord })
  } catch (error) {
    console.error("[v0] Record update error:", error)
    return NextResponse.json({ error: "Erro ao atualizar registro" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id } = await params
    const record = RecordDB.getAll().find((r) => r.id === id)

    if (!record || record.userId !== user.id) {
      return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 })
    }

    RecordDB.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Record delete error:", error)
    return NextResponse.json({ error: "Erro ao deletar registro" }, { status: 500 })
  }
}
