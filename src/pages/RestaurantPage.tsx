/* Detalle: menú del restaurante + agregar al carrito. */

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import MenuItemCard from '../components/MenuItemCard'
import { IconArrowLeft } from '../components/Icons'
import { useCart } from '../context/CartContext'
import { useUI } from '../context/UIContext'
import { getRestaurantById } from '../services/api'
import type { Restaurant } from '../types/domain'
import { isOpenNow } from '../utils/hours'

export default function RestaurantPage() {
  const { id } = useParams()
  const { addItem, state, total } = useCart()
  const { setCartOpen } = useUI()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [justAddedItemId, setJustAddedItemId] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    if (!id) return
    getRestaurantById(id).then((r) => {
      if (!alive) return
      setRestaurant(r)
    })
    return () => {
      alive = false
    }
  }, [id])

  const open = useMemo(() => (restaurant ? isOpenNow(restaurant.hours) : true), [restaurant])

  const cartCount = useMemo(() => state.items.reduce((acc, it) => acc + it.quantity, 0), [state.items])
  const cartForThisRestaurant = state.restaurantId === null || (restaurant ? state.restaurantId === restaurant.id : true)

  const qtyByItemId = useMemo(() => {
    const map: Record<string, number> = {}
    for (const it of state.items) map[it.itemId] = it.quantity
    return map
  }, [state.items])

  const groupedMenu = useMemo(() => {
    if (!restaurant) return [] as Array<{ category: string; items: Restaurant['menu'] }>
    const bucket: Record<string, Restaurant['menu']> = {}
    restaurant.menu.forEach((item) => {
      const cat = item.category || 'Otros'
      bucket[cat] = bucket[cat] ? [...bucket[cat], item] : [item]
    })

    const declared = restaurant.categories || []
    const extras = Object.keys(bucket)
      .filter((c) => !declared.includes(c))
      .sort((a, b) => a.localeCompare(b))
    const ordered = [...declared, ...extras].filter((c) => bucket[c]?.length)

    return ordered.map((category) => ({ category, items: bucket[category] }))
  }, [restaurant])

  if (!restaurant) {
    return (
      <div className="card p-4 text-sm">
        <div className="text-sm font-semibold">Cargando…</div>
        <div className="mt-1 text-xs text-slate-500">Estamos trayendo el menú.</div>
      </div>
    )
  }

  return (
    <div>
      <Link to="/" className="btn btn-ghost inline-flex rounded-full px-3 py-2 text-sm">
        <IconArrowLeft className="h-5 w-5" />
        Volver
      </Link>

      <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_22px_60px_rgba(15,23,42,0.14)]">
        <div className="relative h-48 w-full overflow-hidden bg-slate-100 lg:h-60">
          <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/25 to-transparent" aria-hidden="true" />
          <span
            className={`absolute left-4 top-4 inline-flex items-center rounded-full border border-white/35 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur ${
              open ? 'bg-emerald-400/30' : 'bg-rose-400/30'
            }`}
          >
            {open ? 'Abierto' : 'Cerrado'}
          </span>

          <div className="absolute bottom-4 left-4 right-4 text-white drop-shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 text-xl font-semibold leading-tight lg:text-2xl">{restaurant.name}</div>
            </div>
            <div className="mt-1 text-sm text-white/80">{restaurant.categories.join(' · ')}</div>
            <div className="mt-1 truncate text-xs text-white/70">{restaurant.address}</div>
          </div>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[2fr,1fr] lg:p-6">
          <div className="text-sm text-slate-600">
            <div className="text-xs uppercase tracking-wide text-slate-500">Horario</div>
            <div className="mt-1 text-base font-semibold text-slate-900">{restaurant.hours}</div>
            <div className="mt-2 text-xs text-slate-500">Todos los envíos siguen la planificación premium: comunicación clara y entregas cuidadas.</div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-full lg:max-w-sm lg:justify-self-end">
            <div className="rounded-2xl border border-slate-200 bg-white/75 px-3 py-2 text-sm text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <div className="text-xs text-slate-500">Platos en carta</div>
              <div className="mt-0.5 text-base font-semibold tabular-nums">{restaurant.menu.length}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/75 px-3 py-2 text-sm text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <div className="text-xs text-slate-500">Categorías</div>
              <div className="mt-0.5 text-base font-semibold tabular-nums">{restaurant.categories.length}</div>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="mt-4 space-y-4">
        {groupedMenu.map((group) => (
          <section key={group.category} aria-label={`Categoría ${group.category}`}>
            <div className="mb-2 flex items-end justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-slate-900">{group.category}</div>
                <div className="mt-0.5 text-xs text-slate-500">{group.items.length} plato{group.items.length === 1 ? '' : 's'}</div>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {group.items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  justAdded={justAddedItemId === item.id}
                  quantityInCart={qtyByItemId[item.id] ?? 0}
                  onAdd={() => {
                    const wasEmpty = state.items.length === 0
                    const res = addItem({
                      restaurantId: restaurant.id,
                      item: { id: item.id, name: item.name, price: item.price, image: item.image },
                    })
                    if (!res.ok) setError(res.error)
                    else {
                      setError(null)
                      setJustAddedItemId(item.id)
                      setToast(`Agregado: ${item.name}`)
                      if (wasEmpty) {
                        window.setTimeout(() => setCartOpen(true), 150)
                      }
                      window.setTimeout(() => setJustAddedItemId(null), 900)
                      window.setTimeout(() => setToast(null), 1800)
                    }
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {toast ? (
        <div
          className="fixed bottom-20 left-0 right-0 z-30 mx-auto w-full max-w-md px-4"
          aria-live="polite"
          role="status"
        >
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-[0_16px_40px_rgba(15,23,42,0.28)]">
            <div className="min-w-0 truncate">{toast}</div>
            <button
              type="button"
              className="shrink-0 rounded-xl bg-white/10 px-3 py-1.5 text-xs"
              onClick={() => setCartOpen(true)}
            >
              Ver carrito
            </button>
          </div>
        </div>
      ) : null}

      {cartCount > 0 && cartForThisRestaurant ? (
        <div className="fixed bottom-20 left-0 right-0 z-20 mx-auto w-full max-w-md px-4">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-left text-sm font-semibold text-white shadow-sm"
            onClick={() => setCartOpen(true)}
            aria-label="Ver carrito"
          >
            <span>
              {cartCount} item{cartCount === 1 ? '' : 's'} · Total ${total}
            </span>
            <span className="rounded-xl bg-white/10 px-3 py-1.5 text-xs">Ver</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}
