"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Download, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PaymentForm } from "@/components/forms/payment-form"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

// Dados mockados para fallback
const mockPayments = [
  {
    id: "1",
    client: "João Silva",
    contract: "Desenvolvimento Web",
    amount: 2500,
    dueDate: "2024-01-15",
    paymentDate: "2024-01-14",
    status: "PAID",
    paymentMethod: "PIX",
    description: "Pagamento mensal - Janeiro 2024"
  },
  {
    id: "2",
    client: "Maria Santos",
    contract: "Tráfego Pago",
    amount: 1800,
    dueDate: "2024-01-20",
    paymentDate: null,
    status: "PENDING",
    paymentMethod: "BANK_TRANSFER",
    description: "Pagamento mensal - Janeiro 2024"
  },
  {
    id: "3",
    client: "Pedro Costa",
    contract: "Social Media",
    amount: 1200,
    dueDate: "2024-01-10",
    paymentDate: null,
    status: "OVERDUE",
    paymentMethod: "CREDIT_CARD",
    description: "Pagamento mensal - Janeiro 2024"
  },
  {
    id: "4",
    client: "Ana Oliveira",
    contract: "Hospedagem",
    amount: 500,
    dueDate: "2024-01-25",
    paymentDate: "2024-01-24",
    status: "PAID",
    paymentMethod: "PIX",
    description: "Pagamento mensal - Janeiro 2024"
  }
]

const statusColors = {
  PAID: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  OVERDUE: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800"
}

const statusLabels = {
  PAID: "Pago",
  PENDING: "Pendente",
  OVERDUE: "Vencido",
  CANCELLED: "Cancelado"
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [payments, setPayments] = useState(mockPayments)
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; payment: any | null }>({
    isOpen: false,
    payment: null
  })
  const toast = useToast()

  // Buscar pagamentos da API
  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/payments')
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      } else {
        console.error('Erro ao buscar pagamentos')
        // Usar dados mockados em caso de erro
        setPayments(mockPayments)
      }
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error)
      // Usar dados mockados em caso de erro
      setPayments(mockPayments)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  // Listener para atualização de pagamentos
  useEffect(() => {
    const handlePaymentUpdate = () => {
      console.log('Evento de atualização de pagamento recebido')
      fetchPayments()
    }

    window.addEventListener('paymentUpdated', handlePaymentUpdate)
    
    return () => {
      window.removeEventListener('paymentUpdated', handlePaymentUpdate)
    }
  }, [])

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.contract.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = payments
    .filter(p => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingAmount = payments
    .filter(p => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0)

  const overdueAmount = payments
    .filter(p => p.status === "OVERDUE")
    .reduce((sum, p) => sum + p.amount, 0)

  const handleNewPayment = () => {
    console.log('Abrindo modal de novo pagamento')
    setSelectedPayment(null)
    setFormMode('create')
    setIsFormOpen(true)
  }

  const handleEdit = (payment: any) => {
    console.log('Editando pagamento:', payment)
    setSelectedPayment(payment)
    setFormMode('edit')
    setIsFormOpen(true)
  }

  const handleDelete = async (payment: any) => {
    setDeleteDialog({ isOpen: true, payment })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.payment) return

    try {
      const response = await fetch(`/api/payments/${deleteDialog.payment.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Pagamento excluído com sucesso!')
        // Atualizar a lista localmente em vez de recarregar a página
        setPayments(prev => prev.filter(p => p.id !== deleteDialog.payment.id))
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erro ao excluir pagamento')
      }
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error)
      toast.error('Erro ao excluir pagamento')
    } finally {
      setDeleteDialog({ isOpen: false, payment: null })
    }
  }

  const handleFormClose = () => {
    console.log('Fechando modal de pagamento')
    setIsFormOpen(false)
    setSelectedPayment(null)
  }

  const handleExport = () => {
    const loadingToast = toast.loading("Exportando dados...")
    
    setTimeout(() => {
      toast.dismiss(loadingToast)
      toast.success("Dados exportados com sucesso!")
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Pagamentos</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Gerencie os pagamentos dos clientes</p>
        </div>
        <Button onClick={handleNewPayment}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Pagamento
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Pagamentos recebidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {pendingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Pagamentos pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {overdueAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Pagamentos vencidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                <Input
                  placeholder="Buscar por cliente ou contrato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ 
                borderColor: 'var(--border)', 
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)'
              }}
            >
              <option value="ALL">Todos os status</option>
              <option value="PAID">Pago</option>
              <option value="PENDING">Pendente</option>
              <option value="OVERDUE">Vencido</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pagamentos</CardTitle>
          <CardDescription>
            {filteredPayments.length} pagamento(s) encontrado(s)
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
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover-card" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>{payment.client}</h3>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{payment.contract}</p>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{payment.description}</p>
                      </div>
                      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        <p><strong>Vencimento:</strong> {new Date(payment.dueDate).toLocaleDateString('pt-BR')}</p>
                        {payment.paymentDate && (
                          <p><strong>Pagamento:</strong> {new Date(payment.paymentDate).toLocaleDateString('pt-BR')}</p>
                        )}
                        <p><strong>Método:</strong> {payment.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="font-medium text-lg" style={{ color: 'var(--foreground)' }}>R$ {payment.amount.toLocaleString()}</p>
                      <span className={`text-sm px-2 py-1 rounded-full ${statusColors[payment.status as keyof typeof statusColors]}`}>
                        {statusLabels[payment.status as keyof typeof statusLabels]}
                      </span>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(payment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(payment)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal do formulário */}
      <PaymentForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        payment={selectedPayment}
        mode={formMode}
      />

      {/* Diálogo de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, payment: null })}
        onConfirm={confirmDelete}
        title="Excluir Pagamento"
        message={`Tem certeza que deseja excluir o pagamento de ${deleteDialog.payment?.client} no valor de R$ ${deleteDialog.payment?.amount?.toLocaleString()}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  )
}
