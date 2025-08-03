"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Settings, Save, Shield, History, Key, Bell } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "Cliente Management",
    email: "admin@empresa.com",
    phone: "(11) 99999-9999"
  })
  const toast = useToast()

  const handleSaveSettings = () => {
    toast.loading("Salvando configurações...")
    
    setTimeout(() => {
      toast.dismiss()
      toast.success("Configurações salvas com sucesso!")
    }, 2000)
  }

  const handleChangePassword = () => {
    toast.info("Funcionalidade de alteração de senha será implementada em breve!")
  }

  const handleTwoFactorAuth = () => {
    toast.warning("Autenticação em duas etapas será implementada em breve!")
  }

  const handleLoginHistory = () => {
    toast.info("Histórico de login será implementado em breve!")
  }

  const testToasts = () => {
    toast.success("Teste de sucesso!")
    setTimeout(() => toast.error("Teste de erro!"), 1000)
    setTimeout(() => toast.warning("Teste de aviso!"), 2000)
    setTimeout(() => toast.info("Teste de informação!"), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
      </div>

      {/* Teste de Toasts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Teste de Toasts
          </CardTitle>
          <CardDescription>
            Teste se os toasts estão funcionando corretamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={testToasts} variant="outline">
            Testar Todos os Toasts
          </Button>
        </CardContent>
      </Card>

      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
          <CardDescription>
            Configure as informações básicas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Nome da empresa"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail de Contato</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contato@empresa.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          <Button onClick={handleSaveSettings} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Segurança
          </CardTitle>
          <CardDescription>
            Configure as opções de segurança da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
              <div>
                <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>Alterar Senha</h4>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Atualize sua senha de acesso
                </p>
              </div>
            </div>
            <Button onClick={handleChangePassword} variant="outline">
              Alterar
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
              <div>
                <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>Autenticação em Duas Etapas</h4>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Adicione uma camada extra de segurança
                </p>
              </div>
            </div>
            <Button onClick={handleTwoFactorAuth} variant="outline">
              Configurar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico
          </CardTitle>
          <CardDescription>
            Visualize o histórico de atividades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <History className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
              <div>
                <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>Histórico de Login</h4>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Visualize todos os acessos à sua conta
                </p>
              </div>
            </div>
            <Button onClick={handleLoginHistory} variant="outline">
              Visualizar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
