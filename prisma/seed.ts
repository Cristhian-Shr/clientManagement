import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuários administradores
  const admin1Password = await hashPassword('admin123')
  const admin2Password = await hashPassword('admin456')

  const admin1 = await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      email: 'admin@empresa.com',
      password: admin1Password,
      name: 'Administrador Principal',
      role: 'ADMIN',
    },
  })

  const admin2 = await prisma.user.upsert({
    where: { email: 'gerente@empresa.com' },
    update: {},
    create: {
      email: 'gerente@empresa.com',
      password: admin2Password,
      name: 'Gerente de Projetos',
      role: 'MANAGER',
    },
  })

  console.log('✅ Usuários criados:', { admin1: admin1.email, admin2: admin2.email })

  // Criar serviços
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 'web-dev' },
      update: {},
      create: {
        id: 'web-dev',
        name: 'Desenvolvimento Web',
        description: 'Criação de sites institucionais, e-commerces e landing pages',
        type: 'WEB_DEVELOPMENT',
        basePrice: 2500,
      },
    }),
    prisma.service.upsert({
      where: { id: 'paid-traffic' },
      update: {},
      create: {
        id: 'paid-traffic',
        name: 'Tráfego Pago',
        description: 'Gestão de campanhas no Meta Ads e Google Ads',
        type: 'PAID_TRAFFIC',
        basePrice: 1800,
      },
    }),
    prisma.service.upsert({
      where: { id: 'hosting' },
      update: {},
      create: {
        id: 'hosting',
        name: 'Hospedagem de Sites',
        description: 'Servidores otimizados para performance, backups automáticos e SSL incluso',
        type: 'HOSTING',
        basePrice: 150,
      },
    }),
    prisma.service.upsert({
      where: { id: 'social-media' },
      update: {},
      create: {
        id: 'social-media',
        name: 'Social Media',
        description: 'Planejamento e execução de conteúdo para redes sociais',
        type: 'SOCIAL_MEDIA',
        basePrice: 0,
      },
    }),
  ])

  console.log('✅ Serviços criados:', services.length)

  // Criar sub-serviços para Tráfego Pago
  const subServices = await Promise.all([
    prisma.subService.upsert({
      where: { id: 'meta-ads' },
      update: {},
      create: {
        id: 'meta-ads',
        name: 'Meta Ads (Facebook/Instagram)',
        description: 'Campanhas no Facebook e Instagram',
        price: 1200,
        serviceId: 'paid-traffic',
      },
    }),
    prisma.subService.upsert({
      where: { id: 'google-ads' },
      update: {},
      create: {
        id: 'google-ads',
        name: 'Google Ads',
        description: 'Campanhas no Google Search e Display',
        price: 1500,
        serviceId: 'paid-traffic',
      },
    }),
  ])

  console.log('✅ Sub-serviços criados:', subServices.length)

  // Criar planos para Social Media
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { id: 'start' },
      update: {},
      create: {
        id: 'start',
        name: 'Plano Start',
        description: 'Até 4 posts/mês',
        postsPerMonth: 4,
        price: 500,
        serviceId: 'social-media',
      },
    }),
    prisma.plan.upsert({
      where: { id: 'pro' },
      update: {},
      create: {
        id: 'pro',
        name: 'Plano Pro',
        description: 'Até 8 posts/mês',
        postsPerMonth: 8,
        price: 800,
        serviceId: 'social-media',
      },
    }),
    prisma.plan.upsert({
      where: { id: 'business' },
      update: {},
      create: {
        id: 'business',
        name: 'Plano Business',
        description: 'Até 12 posts/mês',
        postsPerMonth: 12,
        price: 1200,
        serviceId: 'social-media',
      },
    }),
    prisma.plan.upsert({
      where: { id: 'premium' },
      update: {},
      create: {
        id: 'premium',
        name: 'Plano Premium',
        description: 'Conteúdo diário + stories + reels',
        postsPerMonth: 30,
        price: 2000,
        serviceId: 'social-media',
      },
    }),
  ])

  console.log('✅ Planos criados:', plans.length)

  // Criar clientes de exemplo
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: 'client-1' },
      update: {},
      create: {
        id: 'client-1',
        name: 'João Silva',
        email: 'joao@empresa.com',
        phone: '(11) 99999-9999',
        company: 'Empresa ABC',
        serviceStartDate: new Date('2024-01-15'),
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-2' },
      update: {},
      create: {
        id: 'client-2',
        name: 'Maria Santos',
        email: 'maria@startup.com',
        phone: '(11) 88888-8888',
        company: 'Startup XYZ',
        serviceStartDate: new Date('2024-01-10'),
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-3' },
      update: {},
      create: {
        id: 'client-3',
        name: 'Pedro Costa',
        email: 'pedro@consultoria.com',
        phone: '(11) 77777-7777',
        company: 'Consultoria 123',
        serviceStartDate: new Date('2024-01-05'),
      },
    }),
  ])

  console.log('✅ Clientes criados:', clients.length)

  // Criar contratos de exemplo
  const contracts = await Promise.all([
    prisma.contract.upsert({
      where: { id: 'contract-1' },
      update: {},
      create: {
        id: 'contract-1',
        clientId: 'client-1',
        serviceId: 'web-dev',
        status: 'ACTIVE',
        startDate: new Date('2024-01-15'),
      },
    }),
    prisma.contract.upsert({
      where: { id: 'contract-2' },
      update: {},
      create: {
        id: 'contract-2',
        clientId: 'client-2',
        serviceId: 'paid-traffic',
        subServiceId: 'meta-ads',
        status: 'ACTIVE',
        startDate: new Date('2024-01-10'),
      },
    }),
    prisma.contract.upsert({
      where: { id: 'contract-3' },
      update: {},
      create: {
        id: 'contract-3',
        clientId: 'client-3',
        serviceId: 'social-media',
        planId: 'pro',
        status: 'ACTIVE',
        startDate: new Date('2024-01-05'),
      },
    }),
  ])

  console.log('✅ Contratos criados:', contracts.length)

  // Criar pagamentos de exemplo
  const payments = await Promise.all([
    prisma.payment.upsert({
      where: { id: 'payment-1' },
      update: {},
      create: {
        id: 'payment-1',
        contractId: 'contract-1',
        clientId: 'client-1',
        amount: 2500,
        dueDate: new Date('2024-01-15'),
        paymentDate: new Date('2024-01-14'),
        status: 'PAID',
        paymentMethod: 'PIX',
        description: 'Pagamento mensal - Janeiro 2024',
      },
    }),
    prisma.payment.upsert({
      where: { id: 'payment-2' },
      update: {},
      create: {
        id: 'payment-2',
        contractId: 'contract-2',
        clientId: 'client-2',
        amount: 1800,
        dueDate: new Date('2024-01-20'),
        status: 'PENDING',
        paymentMethod: 'BANK_TRANSFER',
        description: 'Pagamento mensal - Janeiro 2024',
      },
    }),
    prisma.payment.upsert({
      where: { id: 'payment-3' },
      update: {},
      create: {
        id: 'payment-3',
        contractId: 'contract-3',
        clientId: 'client-3',
        amount: 1200,
        dueDate: new Date('2024-01-10'),
        status: 'OVERDUE',
        paymentMethod: 'CREDIT_CARD',
        description: 'Pagamento mensal - Janeiro 2024',
      },
    }),
  ])

  console.log('✅ Pagamentos criados:', payments.length)

  console.log('🎉 Seed concluído com sucesso!')
  console.log('📧 Credenciais de acesso:')
  console.log('   Admin 1: admin@empresa.com / admin123')
  console.log('   Admin 2: gerente@empresa.com / admin456')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 