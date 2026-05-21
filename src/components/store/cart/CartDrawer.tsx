'use client'

import { useCartStore } from '@/store/cart'
import { X, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CartDrawer() {
  const items = useCartStore((s) => s.items)
  const isOpen = useCartStore((s) => s.isOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const remove = useCartStore((s) => s.remove)
  const updateQty = useCartStore((s) => s.updateQty)
  const totalPrice = useCartStore((s) => s.totalPrice())
  const totalItems = useCartStore((s) => s.totalItems())

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} strokeWidth={1.5} />
            <span className="text-sm font-medium uppercase tracking-wider">
              Carrito ({totalItems})
            </span>
          </div>
          <button onClick={closeCart} className="p-1 hover:opacity-60 transition-opacity">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag size={40} strokeWidth={1} className="text-gray-300" />
              <div>
                <p className="font-medium text-sm">Tu carrito está vacío</p>
                <p className="text-xs text-gray-400 mt-1">Añade productos para continuar</p>
              </div>
              <Button variant="outline" size="sm" onClick={closeCart}>
                Seguir comprando
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={`${item.productId}:${item.variantId ?? ''}`} className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 flex-shrink-0 overflow-hidden">
                    <Image
                      src={item.imageUrl || '/placeholder.svg'}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/productos/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium leading-tight hover:underline line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    {item.size && (
                      <p className="text-xs text-gray-500 mt-0.5">Talla: {item.size}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200">
                        <button
                          className="px-2 py-0.5 text-sm hover:bg-gray-50"
                          onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button
                          className="px-2 py-0.5 text-sm hover:bg-gray-50"
                          onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="self-start p-1 text-gray-400 hover:text-black transition-colors"
                    onClick={() => remove(item.productId, item.variantId)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="font-semibold">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/carrito" onClick={closeCart}>
                <Button variant="outline" className="w-full" size="lg">
                  Ver carrito
                </Button>
              </Link>
              <Link href="/carrito?step=checkout" onClick={closeCart}>
                <Button className="w-full" size="lg">
                  Finalizar compra
                </Button>
              </Link>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              Los gastos de envío se calculan en el siguiente paso
            </p>
          </div>
        )}
      </div>
    </>
  )
}
