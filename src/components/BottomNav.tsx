/* Bottom bar mobile-first: Buscar / Filtros / Carrito */

import { Link, useLocation } from 'react-router-dom'

import { useCart } from '../context/CartContext'
import { IconCart, IconFilter, IconHome, IconUser } from './Icons'

export default function BottomNav({
  onToggleFilters,
  onOpenCart,
}: {
  onGoSearch: () => void
  onToggleFilters: () => void
  onOpenCart: () => void
}) {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { state } = useCart()
  const count = state.items.reduce((acc, it) => acc + it.quantity, 0)

  return (
    <nav className="fixed bottom-3 left-0 right-0 z-30 lg:hidden">
      <div className="mx-auto grid w-full max-w-2xl grid-cols-4 gap-2 rounded-2xl border border-white/40 bg-white/45 p-2 shadow-[0_20px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl">
        <Link
          to="/"
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
            isHome ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:bg-white/60'
          }`}
          aria-label="Ir al inicio"
        >
          <IconHome className="h-5 w-5" />
        </Link>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white/60"
          onClick={onToggleFilters}
          aria-label="Filtros"
        >
          <IconFilter className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm"
          onClick={onOpenCart}
          aria-label="Carrito"
        >
          <IconCart className="h-5 w-5" />
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs tabular-nums">{count}</span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white/60"
          aria-label="Perfil"
        >
          <IconUser className="h-5 w-5" />
        </button>
      </div>
    </nav>
  )
}
