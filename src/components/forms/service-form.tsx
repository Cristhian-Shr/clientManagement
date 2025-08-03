"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { useToast } from "@/hooks/use-toast"
import { X, Plus, Trash2 } from "lucide-react"

interface ServiceFormProps {
  isOpen: boolean
  onClose: () => void
  service?: any
  mode: 'create' | 'edit'
}

interface SubService {
  name: string
  description: string
  price: number
}

interface Plan {
  name: string
  description: string
  postsPerMonth: number
  price: number
}

interface TrafficDiscount {
  enabled: boolean
  percentage: number
  description: string
}

export function ServiceForm({ isOpen, onClose, service, mode }: ServiceFormProps) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "WEB_DEVELOPMENT",
    basePrice: 0,
    subServices: [] as SubService[],
    plans: [] as Plan[],
    trafficDiscount: {
      enabled: false,
      percentage: 15,
      description: "Desconto para contratação de ambos os sub-serviços"
    } as TrafficDiscount
  })

  useEffect(() => {
    if (service && mode === 'edit') {
      setFormData({
        name: service.name || "",
        description: service.description || "",
        type: service.type || "WEB_DEVELOPMENT",
        basePrice: service.basePrice || 0,
        subServices: service.subServices || [],
        plans: service.plans || [],
        trafficDiscount: service.trafficDiscount || {
          enabled: false,
          percentage: 15,
          description: "Desconto para contratação de ambos os sub-serviços"
        }
      })
    } else {
      setFormData({
        name: "",
        description: "",
        type: "WEB_DEVELOPMENT",
        basePrice: 0,
        subServices: [],
        plans: [],
        trafficDiscount: {
          enabled: false,
          percentage: 15,
          description: "Desconto para contratação de ambos os sub-serviços"
        }
      })
    }
  }, [service, mode])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addSubService = () => {
    setFormData(prev => ({
      ...prev,
      subServices: [...prev.subServices, { name: "", description: "", price: 0 }]
    }))
  }

  const updateSubService = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      subServices: prev.subServices.map((subService, i) => 
        i === index ? { ...subService, [field]: value } : subService
      )
    }))
  }

  const removeSubService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subServices: prev.subServices.filter((_, i) => i !== index)
    }))
  }

  const addPlan = () => {
    setFormData(prev => ({
      ...prev,
      plans: [...prev.plans, { name: "", description: "", postsPerMonth: 0, price: 0 }]
    }))
  }

  const updatePlan = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      plans: prev.plans.map((plan, i) => 
        i === index ? { ...plan, [field]: value } : plan
      )
    }))
  }

  const removePlan = (index: number) => {
    setFormData(prev => ({
      ...prev,
      plans: prev.plans.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = mode === 'create' 
        ? '/api/services' 
        : `/api/services/${service?.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar serviço')
      }

      toast.success(
        mode === 'create' 
          ? "Serviço criado com sucesso!" 
          : "Serviço atualizado com sucesso!"
      )
      onClose()
      
      // Recarregar a página para atualizar os dados
      window.location.reload()
    } catch (error) {
      console.error('Erro:', error)
      toast.error(error instanceof Error ? error.message : "Erro ao salvar serviço")
    } finally {
      setLoading(false)
    }
  }

  const serviceTypes = [
    { value: "WEB_DEVELOPMENT", label: "Desenvolvimento Web" },
    { value: "PAID_TRAFFIC", label: "Tráfego Pago" },
    { value: "HOSTING", label: "Hospedagem" },
    { value: "SOCIAL_MEDIA", label: "Social Media" }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="7xl">
      <Card className="w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {mode === 'create' ? 'Novo Serviço' : 'Editar Serviço'}
              </CardTitle>
              <CardDescription>
                {mode === 'create' 
                  ? 'Crie um novo serviço com seus valores' 
                  : 'Edite as informações do serviço'
                }
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Serviço</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Desenvolvimento Web"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Serviço</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  {serviceTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva o serviço oferecido..."
                className="w-full p-2 border rounded-md h-20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Preço Base (R$)</label>
              <Input
                type="number"
                value={formData.basePrice}
                onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            {/* Sub-serviços (para Tráfego Pago) */}
            {formData.type === "PAID_TRAFFIC" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Sub-serviços</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addSubService}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Sub-serviço
                  </Button>
                </div>
                
                {formData.subServices.map((subService, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Sub-serviço {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSubService(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <Input
                          value={subService.name}
                          onChange={(e) => updateSubService(index, 'name', e.target.value)}
                          placeholder="Ex: Meta Ads"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <Input
                          value={subService.description}
                          onChange={(e) => updateSubService(index, 'description', e.target.value)}
                          placeholder="Ex: Campanhas no Facebook"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                        <Input
                          type="number"
                          value={subService.price}
                          onChange={(e) => updateSubService(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Configuração de Desconto */}
                {formData.subServices.length >= 2 && (
                  <div className="border rounded-lg p-4 space-y-3 bg-blue-50">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-blue-800">Configuração de Desconto</h4>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.trafficDiscount.enabled}
                          onChange={(e) => handleInputChange('trafficDiscount', {
                            ...formData.trafficDiscount,
                            enabled: e.target.checked
                          })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-blue-700">Ativar desconto</span>
                      </label>
                    </div>
                    
                    {formData.trafficDiscount.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-blue-700">
                            Percentual de Desconto (%)
                          </label>
                          <Input
                            type="number"
                            value={formData.trafficDiscount.percentage}
                            onChange={(e) => handleInputChange('trafficDiscount', {
                              ...formData.trafficDiscount,
                              percentage: parseFloat(e.target.value) || 0
                            })}
                            placeholder="15"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-blue-700">
                            Descrição do Desconto
                          </label>
                          <Input
                            value={formData.trafficDiscount.description}
                            onChange={(e) => handleInputChange('trafficDiscount', {
                              ...formData.trafficDiscount,
                              description: e.target.value
                            })}
                            placeholder="Ex: Desconto para contratação de ambos os sub-serviços"
                          />
                        </div>
                      </div>
                    )}

                    {/* Preview do desconto */}
                    {formData.trafficDiscount.enabled && formData.subServices.length >= 2 && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h5 className="font-medium text-green-800 mb-2">Preview do Desconto</h5>
                        <div className="text-sm text-green-700 space-y-1">
                          {formData.subServices.map((subService, index) => (
                            <p key={index}>
                              {subService.name}: R$ {subService.price.toLocaleString('pt-BR')}
                            </p>
                          ))}
                          <p className="font-medium">
                            Total original: R$ {formData.subServices.reduce((sum, ss) => sum + ss.price, 0).toLocaleString('pt-BR')}
                          </p>
                          <p className="font-medium">
                            Desconto ({formData.trafficDiscount.percentage}%): -R$ {(formData.subServices.reduce((sum, ss) => sum + ss.price, 0) * formData.trafficDiscount.percentage / 100).toLocaleString('pt-BR')}
                          </p>
                          <p className="font-bold text-green-800">
                            Valor final: R$ {(formData.subServices.reduce((sum, ss) => sum + ss.price, 0) * (1 - formData.trafficDiscount.percentage / 100)).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Planos (para Social Media) */}
            {formData.type === "SOCIAL_MEDIA" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Planos</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addPlan}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Plano
                  </Button>
                </div>
                
                {formData.plans.map((plan, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Plano {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlan(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <Input
                          value={plan.name}
                          onChange={(e) => updatePlan(index, 'name', e.target.value)}
                          placeholder="Ex: Plano Start"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <Input
                          value={plan.description}
                          onChange={(e) => updatePlan(index, 'description', e.target.value)}
                          placeholder="Ex: Até 4 posts/mês"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Posts/mês</label>
                        <Input
                          type="number"
                          value={plan.postsPerMonth}
                          onChange={(e) => updatePlan(index, 'postsPerMonth', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                        <Input
                          type="number"
                          value={plan.price}
                          onChange={(e) => updatePlan(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : (mode === 'create' ? "Criar Serviço" : "Atualizar Serviço")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Modal>
  )
} 