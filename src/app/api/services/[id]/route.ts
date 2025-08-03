import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Buscar serviço específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        subServices: true,
        plans: true
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Erro ao buscar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar serviço
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, type, basePrice, subServices, plans, trafficDiscount } = body

    // Validação básica
    if (!name || !description || !type) {
      return NextResponse.json(
        { error: 'Nome, descrição e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o serviço existe
    const existingService = await prisma.service.findUnique({
      where: { id }
    })

    if (!existingService) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar o serviço
    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        type,
        basePrice: basePrice || 0,
        trafficDiscount: trafficDiscount || null,
      }
    })

    // Atualizar sub-serviços se for do tipo PAID_TRAFFIC
    if (type === 'PAID_TRAFFIC') {
      // Remover sub-serviços existentes
      await prisma.subService.deleteMany({
        where: { serviceId: id }
      })

      // Criar novos sub-serviços
      if (subServices && subServices.length > 0) {
        await Promise.all(
          subServices.map((subService: any) =>
            prisma.subService.create({
              data: {
                name: subService.name,
                description: subService.description,
                price: subService.price || 0,
                serviceId: id,
              }
            })
          )
        )
      }
    }

    // Atualizar planos se for do tipo SOCIAL_MEDIA
    if (type === 'SOCIAL_MEDIA') {
      // Remover planos existentes
      await prisma.plan.deleteMany()

      // Criar novos planos
      if (plans && plans.length > 0) {
        await Promise.all(
          plans.map((plan: any) =>
            prisma.plan.create({
              data: {
                name: plan.name,
                description: plan.description,
                postsPerMonth: plan.postsPerMonth || 0,
                price: plan.price || 0,
              }
            })
          )
        )
      }
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir serviço
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verificar se o serviço tem contratos ativos
    const activeContracts = await prisma.contract.count({
      where: {
        serviceId: id,
        status: 'ACTIVE'
      }
    })

    if (activeContracts > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir um serviço com contratos ativos' },
        { status: 400 }
      )
    }

    // Excluir o serviço (os sub-serviços serão excluídos automaticamente devido ao onDelete: Cascade)
    await prisma.service.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Serviço excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 