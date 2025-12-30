/* Form de checkout corto (nombre/dirección recomendados; requeridos al enviar). */

import type { CartLine, OrderDraft } from '../types/domain'

export default function CheckoutForm({
  items,
  draft,
  onDraftChange,
  onSetNote,
  onBack,
  onContinue,
}: {
  items: CartLine[]
  draft: OrderDraft
  onDraftChange: (next: OrderDraft) => void
  onSetNote: (itemId: string, note: string) => void
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Checkout</div>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Volver
        </button>
      </div>

      <div className="mt-3 grid gap-3">
        <div>
          <label className="label" htmlFor="name">
            Nombre
          </label>
          <input
            id="name"
            className="input mt-1"
            value={draft.customerName}
            onChange={(e) => onDraftChange({ ...draft, customerName: e.target.value })}
            placeholder="Ej: Juan"
          />
        </div>
        <div>
          <label className="label" htmlFor="address">
            Dirección
          </label>
          <input
            id="address"
            className="input mt-1"
            value={draft.customerAddress}
            onChange={(e) => onDraftChange({ ...draft, customerAddress: e.target.value })}
            placeholder="Ej: Mitre 1234"
          />
        </div>

        <div>
          <label className="label">Método de pago</label>
          <div className="flex gap-3">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="paymentMethod"
                value="efectivo"
                checked={draft.paymentMethod === 'efectivo' || !draft.paymentMethod}
                onChange={(e) => onDraftChange({ ...draft, paymentMethod: e.target.value as 'efectivo' | 'transferencia' })}
              />
              Efectivo
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="paymentMethod"
                value="transferencia"
                checked={draft.paymentMethod === 'transferencia'}
                onChange={(e) => onDraftChange({ ...draft, paymentMethod: e.target.value as 'efectivo' | 'transferencia' })}
              />
              Transferencia
            </label>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-700">Nota por plato</div>
          <div className="mt-2 grid gap-2">
            {items.map((it) => (
              <div key={it.itemId} className="rounded-2xl border border-slate-200/80 bg-white/80 p-3">
                <div className="text-sm font-semibold">{it.quantity} x {it.name}</div>
                <input
                  className="input mt-2"
                  value={it.note ?? ''}
                  onChange={(e) => onSetNote(it.itemId, e.target.value)}
                  placeholder="Ej: sin cebolla"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="generalNote">
            Nota general (opcional)
          </label>
          <textarea
            id="generalNote"
            className="input mt-1"
            rows={3}
            value={draft.generalNote}
            onChange={(e) => onDraftChange({ ...draft, generalNote: e.target.value })}
            placeholder="Ej: tocar timbre"
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          className="btn btn-primary w-full rounded-2xl px-4 py-3"
          onClick={onContinue}
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
