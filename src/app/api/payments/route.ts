import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Listar todos os pagamentos
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

    // Formatar os dados para a interface
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      client: payment.client.name,
      contract: payment.contract.service.name,
      amount: payment.amount,
      dueDate: payment.dueDate.toISOString().split('T')[0],
      paymentDate: payment.paymentDate ? payment.paymentDate.toISOString().split('T')[0] : null,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      description: payment.description,
      contractId: payment.contractId,
      clientId: payment.clientId
    }))

    return NextResponse.json(formattedPayments)
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo pagamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Dados recebidos na API:', body)
    const { contractId, clientId, amount, dueDate, paymentDate, status, paymentMethod, description } = body

    // Validar dados obrigatórios
    if (!contractId || !clientId || !amount || !dueDate || !status || !paymentMethod) {
      console.log('Dados obrigatórios faltando:', { contractId, clientId, amount, dueDate, status, paymentMethod })
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    console.log('Criando pagamento com dados:', { contractId, clientId, amount, dueDate, paymentDate, status, paymentMethod, description })

    // Criar o pagamento
    const payment = await prisma.payment.create({
      data: {
        contractId,
        clientId,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        status,
        paymentMethod,
        description: description || null,
      },
      include: {
        contract: {
          include: {
            service: true,
            client: true
          }
        },
        client: true
      }
    })

    console.log('Pagamento criado com sucesso:', payment.id)
    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 