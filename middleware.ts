import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas que não precisam de autenticação
  const publicRoutes = ['/login', '/api/auth/login']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Se for uma rota pública, permitir acesso
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Verificar se o usuário está autenticado
  const authToken = request.cookies.get('auth-token')
  const userData = request.cookies.get('user-data')

  // Se não estiver autenticado e tentar acessar rota protegida
  if (!authToken || !userData) {
    // Se estiver tentando acessar o dashboard, redirecionar para login
    if (pathname.startsWith('/dashboard') || 
        pathname.startsWith('/clients') || 
        pathname.startsWith('/services') || 
        pathname.startsWith('/payments') || 
        pathname.startsWith('/settings')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Se estiver tentando acessar API protegida, retornar erro 401
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
  }

  // Se estiver autenticado e tentar acessar login, redirecionar para dashboard
  if (authToken && userData && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 