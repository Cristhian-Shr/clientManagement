import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Listar todos os pagamentos para teste
export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        contract: {
          include: {
            service: true,
            client: true
          }
        },
        client: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      count: payments.length,
      payments: payments.map(payment => ({
        id: payment.id,
        client: payment.client.name,
        contract: payment.contract.service.name,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt
      }))
    })
  } catch (error) {
    console.error('Erro ao buscar pagamentos para teste:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 