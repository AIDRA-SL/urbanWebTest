'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types/order'
import { useRouter } from 'next/navigation'

interface OrderItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  size: string | null
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  utmSource: string | null
  createdAt: Date
  items: OrderItem[]
}

interface Props {
  orders: Order[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-600',
}

export function OrdersClient({ orders }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Order | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({})

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus((prev) => ({ ...prev, [orderId]: true }))
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setUpdatingStatus((prev) => ({ ...prev, [orderId]: false }))
    router.refresh()
    if (selected?.id === orderId) {
      setSelected({ ...selected, status: newStatus })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Table */}
      <div className="lg:col-span-3 bg-white border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Pedido</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium hidden sm:table-cell">Cliente</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Total</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelected(order)}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === order.id ? 'bg-gray-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-sm">{order.customerName ?? '—'}</p>
                    {order.utmSource && (
                      <p className="text-xs text-gray-400 capitalize">via {order.utmSource}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatPrice(order.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-sm text-gray-400 py-8 text-center">No hay pedidos todavía.</p>
          )}
        </div>
      </div>

      {/* Detail */}
      {selected && (
        <div className="lg:col-span-2 bg-white border border-gray-100 p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-sm font-bold">{selected.orderNumber}</p>
              <p className="text-xs text-gray-400">{format(new Date(selected.createdAt), "dd 'de' MMMM yyyy, HH:mm", { locale: es })}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-black">✕</button>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Estado</label>
            <select
              value={selected.status}
              onChange={(e) => handleStatusChange(selected.id, e.target.value)}
              disabled={!!updatingStatus[selected.id]}
              className="text-sm border border-gray-200 px-2 py-1.5 focus:outline-none focus:border-black"
            >
              {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Customer */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Cliente</p>
            <p className="text-sm">{selected.customerName ?? '—'}</p>
            {selected.customerEmail && <p className="text-xs text-gray-500">{selected.customerEmail}</p>}
            {selected.customerPhone && <p className="text-xs text-gray-500">{selected.customerPhone}</p>}
            {selected.utmSource && <p className="text-xs text-gray-400 mt-1">Origen: {selected.utmSource}</p>}
          </div>

          {/* Items */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Artículos</p>
            <div className="flex flex-col gap-2">
              {selected.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.productName} {item.size && `(${item.size})`} × {item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-semibold text-sm">
              <span>Total</span>
              <span>{formatPrice(selected.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
