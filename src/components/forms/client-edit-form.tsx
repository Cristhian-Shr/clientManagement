"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useMask } from "@/hooks/use-mask"
import { Plus, X, Edit } from "lucide-react"

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

interface Service {
  id: string
  name: string
  description: string
  type: string
  basePrice: number
  subServices: SubService[]
  plans: Plan[]
}

interface Contract {
  id: string
  serviceId: string
  subServiceId?: string
  planId?: string
  status: string
  startDate: string
  service: Service
  subService?: SubService
  plan?: Plan
}

interface SelectedService {
  contractId?: string
  serviceId: string
  subServiceId?: string
  planId?: string
  isNew?: boolean
}

interface ClientEditFormProps {
  client: any
  onSubmit: (clientData: any) => void
  onCancel: () => void
  loading?: boolean
}

export function ClientEditForm({ client, onSubmit, onCancel, loading = false }: ClientEditFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    serviceStartDate: ""
  })
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [customDiscount, setCustomDiscount] = useState({
    enabled: false,
    value: 0,
    type: 'percentage' // 'percentage' ou 'fixed'
  })
  const toast = useToast()
  const { applyPhoneMask, getUnmaskedValue } = useMask()

  // Carregar serviços disponíveis
  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoadingServices(true)
        const response = await fetch('/api/services')
        
        if (!response.ok) {
          throw new Error('Erro ao carregar serviços')
        }
        
        const data = await response.json()
        setServices(data)
      } catch (error) {
        console.error('Erro ao carregar serviços:', error)
        toast.error('Erro ao carregar serviços')
      } finally {
        setIsLoadingServices(false)
      }
    }

    loadServices()
  }, [])

  // Preencher formulário com dados do cliente quando o componente montar
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone ? applyPhoneMask(client.phone) : "",
        company: client.company || "",
        serviceStartDate: client.serviceStartDate ? client.serviceStartDate.split('T')[0] : ""
      })

      // Converter contratos existentes para selectedServices
      if (client.contracts && client.contracts.length > 0) {
        const existingServices: SelectedService[] = client.contracts.map((contract: Contract) => ({
          contractId: contract.id,
          serviceId: contract.serviceId,
          subServiceId: contract.subServiceId,
          planId: contract.planId,
          isNew: false
        }))
        setSelectedServices(existingServices)
      }
    }
  }, [client, applyPhoneMask])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação básica
    if (!formData.name || !formData.email || !formData.phone || !formData.company || !formData.serviceStartDate) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      return
    }

    if (!formData.email.includes("@")) {
      toast.error("Por favor, insira um e-mail válido")
      return
    }

    // Validar telefone (deve ter pelo menos 10 dígitos)
    const phoneNumbers = getUnmaskedValue(formData.phone)
    if (phoneNumbers.length < 10) {
      toast.error("Por favor, insira um telefone válido")
      return
    }

    // Validação de serviços selecionados
    if (selectedServices.length === 0) {
      toast.error("Por favor, selecione pelo menos um serviço")
      return
    }

    // Validar cada serviço selecionado
    for (const selectedService of selectedServices) {
      const service = services.find(s => s.id === selectedService.serviceId)
      
      if (!service) {
        toast.error("Serviço não encontrado")
        return
      }

      // Validação específica para serviços com subserviços
      if (service.type === 'PAID_TRAFFIC' && !selectedService.subServiceId) {
        toast.error("Por favor, selecione um subserviço para Tráfego Pago")
        return
      }

      // Validação específica para serviços com planos
      if (service.type === 'SOCIAL_MEDIA' && !selectedService.planId) {
        toast.error("Por favor, selecione um plano para Social Media")
        return
      }
    }

    // Enviar dados com telefone sem máscara
    onSubmit({
      ...formData,
      phone: getUnmaskedValue(formData.phone),
      services: selectedServices,
      customDiscount: customDiscount.enabled ? customDiscount : null
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyPhoneMask(e.target.value)
    setFormData(prev => ({
      ...prev,
      phone: maskedValue
    }))
  }

  const addService = () => {
    console.log('Adicionando serviço (edição)...')
    setSelectedServices(prev => {
      const newServices = [...prev, { serviceId: "", isNew: true }]
      console.log('Novos serviços (edição):', newServices)
      return newServices
    })
  }

  const removeService = (index: number) => {
    console.log('Removendo serviço no índice (edição):', index)
    setSelectedServices(prev => {
      const newServices = prev.filter((_, i) => i !== index)
      console.log('Serviços após remoção (edição):', newServices)
      return newServices
    })
  }

  const updateSelectedService = (index: number, field: keyof SelectedService, value: string) => {
    setSelectedServices(prev => prev.map((service, i) => {
      if (i === index) {
        const updated = { ...service, [field]: value }
        
        // Limpar subserviço e plano quando o serviço principal muda
        if (field === 'serviceId') {
          updated.subServiceId = undefined
          updated.planId = undefined
        }
        
        return updated
      }
      return service
    }))
  }

  const getSelectedService = (serviceId: string) => {
    return services.find(s => s.id === serviceId)
  }

  const getServiceDisplay = (service: Service) => {
    return `${service.name} - R$ ${service.basePrice.toLocaleString('pt-BR')}`
  }

  const getContractDisplay = (contract: Contract) => {
    let display = contract.service.name
    
    if (contract.subService) {
      display += ` - ${contract.subService.name}`
    }
    
    if (contract.plan) {
      display += ` (${contract.plan.name})`
    }
    
    return display
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            Nome Completo *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Nome do cliente"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            E-mail *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="cliente@empresa.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            Telefone *
          </label>
          <Input
            value={formData.phone}
            onChange={handlePhoneChange}
            placeholder="(11) 99999-9999"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            Empresa *
          </label>
          <Input
            value={formData.company}
            onChange={(e) => handleChange("company", e.target.value)}
            placeholder="Nome da empresa"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            Data de Início do Serviço *
          </label>
          <Input
            type="date"
            value={formData.serviceStartDate}
            onChange={(e) => handleChange("serviceStartDate", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Seção de Serviços */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            Serviços Contratados *
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addService}
            disabled={isLoadingServices}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Serviço
          </Button>
        </div>

        {selectedServices.length === 0 && (
          <div className="text-center py-4 border-2 border-dashed rounded-lg" style={{ borderColor: 'var(--border)' }}>
            <p style={{ color: 'var(--muted-foreground)' }}>
              Clique em "Adicionar Serviço" para selecionar os serviços contratados
            </p>
          </div>
        )}

        {selectedServices.map((selectedService, index) => {
          const service = getSelectedService(selectedService.serviceId)
          const isExistingContract = selectedService.contractId
          
          return (
            <div key={index} className="p-4 border rounded-lg space-y-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>
                    Serviço {index + 1}
                  </h4>
                  {isExistingContract && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Existente
                    </span>
                  )}
                  {selectedService.isNew && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Novo
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeService(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                    Serviço *
                  </label>
                  {isLoadingServices ? (
                    <div className="w-full px-3 py-2 border rounded-md" style={{ borderColor: 'var(--border)' }}>
                      <span style={{ color: 'var(--muted-foreground)' }}>Carregando...</span>
                    </div>
                  ) : (
                    <select
                      value={selectedService.serviceId}
                      onChange={(e) => updateSelectedService(index, 'serviceId', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ 
                        borderColor: 'var(--border)', 
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)'
                      }}
                      required
                    >
                      <option value="">Selecione um serviço</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {getServiceDisplay(service)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Subserviços - aparece apenas para Tráfego Pago */}
                {service?.type === 'PAID_TRAFFIC' && service.subServices.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                      Subserviço *
                    </label>
                    <select
                      value={selectedService.subServiceId || ""}
                      onChange={(e) => updateSelectedService(index, 'subServiceId', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ 
                        borderColor: 'var(--border)', 
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)'
                      }}
                      required
                    >
                      <option value="">Selecione um subserviço</option>
                      {service.subServices.map((subService) => (
                        <option key={subService.id} value={subService.id}>
                          {subService.name} - R$ {subService.price.toLocaleString('pt-BR')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Planos - aparece apenas para Social Media */}
                {service?.type === 'SOCIAL_MEDIA' && service.plans.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                      Plano *
                    </label>
                    <select
                      value={selectedService.planId || ""}
                      onChange={(e) => updateSelectedService(index, 'planId', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ 
                        borderColor: 'var(--border)', 
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)'
                      }}
                      required
                    >
                      <option value="">Selecione um plano</option>
                      {service.plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - {plan.postsPerMonth} posts/mês - R$ {plan.price.toLocaleString('pt-BR')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Desconto Personalizado */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            Desconto Personalizado
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={customDiscount.enabled}
              onChange={(e) => setCustomDiscount(prev => ({
                ...prev,
                enabled: e.target.checked
              }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Aplicar desconto adicional
            </span>
          </label>
        </div>

        {customDiscount.enabled && (
          <div className="border rounded-lg p-4 space-y-3 bg-gray-900 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">
                  Tipo de Desconto
                </label>
                <select
                  value={customDiscount.type}
                  onChange={(e) => setCustomDiscount(prev => ({
                    ...prev,
                    type: e.target.value as 'percentage' | 'fixed'
                  }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 border-gray-600 text-white"
                >
                  <option value="percentage">Percentual (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">
                  Valor do Desconto
                </label>
                <Input
                  type="number"
                  value={customDiscount.value}
                  onChange={(e) => setCustomDiscount(prev => ({
                    ...prev,
                    value: parseFloat(e.target.value) || 0
                  }))}
                  placeholder={customDiscount.type === 'percentage' ? "15" : "100"}
                  min="0"
                  max={customDiscount.type === 'percentage' ? "100" : undefined}
                  step={customDiscount.type === 'percentage' ? "0.1" : "0.01"}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="flex items-end">
                <span className="text-sm text-gray-300">
                  {customDiscount.type === 'percentage' 
                    ? `Desconto de ${customDiscount.value}%` 
                    : `Desconto de R$ ${customDiscount.value.toLocaleString('pt-BR')}`
                  }
                </span>
              </div>
            </div>

            {/* Preview do desconto personalizado */}
            {selectedServices.length > 0 && (
              <div className="mt-3 p-3 bg-gray-800 border border-gray-600 rounded-lg">
                <h5 className="font-medium text-green-400 mb-2">Preview do Desconto Personalizado</h5>
                <div className="text-sm text-gray-300 space-y-1">
                  {selectedServices.map((selectedService, index) => {
                    const service = getSelectedService(selectedService.serviceId)
                    let serviceTotal = 0
                    
                    if (service?.type === 'SOCIAL_MEDIA' && selectedService.planId) {
                      const plan = service.plans.find(p => p.id === selectedService.planId)
                      serviceTotal = plan?.price || 0
                    } else {
                      serviceTotal = service?.basePrice || 0
                    }

                    return (
                      <div key={index} className="border-l-2 border-green-500 pl-2">
                        <p className="font-medium text-white">{service?.name || 'Serviço'}</p>
                        <p>Valor: R$ {serviceTotal.toLocaleString('pt-BR')}</p>
                      </div>
                    )
                  })}
                  
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <p className="font-medium text-white">
                      Total dos serviços: R$ {selectedServices.reduce((sum, selectedService) => {
                        const service = getSelectedService(selectedService.serviceId)
                        let serviceTotal = 0
                        
                        if (service?.type === 'SOCIAL_MEDIA' && selectedService.planId) {
                          const plan = service.plans.find(p => p.id === selectedService.planId)
                          serviceTotal = plan?.price || 0
                        } else {
                          serviceTotal = service?.basePrice || 0
                        }
                        
                        return sum + serviceTotal
                      }, 0).toLocaleString('pt-BR')}
                    </p>
                    <p className="font-medium text-gray-300">
                      Desconto personalizado: {customDiscount.type === 'percentage' 
                        ? `${customDiscount.value}%` 
                        : `R$ ${customDiscount.value.toLocaleString('pt-BR')}`
                      }
                    </p>
                    <p className="font-bold text-green-400">
                      Valor final: R$ {(() => {
                        const totalServices = selectedServices.reduce((sum, selectedService) => {
                          const service = getSelectedService(selectedService.serviceId)
                          let serviceTotal = 0
                          
                          if (service?.type === 'SOCIAL_MEDIA' && selectedService.planId) {
                            const plan = service.plans.find(p => p.id === selectedService.planId)
                            serviceTotal = plan?.price || 0
                          } else {
                            serviceTotal = service?.basePrice || 0
                          }
                          
                          return sum + serviceTotal
                        }, 0)
                        
                        if (customDiscount.type === 'percentage') {
                          return (totalServices * (1 - customDiscount.value / 100)).toLocaleString('pt-BR')
                        } else {
                          return Math.max(0, totalServices - customDiscount.value).toLocaleString('pt-BR')
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  )
}
