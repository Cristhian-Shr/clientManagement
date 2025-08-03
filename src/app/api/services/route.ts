import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Listar todos os serviços
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        subServices: true,
        _count: {
          select: {
            contracts: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    })

    // Buscar todos os planos
    const plans = await prisma.plan.findMany()

    // Formatar os dados para incluir o número de contratos e planos
    const formattedServices = services.map(service => ({
      ...service,
      contracts: service._count.contracts,
      plans: service.type === 'SOCIAL_MEDIA' ? plans : []
    }))

    return NextResponse.json(formattedServices)
  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo serviço
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, type, basePrice, subServices, plans, trafficDiscount } = body

    // Validar dados obrigatórios
    if (!name || !description || !type) {
      return NextResponse.json(
        { error: 'Nome, descrição e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar o serviço
    const service = await prisma.service.create({
      data: {
        name,
        description,
        type,
        basePrice: basePrice || 0,
        trafficDiscount: trafficDiscount || null,
      }
    })

    // Criar sub-serviços se for do tipo PAID_TRAFFIC
    if (type === 'PAID_TRAFFIC' && subServices && subServices.length > 0) {
      await Promise.all(
        subServices.map((subService: any) =>
          prisma.subService.create({
            data: {
              name: subService.name,
              description: subService.description,
              price: subService.price || 0,
              serviceId: service.id,
            }
          })
        )
      )
    }

    // Criar planos se for do tipo SOCIAL_MEDIA
    if (type === 'SOCIAL_MEDIA' && plans && plans.length > 0) {
      await Promise.all(
        plans.map((plan: any) =>
          prisma.plan.create({
            data: {
              name: plan.name,
              description: plan.description,
              postsPerMonth: plan.postsPerMonth || 0,
              price: plan.price || 0,
              serviceId: service.id,
            }
          })
        )
      )
    }

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 