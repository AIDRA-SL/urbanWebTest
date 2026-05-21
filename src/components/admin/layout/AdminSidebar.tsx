'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart2,
  Package,
  FolderTree,
  Tag,
  ShoppingBag,
  Image as ImageIcon,
  LogOut,
  Percent,
  Settings,
  Store,
} from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

interface Props {
  adminPath: string
}

export function AdminSidebar({ adminPath }: Props) {
  const pathname = usePathname()

  const base = `/${adminPath}`

  const nav = [
    { href: `${base}/analytics`, label: 'Analíticas', icon: BarChart2 },
    { href: `${base}/productos`, label: 'Productos', icon: Package },
    { href: `${base}/categorias`, label: 'Categorías', icon: FolderTree },
    { href: `${base}/promociones`, label: 'Promociones', icon: Tag },
    { href: `${base}/descuentos`, label: 'Descuentos', icon: Percent },
    { href: `${base}/pedidos`, label: 'Pedidos', icon: ShoppingBag },
    { href: `${base}/hero`, label: 'Hero / Banner', icon: ImageIcon },
    { href: `${base}/marcas`, label: 'Marcas', icon: Store },
    { href: `${base}/configuracion`, label: 'Configuración', icon: Settings },
  ]

  return (
    <aside className="w-60 bg-gray-950 text-white flex flex-col h-screen sticky top-0 flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <Link href="/" target="_blank" className="font-bold text-sm tracking-[0.2em] uppercase opacity-90 hover:opacity-100">
          UrbanStore
        </Link>
        <p className="text-xs text-gray-500 mt-0.5">Panel de gestión</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-6 py-2.5 text-sm transition-colors',
                active
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-800">
        <button
          onClick={() => signOut({ fetchOptions: { onSuccess: () => window.location.replace(`/${adminPath}/login`) } })}
          className="flex items-center gap-3 w-full px-2 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
