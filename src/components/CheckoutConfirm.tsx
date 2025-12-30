/* Confirmación final y envío por WhatsApp. */

import type { CartLine, OrderDraft, Restaurant } from '../types/domain'

export default function CheckoutConfirm({
  restaurant,
  items,
  total,
  draft,
  onBack,
  onSend,
}: {
  restaurant: Restaurant | null
  items: CartLine[]
  total: number
  draft: OrderDraft
  onBack: () => void
  onSend: () => void
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Confirmar</div>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Volver
        </button>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3 text-sm">
        <div className="text-xs text-slate-500">Restaurante</div>
        <div className="font-semibold">{restaurant?.name ?? '—'}</div>
        <div className="mt-2 text-xs text-slate-500">Cliente</div>
        <div className="font-semibold">{draft.customerName || '—'}</div>
        <div className="mt-2 text-xs text-slate-500">Dirección</div>
        <div className="font-semibold">{draft.customerAddress || '—'}</div>
        <div className="mt-2 text-xs text-slate-500">Método de pago</div>
        <div className="font-semibold">{draft.paymentMethod ? (draft.paymentMethod === 'efectivo' ? 'Efectivo' : 'Transferencia') : '—'}</div>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3">
        <div className="text-xs font-semibold text-slate-700">Platos</div>
        <div className="mt-2 grid gap-2">
          {items.map((it) => (
            <div key={it.itemId} className="text-sm">
              <div className="flex items-center justify-between">
                <div>
                  {it.quantity} x {it.name}
                  {it.note?.trim() ? <span className="text-slate-500"> ({it.note.trim()})</span> : null}
                </div>
                <div className="font-semibold tabular-nums">${it.unitPrice * it.quantity}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
          <div className="font-semibold">Total</div>
          <div className="font-semibold tabular-nums">${total}</div>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          className="btn w-full rounded-2xl bg-emerald-600 px-4 py-3 text-white"
          onClick={onSend}
        >
          Enviar pedido por WhatsApp
        </button>
      </div>
    </div>
  )
}
