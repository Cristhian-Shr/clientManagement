"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, Building, Calendar, Package, DollarSign } from "lucide-react"

interface Service {
  id: string
  name: string
  description: string
  type: string
  basePrice: number
}

interface SubService {
  id: string
  name: string
  description: string
  price: number
}

interface Plan {
  id: string
  name: string
  description: string
  postsPerMonth: number
  price: number
}

interface Contract {
  id: string
  clientId: string
  serviceId: string
  subServiceId?: string
  planId?: string
  status: string
  startDate: string
  endDate?: string
  service: Service
  subService?: SubService
  plan?: Plan
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  serviceStartDate: string
  createdAt: string
  updatedAt: string
  contracts: Contract[]
}

interface ClientViewProps {
  client: Client
  onClose: () => void
}

export function ClientView({ client, onClose }: ClientViewProps) {
  // Função para formatar telefone com máscara
  const formatPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '')
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    } else if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
    }
    return phone
  }

  const getServiceDisplay = (contract: Contract) => {
    let serviceName = contract.service.name
    
    // Adicionar subserviço se existir
    if (contract.subService) {
      serviceName += ` - ${contract.subService.name}`
    }
    
    // Adicionar plano se existir
    if (contract.plan) {
      serviceName += ` (${contract.plan.name})`
    }
    
    return serviceName
  }

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      'ACTIVE': { label: 'Ativo', color: 'bg-green-100 text-green-800' },
      'INACTIVE': { label: 'Inativo', color: 'bg-gray-100 text-gray-800' },
      'CANCELLED': { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
      'COMPLETED': { label: 'Concluído', color: 'bg-blue-100 text-blue-800' }
    }
    
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
  }

  const calculateContractValue = (contract: Contract) => {
    let value = contract.service.basePrice
    
    if (contract.subService) {
      value = contract.subService.price
    } else if (contract.plan) {
      value = contract.plan.price
    }
    
    return value
  }

  const totalContractsValue = client.contracts.reduce((total, contract) => {
    return total + calculateContractValue(contract)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Informações de Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>E-mail</p>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{client.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Telefone</p>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{formatPhone(client.phone)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Empresa</p>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{client.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Início do Serviço</p>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {new Date(client.serviceStartDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
              <p className="text-2xl font-bold text-green-600">
                {client.contracts.length}
              </p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Contratos Ativos
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
              <p className="text-2xl font-bold text-blue-600">
                R$ {totalContractsValue.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Valor Total dos Contratos
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
              <p className="text-2xl font-bold text-orange-600">
                R$ {(totalContractsValue / client.contracts.length).toLocaleString('pt-BR')}
              </p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Valor Médio por Contrato
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contratos e Serviços */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Contratos e Serviços ({client.contracts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {client.contracts && client.contracts.length > 0 ? (
            <div className="space-y-4">
              {client.contracts.map((contract) => {
                const statusInfo = getStatusDisplay(contract.status)
                const contractValue = calculateContractValue(contract)
                return (
                  <div key={contract.id} className="p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-lg" style={{ color: 'var(--foreground)' }}>
                        {getServiceDisplay(contract)}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Início:</span>
                          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            {new Date(contract.startDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {contract.endDate && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Fim:</span>
                            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                              {new Date(contract.endDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Tipo:</span>
                          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            {contract.service.type}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Preço Base:</span>
                          <span className="text-sm font-bold text-green-600">
                            R$ {contract.service.basePrice.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        {contract.subService && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Subserviço:</span>
                            <span className="text-sm font-bold text-blue-600">
                              R$ {contract.subService.price.toLocaleString('pt-BR')}
                            </span>
                          </div>
                        )}
                        {contract.plan && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Plano:</span>
                            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                              {contract.plan.postsPerMonth} posts/mês
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                          <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Valor do Contrato:</span>
                          <span className="text-lg font-bold text-green-600">
                            R$ {contractValue.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
              <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
                Nenhum contrato ativo
              </p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Este cliente ainda não possui contratos cadastrados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Adicionais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Data de Cadastro</p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {new Date(client.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Última Atualização</p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {new Date(client.updatedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
