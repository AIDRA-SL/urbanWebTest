'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number
  isActive: boolean
  isFeatured: boolean
  sku: string | null
  createdAt: Date
  images: { url: string }[]
  categories: { id: string; name: string }[]
}

interface Props {
  products: Product[]
  categories: { id: string; name: string; parentId: string | null }[]
  adminPath: string
}

export function ProductsTableClient({ products, adminPath }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    setDeleting(id)
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    setDeleting(null)
    router.refresh()
  }

  const handleToggle = async (id: string, current: boolean) => {
    setToggling(id)
    await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    setToggling(null)
    router.refresh()
  }

  return (
    <div className="bg-white border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium w-12"></th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Producto</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium hidden sm:table-cell">Categoría</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Precio</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium hidden md:table-cell">Estado</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  {product.images[0] ? (
                    <div className="w-10 h-10 bg-gray-100 overflow-hidden">
                      <Image src={product.images[0].url} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gray-100" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                  {product.sku && <p className="text-xs text-gray-400">{product.sku}</p>}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs text-gray-500">
                    {product.categories.map((c) => c.name).join(', ') || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{formatPrice(product.price)}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {product.isActive ? 'Activo' : 'Oculto'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleToggle(product.id, product.isActive)}
                      disabled={toggling === product.id}
                      className="p-1.5 text-gray-400 hover:text-black transition-colors"
                      title={product.isActive ? 'Ocultar' : 'Activar'}
                    >
                      {product.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <Link href={`/${adminPath}/productos/${product.id}`} className="p-1.5 text-gray-400 hover:text-black transition-colors">
                      <Edit size={15} />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={deleting === product.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">No hay productos. Crea el primero.</p>
          </div>
        )}
      </div>
    </div>
  )
}
