"use client"

import { Toaster } from "sonner"

export function ToastProvider() {
  console.log('ToastProvider renderizado')
  
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={5000}
      expand={true}
      theme="system"
      toastOptions={{
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
      }}
    />
  )
}
