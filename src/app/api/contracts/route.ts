import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Listar todos os contratos
export async function GET() {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        service: true,
        client: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(contracts)
  } catch (error) {
    console.error('Erro ao buscar contratos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo contrato
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, serviceId, subServiceId, planId, startDate, status = 'ACTIVE' } = body

    // Validação básica
    if (!clientId || !serviceId || !startDate) {
      return NextResponse.json(
        { error: 'Cliente, serviço e data de início são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o serviço existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o subserviço existe (se fornecido)
    if (subServiceId) {
      const subService = await prisma.subService.findUnique({
        where: { id: subServiceId }
      })

      if (!subService) {
        return NextResponse.json(
          { error: 'Subserviço não encontrado' },
          { status: 404 }
        )
      }
    }

    // Verificar se o plano existe (se fornecido)
    if (planId) {
      const plan = await prisma.plan.findUnique({
        where: { id: planId }
      })

      if (!plan) {
        return NextResponse.json(
          { error: 'Plano não encontrado' },
          { status: 404 }
        )
      }
    }

    // Criar o contrato
    const contract = await prisma.contract.create({
      data: {
        clientId,
        serviceId,
        subServiceId: subServiceId || null,
        planId: planId || null,
        startDate: new Date(startDate),
        status
      },
      include: {
        service: true,
        client: true,
        subService: true,
        plan: true
      }
    })

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar contrato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar contrato
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, serviceId, subServiceId, planId, startDate, status = 'ACTIVE' } = body

    // Validação básica
    if (!id || !serviceId || !startDate) {
      return NextResponse.json(
        { error: 'ID do contrato, serviço e data de início são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o contrato existe
    const existingContract = await prisma.contract.findUnique({
      where: { id }
    })

    if (!existingContract) {
      return NextResponse.json(
        { error: 'Contrato não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o serviço existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o subserviço existe (se fornecido)
    if (subServiceId) {
      const subService = await prisma.subService.findUnique({
        where: { id: subServiceId }
      })

      if (!subService) {
        return NextResponse.json(
          { error: 'Subserviço não encontrado' },
          { status: 404 }
        )
      }
    }

    // Verificar se o plano existe (se fornecido)
    if (planId) {
      const plan = await prisma.plan.findUnique({
        where: { id: planId }
      })

      if (!plan) {
        return NextResponse.json(
          { error: 'Plano não encontrado' },
          { status: 404 }
        )
      }
    }

    // Atualizar o contrato
    const contract = await prisma.contract.update({
      where: { id },
      data: {
        serviceId,
        subServiceId: subServiceId || null,
        planId: planId || null,
        startDate: new Date(startDate),
        status
      },
      include: {
        service: true,
        client: true,
        subService: true,
        plan: true
      }
    })

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Erro ao atualizar contrato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 