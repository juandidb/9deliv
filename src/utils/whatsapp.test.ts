import { buildWhatsAppLink, buildWhatsAppMessage } from './whatsapp'

describe('whatsapp utils', () => {
  it('normaliza teléfono y encodea el mensaje', () => {
    const payload = {
      customerName: 'Juan',
      customerAddress: 'Calle Falsa 123',
      restaurantName: 'Pizzería San Juan',
      lines: [
        { quantity: 2, name: 'Muzzarella', unitPrice: 1200, note: 'sin cebolla' },
        { quantity: 1, name: 'Coca 500ml', unitPrice: 450 },
      ],
      total: 2850,
      generalNote: 'tocar timbre',
    }

    const message = buildWhatsAppMessage(payload)
    expect(message).toContain('*Cliente:* Juan')
    expect(message).toContain('• 2 x Muzzarella (sin cebolla)')
    expect(message).toContain('Enviado desde 9delivery')

    const link = buildWhatsAppLink('+54 9 351 234 5678', payload)
    expect(link.startsWith('https://wa.me/5493512345678?text=')).toBe(true)
    expect(link).toContain(encodeURIComponent('*Cliente:* Juan'))
    expect(link).toContain(encodeURIComponent('Enviado desde 9delivery'))
  })
})
