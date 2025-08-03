"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

interface PaymentFormProps {
  isOpen: boolean
  onClose: () => void
  payment?: any
  mode: 'create' | 'edit'
}

interface Client {
  id: string
  name: string
  email: string
  company: string
}

interface Contract {
  id: string
  clientId: string
  serviceId: string
  service: {
    name: string
  }
  client: {
    name: string
  }
}

export function PaymentForm({ isOpen, onClose, payment, mode }: PaymentFormProps) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [formData, setFormData] = useState({
    contractId: "",
    clientId: "",
    amount: 0,
    dueDate: "",
    paymentDate: "",
    status: "PENDING",
    paymentMethod: "PIX",
    description: ""
  })

  // Buscar clientes e contratos
  useEffect(() => {
    const fetchData = async () => {
      console.log('Carregando dados do formulário...')
      setLoadingData(true)
      try {
        // Buscar clientes
        console.log('Buscando clientes...')
        const clientsResponse = await fetch('/api/clients')
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json()
          console.log('Clientes carregados:', clientsData)
          setClients(clientsData)
        } else {
          console.error('Erro ao buscar clientes:', clientsResponse.status)
        }

        // Buscar contratos
        console.log('Buscando contratos...')
        const contractsResponse = await fetch('/api/contracts')
        if (contractsResponse.ok) {
          const contractsData = await contractsResponse.json()
          console.log('Contratos carregados:', contractsData)
          setContracts(contractsData)
        } else {
          console.error('Erro ao buscar contratos:', contractsResponse.status)
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      } finally {
        setLoadingData(false)
      }
    }

    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  useEffect(() => {
    if (payment && mode === 'edit') {
      console.log('Preenchendo formulário com dados do pagamento:', payment)
      setFormData({
        contractId: payment.contractId || "",
        clientId: payment.clientId || "",
        amount: payment.amount || 0,
        dueDate: payment.dueDate ? new Date(payment.dueDate).toISOString().split('T')[0] : "",
        paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : "",
        status: payment.status || "PENDING",
        paymentMethod: payment.paymentMethod || "PIX",
        description: payment.description || ""
      })
    } else {
      console.log('Limpando formulário para novo pagamento')
      setFormData({
        contractId: "",
        clientId: "",
        amount: 0,
        dueDate: "",
        paymentDate: "",
        status: "PENDING",
        paymentMethod: "PIX",
        description: ""
      })
    }
  }, [payment, mode, isOpen])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleClientChange = (clientId: string) => {
    console.log('Cliente selecionado:', clientId)
    setFormData(prev => {
      const newData = {
        ...prev,
        clientId,
        contractId: "" // Reset contract when client changes
      }
      console.log('Novo estado do formulário:', newData)
      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Formulário submetido:', formData)
    
    // Validação dos dados
    if (!formData.clientId) {
      toast.error('Selecione um cliente')
      return
    }
    
    if (!formData.contractId) {
      toast.error('Selecione um contrato')
      return
    }
    
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Informe um valor válido')
      return
    }
    
    if (!formData.dueDate) {
      toast.error('Informe a data de vencimento')
      return
    }
    
    if (!formData.status) {
      toast.error('Selecione um status')
      return
    }
    
    if (!formData.paymentMethod) {
      toast.error('Selecione um método de pagamento')
      return
    }
    
    setLoading(true)

    try {
      const url = mode === 'create' 
        ? '/api/payments' 
        : `/api/payments/${payment?.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'
      
      console.log('Enviando requisição:', { url, method, data: formData })
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('Resposta recebida:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erro na resposta:', errorData)
        throw new Error(errorData.error || 'Erro ao salvar pagamento')
      }

      const result = await response.json()
      console.log('Pagamento salvo com sucesso:', result)

      toast.success(
        mode === 'create' 
          ? "Pagamento criado com sucesso!" 
          : "Pagamento atualizado com sucesso!"
      )
      onClose()
      
      // Emitir evento para recarregar os dados da página pai
      window.dispatchEvent(new CustomEvent('paymentUpdated'))
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error)
      toast.error(error instanceof Error ? error.message : "Erro ao salvar pagamento")
    } finally {
      setLoading(false)
    }
  }

  const paymentMethods = [
    { value: "PIX", label: "PIX" },
    { value: "BANK_TRANSFER", label: "Transferência Bancária" },
    { value: "CREDIT_CARD", label: "Cartão de Crédito" },
    { value: "DEBIT_CARD", label: "Cartão de Débito" },
    { value: "CASH", label: "Dinheiro" }
  ]

  const statusOptions = [
    { value: "PENDING", label: "Pendente" },
    { value: "PAID", label: "Pago" },
    { value: "OVERDUE", label: "Vencido" },
    { value: "CANCELLED", label: "Cancelado" }
  ]

  // Filtrar contratos do cliente selecionado
  const clientContracts = formData.clientId 
    ? contracts.filter(contract => contract.clientId === formData.clientId)
    : []

  console.log('Contratos filtrados:', {
    totalContracts: contracts.length,
    selectedClientId: formData.clientId,
    filteredContracts: clientContracts.length,
    contracts: clientContracts.map(c => ({ id: c.id, service: c.service.name, client: c.client.name }))
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} showHeader={false} size="7xl">
      <Card className="w-full max-w-7xl max-h-[95vh] overflow-y-auto mx-4 border-0 shadow-none modal-payment">
        <CardHeader className="border-b pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">
                {mode === 'create' ? 'Novo Pagamento' : 'Editar Pagamento'}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {mode === 'create' 
                  ? 'Cadastre um novo pagamento para o cliente' 
                  : 'Edite as informações do pagamento selecionado'
                }
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-100">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Primeira linha - Cliente, Contrato e Valor */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cliente */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Cliente *</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.company}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contrato */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Contrato *</label>
                {loadingData ? (
                  <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-gray-500">Carregando contratos...</span>
                  </div>
                ) : (
                  <select
                    value={formData.contractId}
                    onChange={(e) => handleInputChange('contractId', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:text-gray-100 disabled:cursor-not-allowed"
                    required
                    disabled={!formData.clientId}
                  >
                    <option value="">
                      {!formData.clientId 
                        ? "Selecione um cliente primeiro" 
                        : clientContracts.length === 0 
                          ? "Nenhum contrato disponível" 
                          : "Selecione um contrato"
                      }
                    </option>
                    {clientContracts.map(contract => {
                      console.log('Renderizando contrato:', contract)
                      return (
                        <option key={contract.id} value={contract.id}>
                          {contract.service.name} - {contract.client.name}
                        </option>
                      )
                    })}
                  </select>
                )}
                <p className="text-xs text-gray-500">
                  {loadingData 
                    ? "Carregando contratos..."
                    : formData.clientId 
                      ? `${clientContracts.length} contrato(s) disponível(is) para este cliente`
                      : "Selecione um cliente para ver os contratos disponíveis"
                  }
                </p>
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Valor (R$) *</label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="p-3 text-lg"
                  required
                />
              </div>
            </div>

            {/* Segunda linha - Status, Data de Vencimento e Data de Pagamento */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data de Vencimento */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Data de Vencimento *</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="p-3"
                  required
                />
              </div>

              {/* Data de Pagamento */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Data de Pagamento</label>
                <Input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                  className="p-3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco se o pagamento ainda não foi realizado
                </p>
              </div>
            </div>

            {/* Terceira linha - Método de Pagamento */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Método de Pagamento *</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quarta linha - Descrição */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Ex: Pagamento mensal - Janeiro 2024"
                className="w-full p-3 border border-gray-300 rounded-lg h-28 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              />
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="px-6 py-2"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Salvando..." : (mode === 'create' ? "Criar Pagamento" : "Atualizar Pagamento")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Modal>
  )
} 