export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  size: string | null
  variantId: string | null
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  currency: string
  notes: string | null
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  shippingAddress: string | null
  sessionId: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  createdAt: Date
  updatedAt: Date
  items: OrderItem[]
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}
