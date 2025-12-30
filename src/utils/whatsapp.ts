/* Lógica encapsulada para construir el link de WhatsApp. */

import type { WhatsAppOrderPayload } from '../types/domain'

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function buildWhatsAppMessage(payload: WhatsAppOrderPayload): string {
  const general = payload.generalNote?.trim() ?? ''
  const payment = payload.paymentMethod
    ? payload.paymentMethod === 'efectivo'
      ? 'Efectivo'
      : 'Transferencia'
    : '-'

  const linesText = payload.lines
    .map((l) => {
      const note = l.note?.trim() ? ` (${l.note.trim()})` : ''
      const extras = l.extras && l.extras.length > 0
        ? '\n  Extras: ' + l.extras.map(e => `${e.name} ($${e.price})`).join(', ')
        : ''
      const extrasTotal = l.extras ? l.extras.reduce((sum, e) => sum + e.price, 0) : 0
      const subtotal = (l.unitPrice + extrasTotal) * l.quantity
      return `• ${l.quantity} x ${l.name}${note}${extras}\n  Precio: $${l.unitPrice}${extrasTotal ? ` + $${extrasTotal} extras` : ''} · Subtotal: $${subtotal}`
    })
    .join('\n')

  return [
    `*PEDIDO — 9delivery*`,
    '────────────────────────',
    `*Cliente:* ${payload.customerName || '-'}`,
    `*Dirección:* ${payload.customerAddress || '-'}`,
    `*Método de pago:* ${payment}`,
    `*Restaurante:* ${payload.restaurantName}`,
    '',
    `*Platos:*`,
    linesText,
    '',
    `*Total:* $${payload.total}`,
    `*Observación:* ${general || '-'}`,
    '',
    'Enviado desde 9delivery',
  ].join('\n')
}

export function buildWhatsAppLink(phone: string, payload: WhatsAppOrderPayload): string {
  const normalized = normalizePhone(phone)
  const message = buildWhatsAppMessage(payload)
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${normalized}?text=${encoded}`
}
