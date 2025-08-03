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
      stacked={true}
      theme="system"
      toastOptions={{
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
        success: {
          style: {
            background: 'hsl(142.1 76.2% 36.3%)',
            color: 'white',
            border: '1px solid hsl(142.1 70.6% 45.3%)',
          },
        },
        error: {
          style: {
            background: 'hsl(0 84.2% 60.2%)',
            color: 'white',
            border: '1px solid hsl(0 72.2% 50.6%)',
          },
        },
        warning: {
          style: {
            background: 'hsl(48 96% 53%)',
            color: 'black',
            border: '1px solid hsl(48 95% 47%)',
          },
        },
        info: {
          style: {
            background: 'hsl(214 95% 93%)',
            color: 'hsl(214 32% 91%)',
            border: '1px solid hsl(214 32% 91%)',
          },
        },
      }}
    />
  )
}
