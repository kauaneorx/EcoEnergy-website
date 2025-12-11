import { NextResponse } from "next/server"
export const dynamic = 'force-dynamic'
export async function POST(request) {
  const body = await request.json()
  return NextResponse.json({
    success: true,
    message: "Login funcionando!",
    user: { name: "Usuário Teste", email: body.email }
  })
}
