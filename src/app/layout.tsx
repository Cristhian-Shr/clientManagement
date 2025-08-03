import type { Metadata } from "next"
import "./globals.css"
import { ToastProvider } from "@/components/providers/toast-provider"

export const metadata: Metadata = {
  title: "Cliente Management",
  description: "Sistema de gerenciamento de clientes",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('RootLayout renderizado - ToastProvider será incluído')
  
  return (
    <html lang="pt-BR">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
