export type EventType =
  | 'PAGE_VIEW'
  | 'PRODUCT_VIEW'
  | 'CATEGORY_VIEW'
  | 'SEARCH'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'CART_ABANDON'
  | 'CHECKOUT_START'
  | 'ORDER_PLACED'

export interface TrackEventPayload {
  type: EventType
  productId?: string
  categoryId?: string
  orderId?: string
  searchQuery?: string
}

export interface TrafficSource {
  source: string
  count: number
  percentage: number
}

export interface DailyRevenue {
  date: string
  revenue: number
  orders: number
}

export interface DashboardStats {
  totalOrdersMonth: number
  revenueMonth: number
  avgOrderValue: number
  visitorsToday: number
  visitorsMonth: number
  cartAbandonRate: number
  totalOrdersToday: number
  revenueToday: number
  conversionRate: number
}

export interface ConversionStep {
  step: string
  label: string
  count: number
  rate: number
}

export interface TopProduct {
  name: string
  quantity: number
  revenue: number
}

export interface OrderStatusCount {
  status: string
  label: string
  count: number
}

export interface DeviceCount {
  device: string
  count: number
  percentage: number
}

export interface SearchTerm {
  query: string
  count: number
}

export interface HourlyTraffic {
  hour: string
  count: number
}
