import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Buscar pagamento específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
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

    if (!payment) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar pagamento
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { contractId, clientId, amount, dueDate, paymentDate, status, paymentMethod, description } = body

    // Validar dados obrigatórios
    if (!contractId || !clientId || !amount || !dueDate || !status || !paymentMethod) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Atualizar o pagamento
    const payment = await prisma.payment.update({
      where: { id: params.id },
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

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir pagamento
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Tentando excluir pagamento:', params.id)

    // Verificar se o pagamento existe
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        contract: {
          include: {
            service: true
          }
        }
      }
    })

    if (!payment) {
      console.log('Pagamento não encontrado:', params.id)
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      )
    }

    console.log('Pagamento encontrado, excluindo:', {
      id: payment.id,
      client: payment.client.name,
      amount: payment.amount,
      status: payment.status
    })

    // Excluir o pagamento
    await prisma.payment.delete({
      where: { id: params.id }
    })

    console.log('Pagamento excluído com sucesso:', params.id)
    return NextResponse.json({ 
      message: 'Pagamento excluído com sucesso',
      deletedPayment: {
        id: payment.id,
        client: payment.client.name,
        amount: payment.amount,
        status: payment.status
      }
    })
  } catch (error) {
    console.error('Erro ao excluir pagamento:', error)
    
    // Verificar se é um erro de constraint
    if (error instanceof Error) {
      if (error.message.includes('foreign key constraint')) {
        return NextResponse.json(
          { error: 'Não é possível excluir este pagamento pois está relacionado a outros registros' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Record to delete does not exist')) {
        return NextResponse.json(
          { error: 'Pagamento não encontrado' },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor ao excluir pagamento' },
      { status: 500 }
    )
  }
} 