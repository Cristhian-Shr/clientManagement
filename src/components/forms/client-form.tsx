"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useMask } from "@/hooks/use-mask"
import { Plus, X } from "lucide-react"

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
  trafficDiscount?: {
    enabled: boolean;
    percentage: number;
    description?: string;
  };
}

interface SelectedService {
  serviceId: string
  subServiceIds?: string[] // Array para múltiplos sub-serviços
  subServiceId?: string // Mantido para compatibilidade
  planId?: string
  isNew?: boolean
}

interface ClientFormProps {
  onSubmit: (clientData: {
    name: string
    email: string
    phone: string
    company: string
    serviceStartDate: string
    services: Array<{
      serviceId: string
      subServiceId?: string
      subServiceIds?: string[]
      planId?: string
    }>
    customDiscount?: {
      enabled: boolean
      value: number
      type: 'percentage' | 'fixed'
    } | null
  }) => void
  onCancel: () => void
  loading?: boolean
}

export function ClientForm({ onSubmit, onCancel, loading = false }: ClientFormProps) {
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
  }, [toast])

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
      if (service.type === 'PAID_TRAFFIC' && !selectedService.subServiceId && (!selectedService.subServiceIds || selectedService.subServiceIds.length === 0)) {
        toast.error("Por favor, selecione pelo menos um subserviço para Tráfego Pago")
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
      customDiscount: customDiscount.enabled
        ? {
            ...customDiscount,
            type: customDiscount.type as 'percentage' | 'fixed'
          }
        : null
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
    setSelectedServices(prev => [...prev, { serviceId: "", isNew: true }])
  }

  const removeService = (index: number) => {
    setSelectedServices(prev => prev.filter((_, i) => i !== index))
  }

  const updateSelectedService = (index: number, field: keyof SelectedService, value: string | string[] | undefined) => {
    setSelectedServices(prev => prev.map((service, i) => {
      if (i === index) {
        const updated = { ...service, [field]: value }
        
        // Limpar subserviços quando o serviço principal muda
        if (field === 'serviceId') {
          updated.subServiceId = undefined
          updated.subServiceIds = undefined
          updated.planId = undefined
        }
        
        return updated
      }
      return service
    }))
  }

  // Função para calcular desconto quando ambos os sub-serviços são selecionados
  const calculateTrafficDiscount = (selectedSubServices: string[], allSubServices: SubService[], service: Service) => {
    if (selectedSubServices.length === 2 && service.trafficDiscount) {
      const discountConfig = service.trafficDiscount as {
        enabled: boolean
        percentage: number
        description?: string
      }
      if (discountConfig.enabled && discountConfig.percentage > 0) {
        const totalPrice = selectedSubServices.reduce((sum, subServiceId) => {
          const subService = allSubServices.find(ss => ss.id === subServiceId)
          return sum + (subService?.price || 0)
        }, 0)
        
        const discount = totalPrice * (discountConfig.percentage / 100)
        return { 
          totalPrice, 
          discount, 
          finalPrice: totalPrice - discount,
          percentage: discountConfig.percentage,
          description: discountConfig.description || 'Desconto aplicado'
        }
      }
    }
    return null
  }

  // Função para obter sub-serviços selecionados
  const getSelectedSubServices = (selectedService: SelectedService) => {
    if (selectedService.subServiceIds && selectedService.subServiceIds.length > 0) {
      return selectedService.subServiceIds
    }
    if (selectedService.subServiceId) {
      return [selectedService.subServiceId]
    }
    return []
  }

  // Função para alternar seleção de sub-serviço
  const toggleSubService = (serviceIndex: number, subServiceId: string) => {
    setSelectedServices(prev => prev.map((service, i) => {
      if (i === serviceIndex) {
        const currentSubServices = getSelectedSubServices(service)
        const isSelected = currentSubServices.includes(subServiceId)
        
        if (isSelected) {
          // Remover sub-serviço
          const newSubServices = currentSubServices.filter(id => id !== subServiceId)
          return {
            ...service,
            subServiceIds: newSubServices.length > 0 ? newSubServices : undefined,
            subServiceId: newSubServices.length === 1 ? newSubServices[0] : undefined
          }
        } else {
          // Adicionar sub-serviço
          const newSubServices = [...currentSubServices, subServiceId]
          return {
            ...service,
            subServiceIds: newSubServices,
            subServiceId: undefined // Limpar o campo único
          }
        }
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
            Serviços Contratados * ({selectedServices.length})
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
                              Clique em &quot;Adicionar Serviço&quot; para selecionar os serviços contratados
            </p>
          </div>
        )}

        {selectedServices.map((selectedService, index) => {
          const service = getSelectedService(selectedService.serviceId)
          const selectedSubServices = getSelectedSubServices(selectedService)
          const trafficDiscount = service?.type === 'PAID_TRAFFIC' && service.subServices 
            ? calculateTrafficDiscount(selectedSubServices, service.subServices, service)
            : null
          
          return (
            <div key={index} className="p-4 border rounded-lg space-y-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>
                    Serviço {index + 1}
                  </h4>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Novo
                  </span>
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
                      Subserviços *
                    </label>
                    <div className="space-y-2">
                      {service.subServices.map((subService) => {
                        const isSelected = selectedSubServices.includes(subService.id)
                        return (
                          <label key={subService.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSubService(index, subService.id)}
                              className="rounded border-gray-300"
                            />
                            <span style={{ color: 'var(--foreground)' }}>
                              {subService.name} - R$ {subService.price.toLocaleString('pt-BR')}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                    
                    {/* Mostrar desconto quando ambos são selecionados */}
                    {trafficDiscount && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm">
                          <p className="font-medium text-green-800">Desconto Aplicado!</p>
                          <p className="text-green-700">
                            Total: R$ {trafficDiscount.totalPrice.toLocaleString('pt-BR')}
                          </p>
                          <p className="text-green-700">
                            Desconto ({trafficDiscount.percentage}%): -R$ {trafficDiscount.discount.toLocaleString('pt-BR')}
                          </p>
                          <p className="font-bold text-green-800">
                            Valor Final: R$ {trafficDiscount.finalPrice.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )}
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
                    const selectedSubServices = getSelectedSubServices(selectedService)
                    const trafficDiscount = service?.type === 'PAID_TRAFFIC' && service.subServices 
                      ? calculateTrafficDiscount(selectedSubServices, service.subServices, service)
                      : null
                    
                    let serviceTotal = 0
                    if (service?.type === 'PAID_TRAFFIC' && selectedSubServices.length > 0) {
                      serviceTotal = selectedSubServices.reduce((sum, subServiceId) => {
                        const subService = service.subServices.find(ss => ss.id === subServiceId)
                        return sum + (subService?.price || 0)
                      }, 0)
                      if (trafficDiscount) {
                        serviceTotal = trafficDiscount.finalPrice
                      }
                    } else if (service?.type === 'SOCIAL_MEDIA' && selectedService.planId) {
                      const plan = service.plans.find(p => p.id === selectedService.planId)
                      serviceTotal = plan?.price || 0
                    } else {
                      serviceTotal = service?.basePrice || 0
                    }

                    return (
                      <div key={index} className="border-l-2 border-green-500 pl-2">
                        <p className="font-medium text-white">{service?.name || 'Serviço'}</p>
                        <p>Valor original: R$ {serviceTotal.toLocaleString('pt-BR')}</p>
                        {trafficDiscount && (
                          <p>Com desconto do serviço: R$ {trafficDiscount.finalPrice.toLocaleString('pt-BR')}</p>
                        )}
                      </div>
                    )
                  })}
                  
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <p className="font-medium text-white">
                      Total dos serviços: R$ {selectedServices.reduce((sum, selectedService) => {
                        const service = getSelectedService(selectedService.serviceId)
                        const selectedSubServices = getSelectedSubServices(selectedService)
                        const trafficDiscount = service?.type === 'PAID_TRAFFIC' && service.subServices 
                          ? calculateTrafficDiscount(selectedSubServices, service.subServices, service)
                          : null
                        
                        let serviceTotal = 0
                        if (service?.type === 'PAID_TRAFFIC' && selectedSubServices.length > 0) {
                          serviceTotal = selectedSubServices.reduce((sum, subServiceId) => {
                            const subService = service.subServices.find(ss => ss.id === subServiceId)
                            return sum + (subService?.price || 0)
                          }, 0)
                          if (trafficDiscount) {
                            serviceTotal = trafficDiscount.finalPrice
                          }
                        } else if (service?.type === 'SOCIAL_MEDIA' && selectedService.planId) {
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
                          const selectedSubServices = getSelectedSubServices(selectedService)
                          const trafficDiscount = service?.type === 'PAID_TRAFFIC' && service.subServices 
                            ? calculateTrafficDiscount(selectedSubServices, service.subServices, service)
                            : null
                          
                          let serviceTotal = 0
                          if (service?.type === 'PAID_TRAFFIC' && selectedSubServices.length > 0) {
                            serviceTotal = selectedSubServices.reduce((sum, subServiceId) => {
                              const subService = service.subServices.find(ss => ss.id === subServiceId)
                              return sum + (subService?.price || 0)
                            }, 0)
                            if (trafficDiscount) {
                              serviceTotal = trafficDiscount.finalPrice
                            }
                          } else if (service?.type === 'SOCIAL_MEDIA' && selectedService.planId) {
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
          {loading ? "Salvando..." : "Salvar Cliente"}
        </Button>
      </div>
    </form>
  )
}
