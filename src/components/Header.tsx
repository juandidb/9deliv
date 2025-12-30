/* Header simple (marca + acceso a carrito). */

import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

import { useCart } from '../context/CartContext'
import { IconCart, IconHelp, IconSearch, IconMotorbike } from './Icons'

export default function Header({ onOpenCart, query, setQuery }: { onOpenCart: () => void, query: string, setQuery: (q: string) => void }) {
  const { state } = useCart()
  const count = state.items.reduce((acc, it) => acc + it.quantity, 0)

  const [brandText, setBrandText] = useState('');

  useEffect(() => {
    let currentText = '';
    let currentPhase = 0;
    const interval = setInterval(() => {
      if (currentPhase === 0) {
        const target = 'dejulio';
        if (currentText.length < target.length) {
          currentText = target.slice(0, currentText.length + 1);
          setBrandText(currentText);
        } else {
          currentPhase = 1;
        }
      } else if (currentPhase === 1) {
        if (currentText.length > 2) {
          currentText = currentText.slice(0, -1);
          setBrandText(currentText);
        } else {
          currentPhase = 2;
        }
      } else if (currentPhase === 2) {
        const target = 'delivery';
        if (currentText.length < target.length) {
          currentText = target.slice(0, currentText.length + 1);
          setBrandText(currentText);
        } else {
          clearInterval(interval);
        }
      }
    }, 150); // 150ms per character for smoother effect
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-b from-white/90 via-white/70 to-white/10 pb-3 pt-4 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 lg:max-w-6xl lg:px-10 xl:max-w-7xl xl:px-14">
        <Link
          to="/"
          className="group flex items-center gap-3 rounded-2xl border border-white/40 bg-white/70 px-3 py-2 backdrop-blur-xl shadow-[0_14px_36px_rgba(15,23,42,0.12)] transition hover:bg-white/85 hover:shadow-[0_18px_44px_rgba(15,23,42,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15"
          aria-label="Volver al inicio"
        >
          <div className="relative h-10 w-14 shrink-0 flex items-center justify-center">
            <img
              src="/assets/9deliv.png"
              alt="Mapa de 9 de Julio"
              className="absolute inset-0 h-full w-full object-contain select-none pointer-events-none"
              style={{ filter: 'brightness(0) saturate(100%) invert(85%) sepia(16%) saturate(749%) hue-rotate(176deg) brightness(97%) contrast(92%)' }}
              draggable="false"
            />
            <span className="absolute left-1/2 top-1/2 -translate-x-[calc(50%-3px)] -translate-y-[calc(50%+4px)]">
              <IconMotorbike size={22} className="text-slate-400" />
            </span>
          </div>

          <div className="flex flex-col ml-[-12px] mt-[-10px] min-w-[120px] hidden sm:flex">
            <div className="flex items-baseline gap-1 leading-none">
              <span className="text-[22px] font-semibold tracking-[-0.02em] text-slate-900 block min-w-[80px]">{brandText}</span>
              <span className="text-[12px] font-semibold tracking-[0.14em] text-slate-600">.app</span>
            </div>
          </div>
        </Link>
        {/* Buscador en header */}
        <div className="flex-1 mx-6 max-w-md">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <IconSearch className="h-5 w-5 text-slate-400" />
            <input
              id="search-header"
              className="w-full border-0 bg-transparent p-0 text-sm focus:ring-0"
              placeholder="Buscar restaurante o plato..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query.trim() ? (
              <button type="button" className="btn btn-ghost rounded-full px-3 py-1.5 text-xs" onClick={() => setQuery('')}>
                Limpiar
              </button>
            ) : null}
          </div>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/instrucciones"
            className="rounded-2xl border border-white/40 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-xl shadow-[0_12px_30px_rgba(15,23,42,0.10)] transition hover:bg-white/75"
            aria-label="Instrucciones para locales"
          >
            Registrar mi Restaurant
          </Link>
          <Link
            to="/sobre-nosotros"
            className="rounded-2xl border border-white/40 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-xl shadow-[0_12px_30px_rgba(15,23,42,0.10)] transition hover:bg-white/75"
            aria-label="Sobre nosotros"
          >
            Sobre nosotros
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost rounded-full p-2"
            aria-label="Ayuda"
          >
            <IconHelp className="h-5 w-5 text-slate-500" />
          </button>
          <button
            type="button"
            className="btn btn-primary rounded-full px-4 py-2 shadow-[0_14px_34px_rgba(15,23,42,0.26)]"
            onClick={onOpenCart}
            aria-label="Abrir carrito"
          >
            <IconCart className="h-5 w-5" />
            <span className="tabular-nums">{count}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
