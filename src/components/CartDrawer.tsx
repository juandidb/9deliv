import { formatNumber } from '../utils/formatNumber'
/* Drawer accesible del carrito + checkout + confirmación. */

import { useEffect, useMemo, useState } from 'react'

import { getRestaurantById } from '../services/api'
import type { OrderDraft, Restaurant, WhatsAppOrderPayload } from '../types/domain'
import { buildWhatsAppLink } from '../utils/whatsapp'
import { useCart } from '../context/CartContext'
import CheckoutForm from './CheckoutForm'
import CheckoutConfirm from './CheckoutConfirm'

type Step = 'cart' | 'checkout' | 'confirm'

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, removeItem, setQuantity, setNote, clear, total } = useCart()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [step, setStep] = useState<Step>('cart')
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<OrderDraft>({ customerName: '', customerAddress: '', generalNote: '', paymentMethod: 'efectivo' })

  useEffect(() => {
    if (!open) {
      setStep('cart')
      setError(null)
      return
    }

    const id = state.restaurantId
    if (!id) {
      setRestaurant(null)
      return
    }

    let alive = true
    getRestaurantById(id).then((r) => {
      if (!alive) return
      setRestaurant(r)
    })
    return () => {
      alive = false
    }
  }, [open, state.restaurantId])

  const canCheckout = state.items.length > 0

  const payload: WhatsAppOrderPayload | null = useMemo(() => {
    if (!restaurant) return null
    return {
      customerName: draft.customerName.trim(),
      customerAddress: draft.customerAddress.trim(),
      restaurantName: restaurant.name,
      lines: state.items.map((it) => ({
        quantity: it.quantity,
        name: it.name,
        unitPrice: it.unitPrice,
        note: it.note,
        extras: it.extras || [],
      })),
      total,
      generalNote: draft.generalNote,
      paymentMethod: draft.paymentMethod,
    }
  }, [draft.customerAddress, draft.customerName, draft.generalNote, restaurant, state.items, total])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Cerrar carrito"
      />
      <section className="absolute bottom-0 left-0 right-0 mx-auto w-full max-w-md rounded-t-3xl bg-white/95 p-4 backdrop-blur">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Carrito</div>
            <div className="text-xs text-slate-500">{restaurant ? restaurant.name : '—'}</div>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cerrar
          </button>
        </div>

        {error ? (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {step === 'cart' ? (
          <div className="mt-4">
            {state.items.length === 0 ? (
              <div className="card p-4 text-sm">
                <div className="text-sm font-semibold">Tu carrito está vacío</div>
                <div className="mt-1 text-xs text-slate-500">Agregá platos para continuar al checkout.</div>
              </div>
            ) : (
              <div className="grid gap-3">
                {state.items.map((it) => (
                  <div key={it.itemId} className="rounded-2xl border border-slate-200/80 bg-white/80 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 gap-3">
                        <img
                          src={it.image || '/assets/menu/placeholder.svg'}
                          alt={it.name}
                          className="h-12 w-12 shrink-0 rounded-xl object-cover"
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{it.name}</div>
                          {it.extras && it.extras.length > 0 && (
                            <div className="mt-1 text-xs text-emerald-700 flex flex-wrap gap-1">
                              {it.extras.map(extra => (
                                <span key={extra.id} className="bg-emerald-50 rounded-full px-2 py-0.5">
                                  +{extra.name} <span className="font-semibold">${formatNumber(extra.price)}</span>
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-1 text-xs text-slate-500">
                            <span className="tabular-nums">${formatNumber(it.unitPrice)}</span>
                            {it.extras && it.extras.length > 0 && (
                              <>
                                {' '}+
                                <span className="tabular-nums text-emerald-700">${formatNumber(it.extras.reduce((sum, e) => sum + e.price, 0))}</span>
                              </>
                            )}
                            {' '}· Subtotal:{' '}
                            <span className="tabular-nums">${formatNumber((it.unitPrice + (it.extras ? it.extras.reduce((sum, e) => sum + e.price, 0) : 0)) * it.quantity)}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost px-3 py-1.5 text-sm"
                        onClick={() => removeItem(it.itemId)}
                      >
                        Quitar
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <label className="text-xs text-slate-600" htmlFor={`qty-${it.itemId}`}>
                        Cant.
                      </label>

                      <button
                        type="button"
                        className="h-10 w-10 rounded-xl border border-slate-200 bg-white/70 text-lg"
                        onClick={() => setQuantity(it.itemId, it.quantity - 1)}
                        aria-label={`Disminuir cantidad de ${it.name}`}
                      >
                        −
                      </button>

                      <input
                        id={`qty-${it.itemId}`}
                        type="number"
                        min={1}
                        className="w-20 rounded-xl border-slate-200 bg-white/80 text-sm"
                        value={it.quantity}
                        onChange={(e) => setQuantity(it.itemId, Number(e.target.value))}
                      />

                      <button
                        type="button"
                        className="h-10 w-10 rounded-xl border border-slate-200 bg-white/70 text-lg"
                        onClick={() => setQuantity(it.itemId, it.quantity + 1)}
                        aria-label={`Aumentar cantidad de ${it.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm font-semibold">
                Total: <span className="tabular-nums">${formatNumber(total)}</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => clear()}
                disabled={state.items.length === 0}
              >
                Vaciar
              </button>
            </div>

            <div className="mt-4">
              <button
                type="button"
                className="btn btn-primary w-full rounded-2xl px-4 py-3 disabled:opacity-50"
                onClick={() => {
                  if (!canCheckout) return
                  setStep('checkout')
                }}
                disabled={!canCheckout}
              >
                Checkout
              </button>
            </div>
          </div>
        ) : null}

        {step === 'checkout' ? (
          <CheckoutForm
            items={state.items}
            draft={draft}
            onDraftChange={setDraft}
            onSetNote={setNote}
            onBack={() => setStep('cart')}
            onContinue={() => setStep('confirm')}
          />
        ) : null}

        {step === 'confirm' ? (
          <CheckoutConfirm
            restaurant={restaurant}
            items={state.items}
            total={total}
            draft={draft}
            onBack={() => setStep('checkout')}
            onSend={() => {
              setError(null)

              if (state.items.length === 0) {
                setError('No podés enviar un carrito vacío')
                return
              }

              if (!draft.customerName.trim() || !draft.customerAddress.trim()) {
                setError('Por favor completá nombre y dirección para enviar el pedido')
                return
              }

              if (!restaurant || !payload) {
                setError('No se pudo preparar el pedido. Intentá de nuevo.')
                return
              }

              const link = buildWhatsAppLink(restaurant.phone, payload)
              window.location.href = link
            }}
          />
        ) : null}
      </section>
    </div>
  )
}
