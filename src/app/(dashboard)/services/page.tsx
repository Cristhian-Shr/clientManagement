/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ServiceForm } from "@/components/forms/service-form"

// Dados mockados para fallback
const mockServices = [
  {
    id: "1",
    name: "Desenvolvimento Web",
    description: "Criação de sites institucionais, e-commerces e landing pages",
    type: "WEB_DEVELOPMENT",
    basePrice: 2500,
    contracts: 8,
  },
  {
    id: "2",
    name: "Tráfego Pago",
    description: "Gestão de campanhas no Meta Ads e Google Ads",
    type: "PAID_TRAFFIC",
    basePrice: 1800,
    contracts: 12,
    subServices: [
      { name: "Meta Ads (Facebook/Instagram)", description: "Campanhas no Facebook e Instagram", price: 1200 },
      { name: "Google Ads", description: "Campanhas no Google Search e Display", price: 1500 }
    ]
  },
  {
    id: "3",
    name: "Hospedagem de Sites",
    description: "Servidores otimizados para performance, backups automáticos e SSL incluso",
    type: "HOSTING",
    basePrice: 150,
    contracts: 5,
  },
  {
    id: "4",
    name: "Social Media",
    description: "Planejamento e execução de conteúdo para redes sociais",
    type: "SOCIAL_MEDIA",
    basePrice: 0,
    contracts: 15,
    plans: [
      { name: "Plano Start", description: "Até 4 posts/mês", postsPerMonth: 4, price: 500 },
      { name: "Plano Pro", description: "Até 8 posts/mês", postsPerMonth: 8, price: 800 },
      { name: "Plano Business", description: "Até 12 posts/mês", postsPerMonth: 12, price: 1200 },
      { name: "Plano Premium", description: "Conteúdo diário + stories + reels", postsPerMonth: 30, price: 2000 }
    ]
  },
]

export default function ServicesPage() {
  const toast = useToast()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [services, setServices] = useState(mockServices)
  const [loading, setLoading] = useState(true)

  // Buscar serviços da API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services')
        if (response.ok) {
          const data = await response.json()
          setServices(data)
        } else {
          console.error('Erro ao buscar serviços')
          // Usar dados mockados em caso de erro
          setServices(mockServices)
        }
      } catch (error) {
        console.error('Erro ao buscar serviços:', error)
        // Usar dados mockados em caso de erro
        setServices(mockServices)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const handleNewService = () => {
    setSelectedService(null)
    setFormMode('create')
    setIsFormOpen(true)
  }

  const handleEdit = (service: {
    id: string
    name: string
    description: string
    type: string
    basePrice: number
  }) => {
    setSelectedService(service)
    setFormMode('edit')
    setIsFormOpen(true)
  }

  const handleDelete = async (service: {
    id: string
    name: string
  }) => {
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Serviço excluído com sucesso!')
        // Recarregar a página para atualizar os dados
        window.location.reload()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erro ao excluir serviço')
      }
    } catch (error) {
      console.error('Erro ao excluir serviço:', error)
      toast.error('Erro ao excluir serviço')
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setSelectedService(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Serviços</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Gerencie os serviços oferecidos</p>
        </div>
        <Button onClick={handleNewService}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p style={{ color: 'var(--muted-foreground)' }}>Carregando serviços...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
          <Card key={service.id} className="hover-card">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(service)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Preço base:</span>
                  <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                    {service.basePrice > 0 ? `R$ ${service.basePrice.toFixed(2)}` : 'Sob consulta'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Contratos ativos:</span>
                  <span className="font-medium" style={{ color: 'var(--foreground)' }}>{service.contracts}</span>
                </div>

                {service.subServices && (
                  <div>
                    <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--foreground)' }}>Sub-serviços:</h4>
                    <div className="space-y-2">
                      {service.subServices.map((subService, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'var(--muted)' }}>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{subService.name}</p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{subService.description}</p>
                          </div>
                          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>R$ {subService.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {service.plans && (
                  <div>
                    <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--foreground)' }}>Planos disponíveis:</h4>
                    <div className="space-y-2">
                      {service.plans.map((plan, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'var(--muted)' }}>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{plan.name}</p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{plan.description}</p>
                          </div>
                          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>R$ {plan.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Modal do formulário */}
      <ServiceForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        service={selectedService}
        mode={formMode}
      />
    </div>
  )
}
