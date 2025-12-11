import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { ApplianceDB } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id } = await params
    const appliance = ApplianceDB.getById(id)

    if (!appliance || appliance.userId !== user.id) {
      return NextResponse.json({ error: "Aparelho não encontrado" }, { status: 404 })
    }

    const updates = await request.json()
    const updatedAppliance = ApplianceDB.update(id, updates)

    return NextResponse.json({ appliance: updatedAppliance })
  } catch (error) {
    console.error("[v0] Appliance update error:", error)
    return NextResponse.json({ error: "Erro ao atualizar aparelho" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id } = await params
    const appliance = ApplianceDB.getById(id)

    if (!appliance || appliance.userId !== user.id) {
      return NextResponse.json({ error: "Aparelho não encontrado" }, { status: 404 })
    }

    ApplianceDB.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Appliance delete error:", error)
    return NextResponse.json({ error: "Erro ao deletar aparelho" }, { status: 500 })
  }
}
