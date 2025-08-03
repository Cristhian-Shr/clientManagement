"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Modal } from "@/components/ui/modal"
import { ClientForm } from "@/components/forms/client-form"
import { ClientEditForm } from "@/components/forms/client-edit-form"
import { ClientView } from "@/components/forms/client-view"
import { Plus, Search, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    clientId: string | null
    clientName: string
  }>({
    isOpen: false,
    clientId: null,
    clientName: ""
  })
  const toast = useToast()

  // Carregar clientes da API
  const loadClients = async () => {
    try {
      setIsLoadingClients(true)
      const response = await fetch('/api/clients')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar clientes')
      }
      
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      toast.error('Erro ao carregar clientes')
    } finally {
      setIsLoadingClients(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteClick = (client: Client) => {
    setConfirmDialog({
      isOpen: true,
      clientId: client.id,
      clientName: client.name
    })
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDialog.clientId) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/clients?id=${confirmDialog.clientId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir cliente')
      }

      setClients(clients.filter(client => client.id !== confirmDialog.clientId))
      toast.success(`Cliente "${confirmDialog.clientName}" excluído com sucesso!`)
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir cliente')
    } finally {
      setIsLoading(false)
      setConfirmDialog({ isOpen: false, clientId: null, clientName: "" })
    }
  }

  const handleAddClient = async (clientData: any) => {
    try {
      setIsLoading(true)
      
      console.log('Enviando dados do cliente:', clientData)
      
      // Criar cliente com contratos em uma única transação
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar cliente')
      }

      const result = await response.json()
      console.log('Cliente e contratos criados:', result)

      // Exibir mensagem de sucesso
      const servicesCount = clientData.services ? clientData.services.length : 0
      if (servicesCount > 0) {
        toast.success(`Cliente "${clientData.name}" adicionado com ${servicesCount} contrato(s)!`)
      } else {
        toast.success(`Cliente "${clientData.name}" adicionado com sucesso!`)
      }

      // Recarregar a lista de clientes
      await loadClients()
      
      setIsAddModalOpen(false)
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao criar cliente')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClient = async (clientData: any) => {
    if (!selectedClient) return

    try {
      setIsLoading(true)
      
      // Atualizar o cliente com todos os dados (incluindo serviços e descontos)
      const clientResponse = await fetch('/api/clients', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: selectedClient.id,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          company: clientData.company,
          serviceStartDate: clientData.serviceStartDate,
          services: clientData.services,
          customDiscount: clientData.customDiscount
        })
      })

      if (!clientResponse.ok) {
        const error = await clientResponse.json()
        throw new Error(error.error || 'Erro ao atualizar cliente')
      }

      const updatedClient = await clientResponse.json()
      
      toast.success(`Cliente "${clientData.name}" atualizado com sucesso!`)

      // Recarregar a lista de clientes
      await loadClients()
      
      setIsEditModalOpen(false)
      setSelectedClient(null)
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar cliente')
    } finally {
      setIsLoading(false)
    }
  }

  const handleView = (client: Client) => {
    setSelectedClient(client)
    setIsViewModalOpen(true)
  }

  const handleEdit = (client: Client) => {
    setSelectedClient(client)
    setIsEditModalOpen(true)
  }

  const handleNewClient = () => {
    setIsAddModalOpen(true)
  }

  const getServiceDisplay = (client: Client) => {
    if (client.contracts && client.contracts.length > 0) {
      return client.contracts.map(contract => {
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
      }).join(', ')
    }
    return "Nenhum serviço contratado"
  }

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

  if (isLoadingClients) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando clientes...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Clientes</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Gerencie seus clientes</p>
        </div>
        <Button onClick={handleNewClient}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                <Input
                  placeholder="Buscar por nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {filteredClients.length} cliente(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
              {searchTerm ? 'Nenhum cliente encontrado com os filtros aplicados.' : 'Nenhum cliente cadastrado ainda.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover-card" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>{client.name}</h3>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{client.email}</p>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{formatPhone(client.phone)}</p>
                      </div>
                      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        <p><strong>Empresa:</strong> {client.company}</p>
                        <p><strong>Serviço:</strong> {getServiceDisplay(client)}</p>
                        <p><strong>Início:</strong> {new Date(client.serviceStartDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(client)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteClick(client)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Adicionar Cliente */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Adicionar Novo Cliente"
        size="7xl"
      >
        <ClientForm
          onSubmit={handleAddClient}
          onCancel={() => setIsAddModalOpen(false)}
          loading={isLoading}
        />
      </Modal>

      {/* Modal de Editar Cliente */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedClient(null)
        }}
        title="Editar Cliente"
        size="7xl"
      >
        {selectedClient && (
          <ClientEditForm
            client={selectedClient}
            onSubmit={handleEditClient}
            onCancel={() => {
              setIsEditModalOpen(false)
              setSelectedClient(null)
            }}
            loading={isLoading}
          />
        )}
      </Modal>

      {/* Modal de Visualizar Cliente */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalhes do Cliente"
        size="7xl"
      >
        {selectedClient && (
          <ClientView
            client={selectedClient}
            onClose={() => setIsViewModalOpen(false)}
          />
        )}
      </Modal>

      {/* Dialog de confirmação */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, clientId: null, clientName: "" })}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o cliente "${confirmDialog.clientName}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  )
}
