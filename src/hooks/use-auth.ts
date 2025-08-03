"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from './use-toast'

interface User {
  id: string
  email: string
  name: string
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const toast = useToast()

  // Verificar se o usuário está autenticado
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Verificar se existe cookie de autenticação
        const cookies = document.cookie.split(';')
        const authToken = cookies.find(cookie => cookie.trim().startsWith('auth-token='))
        const userData = cookies.find(cookie => cookie.trim().startsWith('user-data='))

        if (authToken && userData) {
          const userDataValue = userData.split('=')[1]
          const user = JSON.parse(decodeURIComponent(userDataValue))
          setUser(user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Função de logout
  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setUser(null)
        toast.success('Logout realizado com sucesso!')
        router.push('/login')
      } else {
        toast.error('Erro ao fazer logout')
      }
    } catch (error) {
      console.error('Erro no logout:', error)
      toast.error('Erro ao fazer logout')
    }
  }

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user,
  }
} 