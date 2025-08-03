import { toast } from "sonner"

export const useToast = () => {
  const success = (message: string, options?: Record<string, unknown>) => {
    console.log('Toast success chamado:', message)
    try {
      toast.success(message, {
        duration: 5000,
        ...options
      })
    } catch (error) {
      console.error('Erro ao mostrar toast success:', error)
    }
  }

  const error = (message: string, options?: Record<string, unknown>) => {
    console.log('Toast error chamado:', message)
    try {
      toast.error(message, {
        duration: 7000,
        ...options
      })
    } catch (error) {
      console.error('Erro ao mostrar toast error:', error)
    }
  }

  const warning = (message: string, options?: Record<string, unknown>) => {
    console.log('Toast warning chamado:', message)
    try {
      toast.warning(message, {
        duration: 6000,
        ...options
      })
    } catch (error) {
      console.error('Erro ao mostrar toast warning:', error)
    }
  }

  const info = (message: string, options?: Record<string, unknown>) => {
    console.log('Toast info chamado:', message)
    try {
      toast.info(message, {
        duration: 5000,
        ...options
      })
    } catch (error) {
      console.error('Erro ao mostrar toast info:', error)
    }
  }

  const loading = (message: string, options?: Record<string, unknown>) => {
    console.log('Toast loading chamado:', message)
    try {
      return toast.loading(message, {
        duration: Infinity,
        ...options
      })
    } catch (error) {
      console.error('Erro ao mostrar toast loading:', error)
      return null
    }
  }

  const dismiss = (toastId: string | number) => {
    console.log('Toast dismiss chamado:', toastId)
    try {
      toast.dismiss(toastId)
    } catch (error) {
      console.error('Erro ao dismiss toast:', error)
    }
  }

  const dismissAll = () => {
    console.log('Toast dismissAll chamado')
    try {
      toast.dismiss()
    } catch (error) {
      console.error('Erro ao dismiss all toasts:', error)
    }
  }

  return {
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    dismissAll
  }
}
