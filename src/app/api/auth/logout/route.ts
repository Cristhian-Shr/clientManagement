import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Criar resposta de sucesso
    const response = NextResponse.json({ success: true })
    
    // Remover cookies de autenticação
    response.cookies.delete('auth-token')
    response.cookies.delete('user-data')
    
    return response
  } catch (error) {
    console.error("Erro no logout:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 