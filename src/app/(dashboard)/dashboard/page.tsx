"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Package, TrendingUp } from "lucide-react"

// Dados mockados para fallback
const mockStats = {
  totalClients: 3,
  totalContracts: 3,
  totalRevenue: 2500, // Apenas o pagamento PAID (payment-1)
  pendingPayments: 1, // payment-2
  pendingAmount: 1800 // Valor do payment-2
}

const mockRecentPayments = [
  { id: "1", client: "João Silva", amount: 2500, status: "PAID", date: "2024-01-15" },
  { id: "2", client: "Maria Santos", amount: 1800, status: "PENDING", date: "2024-01-14" },
  { id: "3", client: "Pedro Costa", amount: 1200, status: "OVERDUE", date: "2024-01-13" },
]

export default function DashboardPage() {
  const [stats, setStats] = useState(mockStats)
  const [recentPayments, setRecentPayments] = useState(mockRecentPayments)
  const [pendingPayments, setPendingPayments] = useState([])
  const [growth, setGrowth] = useState({ clients: 0, revenue: 0 })
  const [serviceStats, setServiceStats] = useState([])
  const [loading, setLoading] = useState(true)

  // Buscar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
          setRecentPayments(data.recentPayments)
          setPendingPayments(data.pendingPayments || [])
          setGrowth(data.growth)
          setServiceStats(data.serviceStats || [])
        } else {
          console.error('Erro ao buscar dados do dashboard')
          // Usar dados mockados em caso de erro
        }
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error)
        // Usar dados mockados em caso de erro
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Dashboard</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Visão geral do seu negócio</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              {loading ? "..." : stats.totalClients}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {growth.clients > 0 ? `+${growth.clients}%` : growth.clients < 0 ? `${growth.clients}%` : '0%'} desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <Package className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              {loading ? "..." : stats.totalContracts}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Contratos em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? "..." : `R$ ${Number(stats.totalRevenue || 0).toLocaleString()}`}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {growth.revenue > 0 ? `+${growth.revenue}%` : growth.revenue < 0 ? `${growth.revenue}%` : '0%'} desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <CreditCard className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? "..." : stats.pendingPayments}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Pagamentos aguardando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Pendente</CardTitle>
            <CreditCard className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loading ? "..." : `R$ ${Number(stats.pendingAmount || 0).toLocaleString()}`}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Valor total em aberto
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pagamentos pendentes detalhados */}
      {stats.pendingPayments > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pagamentos Pendentes</CardTitle>
            <CardDescription>
              {stats.pendingPayments} pagamento(s) aguardando confirmação - Total: R$ {Number(stats.pendingAmount || 0).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPayments.map((payment: {
                id: string
                client: string
                service: string
                description?: string
                amount: number
                dueDate: string
              }) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--foreground)' }}>{payment.client}</p>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{payment.service}</p>
                    {payment.description && (
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{payment.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lg" style={{ color: 'var(--foreground)' }}>R$ {Number(payment.amount || 0).toLocaleString()}</p>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      Vence: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                    <span className="text-sm px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                      Pendente
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Dica:</strong> Acompanhe regularmente os pagamentos pendentes para manter o fluxo de caixa organizado.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas por serviço */}
      {serviceStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contratos por Serviço</CardTitle>
            <CardDescription>
              Distribuição de contratos ativos por tipo de serviço
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceStats.map((service: {
                service: string
                contracts: number
              }, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--foreground)' }}>{service.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{service.contracts}</p>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>contratos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagamentos recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos Recentes</CardTitle>
          <CardDescription>
            Últimos pagamentos processados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p style={{ color: 'var(--muted-foreground)' }}>Carregando pagamentos...</p>
              </div>
            </div>
          ) : recentPayments.length > 0 ? (
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--foreground)' }}>{payment.client}</p>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium" style={{ color: 'var(--foreground)' }}>R$ {Number(payment.amount || 0).toLocaleString()}</p>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      payment.status === "PAID" 
                        ? "bg-green-100 text-green-800" 
                        : payment.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : payment.status === "OVERDUE"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {payment.status === "PAID" ? "Pago" : 
                       payment.status === "PENDING" ? "Pendente" :
                       payment.status === "OVERDUE" ? "Vencido" : "Cancelado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p style={{ color: 'var(--muted-foreground)' }}>Nenhum pagamento encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 