/* Contratos de dominio (mocks hoy, API real mañana). */

export type MenuExtra = {
  id: string
  name: string
  price: number
}

export type MenuItem = {
  id: string
  name: string
  price: number
  description: string
  available: boolean
  category: string
  image?: string
  extras?: MenuExtra[]
}

export type Restaurant = {
  id: string
  name: string
  categories: string[]
  phone: string
  address: string
  hours: string
  menu: MenuItem[]
  image: string
  deliveryCost?: number // Costo de envío
  estimatedTime?: string // Tiempo de demora
  onlyTakeaway?: boolean // Solo disponible para retiros
}

export type CartLine = {
  restaurantId: string
  itemId: string
  name: string
  unitPrice: number
  quantity: number
  note?: string
  image?: string
  extras?: { id: string; name: string; price: number }[]
  extrasTotal?: number
}

export type CartState = {
  restaurantId: string | null
  items: CartLine[]
}

export type OrderDraft = {
  customerName: string
  customerAddress: string
  generalNote: string
  paymentMethod?: 'efectivo' | 'transferencia'
}

export type WhatsAppOrderPayload = {
  customerName: string
  customerAddress: string
  restaurantName: string
  lines: Array<{
    quantity: number
    name: string
    unitPrice: number
    note?: string
    extras?: { id: string; name: string; price: number }[]
  }>
  total: number
  generalNote?: string
  paymentMethod?: string
}
