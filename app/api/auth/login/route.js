import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'API funcionando!',
    user: { name: 'Usuário Teste', email: 'test@test.com' }
  })
}
