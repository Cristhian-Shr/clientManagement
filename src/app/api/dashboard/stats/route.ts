import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Buscar estatísticas do dashboard
export async function GET() {
  try {
    // Contar total de clientes
    const totalClients = await prisma.client.count()

    // Contar contratos ativos
    const totalContracts = await prisma.contract.count({
      where: {
        status: 'ACTIVE'
      }
    })

    // Calcular receita total (pagamentos com status PAID)
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        status: 'PAID'
      },
      _sum: {
        amount: true
      }
    })

    // Buscar pagamentos pendentes com detalhes
    const pendingPaymentsData = await prisma.payment.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        client: true,
        contract: {
          include: {
            service: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    })

    const pendingPayments = pendingPaymentsData.length

    // Calcular valor total dos pagamentos pendentes - usando soma direta
    const pendingAmountSum = pendingPaymentsData.reduce((sum, payment) => sum + Number(payment.amount), 0)



    // Formatar pagamentos pendentes para exibição
    const formattedPendingPayments = pendingPaymentsData.map(payment => ({
      id: payment.id,
      client: payment.client.name,
      service: payment.contract.service.name,
      amount: payment.amount,
      dueDate: payment.dueDate.toISOString().split('T')[0],
      description: payment.description
    }))

    // Buscar pagamentos recentes (últimos 5)
    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        client: true
      }
    })

    // Formatar pagamentos recentes
    const formattedRecentPayments = recentPayments.map(payment => ({
      id: payment.id,
      client: payment.client.name,
      amount: payment.amount,
      status: payment.status,
      date: payment.paymentDate ? payment.paymentDate.toISOString().split('T')[0] : payment.dueDate.toISOString().split('T')[0]
    }))

    // Calcular estatísticas por serviço
    const serviceStats = await prisma.contract.groupBy({
      by: ['serviceId'],
      where: {
        status: 'ACTIVE'
      },
      _count: {
        id: true
      }
    })

    // Buscar nomes dos serviços
    const serviceIds = serviceStats.map(stat => stat.serviceId)
    const services = await prisma.service.findMany({
      where: {
        id: {
          in: serviceIds
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    // Formatar estatísticas por serviço
    const formattedServiceStats = serviceStats.map(stat => {
      const service = services.find(s => s.id === stat.serviceId)
      return {
        service: service?.name || 'Serviço não encontrado',
        contracts: stat._count.id
      }
    })

    // Calcular crescimento (comparação com mês anterior)
    const currentMonth = new Date()
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)

    // Clientes do mês atual
    const currentMonthClients = await prisma.client.count({
      where: {
        createdAt: {
          gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        }
      }
    })

    // Clientes do mês anterior
    const lastMonthClients = await prisma.client.count({
      where: {
        createdAt: {
          gte: lastMonth,
          lt: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        }
      }
    })

    // Receita do mês atual
    const currentMonthRevenue = await prisma.payment.aggregate({
      where: {
        status: 'PAID',
        paymentDate: {
          gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        }
      },
      _sum: {
        amount: true
      }
    })

    // Receita do mês anterior
    const lastMonthRevenue = await prisma.payment.aggregate({
      where: {
        status: 'PAID',
        paymentDate: {
          gte: lastMonth,
          lt: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        }
      },
      _sum: {
        amount: true
      }
    })

    // Calcular percentual de crescimento
    const clientGrowth = lastMonthClients > 0 
      ? Math.round(((currentMonthClients - lastMonthClients) / lastMonthClients) * 100)
      : currentMonthClients > 0 ? 100 : 0

    const revenueGrowth = (lastMonthRevenue._sum.amount || 0) > 0
      ? Math.round(((currentMonthRevenue._sum.amount || 0) - (lastMonthRevenue._sum.amount || 0)) / (lastMonthRevenue._sum.amount || 0) * 100)
      : (currentMonthRevenue._sum.amount || 0) > 0 ? 100 : 0

    const response = {
      stats: {
        totalClients,
        totalContracts,
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingPayments,
        pendingAmount: pendingAmountSum
      },
      recentPayments: formattedRecentPayments,
      pendingPayments: formattedPendingPayments,
      serviceStats: formattedServiceStats,
      growth: {
        clients: clientGrowth,
        revenue: revenueGrowth
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 