"use client"

import { useState, useCallback } from 'react'

export function useMask() {
  const [maskedValue, setMaskedValue] = useState('')

  const applyPhoneMask = useCallback((value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
  }, [])

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyPhoneMask(e.target.value)
    setMaskedValue(masked)
    return masked
  }, [applyPhoneMask])

  const getUnmaskedValue = useCallback((maskedValue: string) => {
    return maskedValue.replace(/\D/g, '')
  }, [])

  return {
    maskedValue,
    applyPhoneMask,
    handlePhoneChange,
    getUnmaskedValue
  }
} 