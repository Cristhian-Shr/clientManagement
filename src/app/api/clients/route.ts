/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Listar todos os clientes
export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        contracts: {
          include: {
            service: true,
            subService: true,
            plan: true
          }
        }
      }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, serviceStartDate, services, customDiscount } = body

    // Validar dados obrigatórios
    if (!name || !email || !phone || !company || !serviceStartDate) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar e-mail
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'E-mail inválido' },
        { status: 400 }
      )
    }

    // Verificar se o e-mail já existe
    const existingClient = await prisma.client.findUnique({
      where: { email }
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'Já existe um cliente com este e-mail' },
        { status: 400 }
      )
    }

    console.log('Dados recebidos para criação de cliente:', { name, email, phone, company, serviceStartDate, services })

    const result = await prisma.$transaction(async (tx) => {
      // Criar o cliente
      const client = await tx.client.create({
        data: {
          name,
          email,
          phone,
          company,
          serviceStartDate: new Date(serviceStartDate)
        }
      })

      console.log('Cliente criado:', client.id)

      const contracts = []
      const payments = []

      if (services && Array.isArray(services) && services.length > 0) {
        console.log('Criando contratos e pagamentos para os serviços:', services)

        // Calcular desconto personalizado se aplicável
        let customDiscountMultiplier = 1.0
        let customDiscountAmount = 0
        if (customDiscount && customDiscount.enabled) {
          if (customDiscount.type === 'percentage') {
            customDiscountMultiplier = 1 - (customDiscount.value / 100)
          } else if (customDiscount.type === 'fixed') {
            customDiscountAmount = customDiscount.value
          }
        }

        for (const serviceData of services) {
          const { serviceId, subServiceId, subServiceIds, planId } = serviceData
          
          // Validar se o serviço existe
          const service = await tx.service.findUnique({
            where: { id: serviceId },
            include: {
              subServices: true,
              ...(serviceId === 'social-media' ? { plans: true } : {})
            }
          })
          
          if (!service) {
            throw new Error(`Serviço com ID ${serviceId} não encontrado`)
          }

          // Determinar quais sub-serviços foram selecionados
          let selectedSubServiceIds: string[] = []
          if (subServiceIds && subServiceIds.length > 0) {
            selectedSubServiceIds = subServiceIds
          } else if (subServiceId) {
            selectedSubServiceIds = [subServiceId]
          }

          // Para Tráfego Pago, criar um contrato por sub-serviço selecionado
          if (service.type === 'PAID_TRAFFIC' && selectedSubServiceIds.length > 0) {
            // Verificar se há configuração de desconto
            let discountMultiplier = 1.0
            if (selectedSubServiceIds.length === 2 && service.trafficDiscount) {
              const discountConfig = service.trafficDiscount as any
              if (discountConfig.enabled && discountConfig.percentage > 0) {
                discountMultiplier = 1 - (discountConfig.percentage / 100)
              }
            }

            // Aplicar desconto personalizado adicional
            discountMultiplier *= customDiscountMultiplier

            for (const subServiceId of selectedSubServiceIds) {
              const subService = service.subServices.find(ss => ss.id === subServiceId)
              if (!subService) {
                throw new Error(`Sub-serviço com ID ${subServiceId} não encontrado`)
              }

              // Calcular valor com desconto
              let contractAmount = subService.price * discountMultiplier
              
              // Aplicar desconto fixo se aplicável
              if (customDiscountAmount > 0) {
                contractAmount = Math.max(0, contractAmount - customDiscountAmount)
              }

              // Criar contrato
              const contract = await tx.contract.create({
                data: {
                  clientId: client.id,
                  serviceId,
                  subServiceId,
                  planId: null,
                  status: 'ACTIVE',
                  startDate: new Date(serviceStartDate)
                },
                include: {
                  service: true,
                  subService: true,
                  plan: true
                }
              })
              
              contracts.push(contract)
              console.log('Contrato criado:', contract.id, 'Valor:', contractAmount, 'Sub-serviço:', subService.name)

              // Criar pagamento inicial
              const payment = await tx.payment.create({
                data: {
                  contractId: contract.id,
                  clientId: client.id,
                  amount: contractAmount,
                  dueDate: new Date(serviceStartDate),
                  status: 'PENDING',
                  paymentMethod: 'PIX',
                  description: `Pagamento inicial - ${service.name} - ${subService.name}${discountMultiplier < 1 || customDiscountAmount > 0 ? ' (com desconto)' : ''}`
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
              
              payments.push(payment)
              console.log('Pagamento criado:', payment.id, 'Valor:', payment.amount)
            }
          } else {
            // Para outros tipos de serviço, usar lógica existente
            let contractAmount = service.basePrice
            
            // Adicionar valor do subserviço se existir
            if (subServiceId && service.subServices) {
              const subService = service.subServices.find(ss => ss.id === subServiceId)
              if (subService) {
                contractAmount = subService.price
              }
            }
            
            // Adicionar valor do plano se existir
            if (planId && service.plans) {
              const plan = service.plans.find(p => p.id === planId)
              if (plan) {
                contractAmount = plan.price
              }
            }

            // Aplicar desconto personalizado
            contractAmount *= customDiscountMultiplier
            if (customDiscountAmount > 0) {
              contractAmount = Math.max(0, contractAmount - customDiscountAmount)
            }

            // Criar contrato
            const contract = await tx.contract.create({
              data: {
                clientId: client.id,
                serviceId,
                subServiceId: subServiceId || null,
                planId: planId || null,
                status: 'ACTIVE',
                startDate: new Date(serviceStartDate)
              },
              include: {
                service: true,
                subService: true,
                plan: true
              }
            })
            
            contracts.push(contract)
            console.log('Contrato criado:', contract.id, 'Valor:', contractAmount)

            // Criar pagamento inicial
            const payment = await tx.payment.create({
              data: {
                contractId: contract.id,
                clientId: client.id,
                amount: contractAmount,
                dueDate: new Date(serviceStartDate),
                status: 'PENDING',
                paymentMethod: 'PIX',
                description: `Pagamento inicial - ${service.name}${customDiscountMultiplier < 1 ? ' (com desconto personalizado)' : ''}`
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
            
            payments.push(payment)
            console.log('Pagamento criado:', payment.id, 'Valor:', payment.amount)
          }
        }
        
        console.log('Cliente, contratos e pagamentos criados com sucesso')
      }

      return { client, contracts, payments }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar cliente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, email, phone, company, serviceStartDate, services, customDiscount } = body

    // Validação básica
    if (!id || !name || !email || !phone || !company || !serviceStartDate) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      )
    }

    // Verificar se o cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id }
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o email já existe em outro cliente
    const emailExists = await prisma.client.findFirst({
      where: {
        email,
        id: { not: id }
      }
    })

    if (emailExists) {
      return NextResponse.json(
        { error: 'Já existe um cliente com este e-mail' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      // Atualizar o cliente
      const client = await tx.client.update({
        where: { id },
        data: {
          name,
          email,
          phone,
          company,
          serviceStartDate: new Date(serviceStartDate)
        }
      })

      // Remover contratos e pagamentos existentes
      await tx.payment.deleteMany({
        where: { clientId: id }
      })
      
      await tx.contract.deleteMany({
        where: { clientId: id }
      })

      const contracts = []
      const payments = []

      // Recriar contratos e pagamentos se serviços foram fornecidos
      if (services && Array.isArray(services) && services.length > 0) {
        console.log('Recriando contratos e pagamentos para os serviços:', services)

        // Calcular desconto personalizado se aplicável
        let customDiscountMultiplier = 1.0
        let customDiscountAmount = 0
        if (customDiscount && customDiscount.enabled) {
          if (customDiscount.type === 'percentage') {
            customDiscountMultiplier = 1 - (customDiscount.value / 100)
          } else if (customDiscount.type === 'fixed') {
            customDiscountAmount = customDiscount.value
          }
        }

        for (const serviceData of services) {
          const { serviceId, subServiceId, subServiceIds, planId } = serviceData
          
          // Validar se o serviço existe
          const service = await tx.service.findUnique({
            where: { id: serviceId },
            include: {
              subServices: true,
              ...(serviceId === 'social-media' ? { plans: true } : {})
            }
          })
          
          if (!service) {
            throw new Error(`Serviço com ID ${serviceId} não encontrado`)
          }

          // Determinar quais sub-serviços foram selecionados
          let selectedSubServiceIds: string[] = []
          if (subServiceIds && subServiceIds.length > 0) {
            selectedSubServiceIds = subServiceIds
          } else if (subServiceId) {
            selectedSubServiceIds = [subServiceId]
          }

          // Para Tráfego Pago, criar um contrato por sub-serviço selecionado
          if (service.type === 'PAID_TRAFFIC' && selectedSubServiceIds.length > 0) {
            // Verificar se há configuração de desconto
            let discountMultiplier = 1.0
            if (selectedSubServiceIds.length === 2 && service.trafficDiscount) {
              const discountConfig = service.trafficDiscount as any
              if (discountConfig.enabled && discountConfig.percentage > 0) {
                discountMultiplier = 1 - (discountConfig.percentage / 100)
              }
            }

            // Aplicar desconto personalizado adicional
            discountMultiplier *= customDiscountMultiplier

            for (const subServiceId of selectedSubServiceIds) {
              const subService = service.subServices.find(ss => ss.id === subServiceId)
              if (!subService) {
                throw new Error(`Sub-serviço com ID ${subServiceId} não encontrado`)
              }

              // Calcular valor com desconto
              let contractAmount = subService.price * discountMultiplier
              
              // Aplicar desconto fixo se aplicável
              if (customDiscountAmount > 0) {
                contractAmount = Math.max(0, contractAmount - customDiscountAmount)
              }

              // Criar contrato
              const contract = await tx.contract.create({
                data: {
                  clientId: client.id,
                  serviceId,
                  subServiceId,
                  planId: null,
                  status: 'ACTIVE',
                  startDate: new Date(serviceStartDate)
                },
                include: {
                  service: true,
                  subService: true,
                  plan: true
                }
              })
              
              contracts.push(contract)
              console.log('Contrato recriado:', contract.id, 'Valor:', contractAmount, 'Sub-serviço:', subService.name)

              // Criar pagamento inicial
              const payment = await tx.payment.create({
                data: {
                  contractId: contract.id,
                  clientId: client.id,
                  amount: contractAmount,
                  dueDate: new Date(serviceStartDate),
                  status: 'PENDING',
                  paymentMethod: 'PIX',
                  description: `Pagamento inicial - ${service.name} - ${subService.name}${discountMultiplier < 1 || customDiscountAmount > 0 ? ' (com desconto)' : ''}`
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
              
              payments.push(payment)
              console.log('Pagamento recriado:', payment.id, 'Valor:', payment.amount)
            }
          } else {
            // Para outros tipos de serviço, usar lógica existente
            let contractAmount = service.basePrice
            
            // Adicionar valor do subserviço se existir
            if (subServiceId && service.subServices) {
              const subService = service.subServices.find(ss => ss.id === subServiceId)
              if (subService) {
                contractAmount = subService.price
              }
            }
            
            // Adicionar valor do plano se existir
            if (planId && service.plans) {
              const plan = service.plans.find(p => p.id === planId)
              if (plan) {
                contractAmount = plan.price
              }
            }

            // Aplicar desconto personalizado
            contractAmount *= customDiscountMultiplier
            if (customDiscountAmount > 0) {
              contractAmount = Math.max(0, contractAmount - customDiscountAmount)
            }

            // Criar contrato
            const contract = await tx.contract.create({
              data: {
                clientId: client.id,
                serviceId,
                subServiceId: subServiceId || null,
                planId: planId || null,
                status: 'ACTIVE',
                startDate: new Date(serviceStartDate)
              },
              include: {
                service: true,
                subService: true,
                plan: true
              }
            })
            
            contracts.push(contract)
            console.log('Contrato recriado:', contract.id, 'Valor:', contractAmount)

            // Criar pagamento inicial
            const payment = await tx.payment.create({
              data: {
                contractId: contract.id,
                clientId: client.id,
                amount: contractAmount,
                dueDate: new Date(serviceStartDate),
                status: 'PENDING',
                paymentMethod: 'PIX',
                description: `Pagamento inicial - ${service.name}${customDiscountMultiplier < 1 ? ' (com desconto personalizado)' : ''}`
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
            
            payments.push(payment)
            console.log('Pagamento recriado:', payment.id, 'Valor:', payment.amount)
          }
        }
        
        console.log('Cliente, contratos e pagamentos atualizados com sucesso')
      }

      return { client, contracts, payments }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir cliente
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID do cliente é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id }
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Excluir o cliente
    await prisma.client.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Cliente excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}