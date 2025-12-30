/* Card de plato con botón Agregar. */

import { useEffect, useRef, useState } from 'react'


import { PlusCircle, CheckCircle2 } from 'lucide-react'
import { useState as useLocalState } from 'react'
import { formatNumber } from '../utils/formatNumber'

export default function MenuItemCard({
  item,
  onAdd,
  disabled,
  justAdded,
  quantityInCart,
}: {
  item: MenuItem
  onAdd: (selectedExtras?: string[]) => void
  disabled?: boolean
  justAdded?: boolean
  quantityInCart?: number
}) {

  const qty = quantityInCart ?? 0
  const prevQtyRef = useRef(qty)
  const [bump, setBump] = useState(false)
  // Estado local para extras seleccionados
  const [selectedExtras, setSelectedExtras] = useLocalState<string[]>([])

  useEffect(() => {
    const prev = prevQtyRef.current
    if (qty !== prev) {
      setBump(true)
      window.setTimeout(() => setBump(false), 220)
      prevQtyRef.current = qty
    }
  }, [qty])

  // Manejar selección de extras
  const handleExtraChange = (extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId]
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 lg:p-4">
      <div className="flex gap-3">
        <img
          src={item.image || '/assets/menu/placeholder.svg'}
          alt={item.name}
          className="h-16 w-16 shrink-0 rounded-2xl object-cover lg:h-20 lg:w-20"
          loading="lazy"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{item.name}</div>
              {item.description ? <div className="mt-1 text-xs text-slate-500">{item.description}</div> : null}
            </div>

            <div className="shrink-0 text-sm font-semibold tabular-nums">${formatNumber(item.price)}</div>
          </div>

          {/* Extras disponibles */}
          {item.extras && item.extras.length > 0 && (
            <div className="mt-2 mb-1">
              <div className="text-xs font-semibold text-slate-700 mb-1">Extras disponibles:</div>
              <div className="flex flex-wrap gap-2">
                {item.extras.map((extra) => {
                  const selected = selectedExtras.includes(extra.id)
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => handleExtraChange(extra.id)}
                      className={`transition flex items-center gap-1 text-xs px-3 py-1 rounded-full border-2 ${selected ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-400'} focus:outline-none focus:ring-2 focus:ring-emerald-400`}
                      aria-pressed={selected}
                    >
                      {extra.name} <span className="font-semibold">+${formatNumber(extra.price)}</span>
                      {selected && <span className="ml-1"><CheckCircle2 className="inline h-4 w-4 text-white" /></span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="text-xs">
              {!item.available ? (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-700">No disponible</span>
              ) : justAdded ? (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">Agregado</span>
              ) : qty > 0 ? (
                <span
                  className={`rounded-full bg-slate-900 px-2 py-0.5 text-white transition-transform duration-200 ${
                    bump ? 'scale-105' : 'scale-100'
                  }`}
                >
                  x{qty} en carrito
                </span>
              ) : (
                <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-700">Disponible</span>
              )}
            </div>

            <button
              type="button"
              className="p-0 m-0 bg-transparent border-0 outline-none focus:ring-2 focus:ring-emerald-400 rounded-full transition"
              onClick={() => onAdd(selectedExtras)}
              disabled={disabled || !item.available}
              aria-label={justAdded ? 'Agregado' : 'Agregar al carrito'}
            >
              {justAdded ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : (
                <PlusCircle className="h-6 w-6 text-emerald-600 hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
