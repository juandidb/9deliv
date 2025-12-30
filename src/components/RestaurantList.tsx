/* Listado de restaurantes. */


import type { Restaurant } from '../types/domain'
import RestaurantCard from './RestaurantCard'
import { IconArrowLeft, IconArrowRight } from './Icons'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

export default function RestaurantList({ restaurants }: { restaurants: Restaurant[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    const node = scrollRef.current
    if (!node) return
    const cardWidth = 260 + 16 // tarjeta + gap
    node.scrollBy({ left: dir === 'left' ? -cardWidth * 2 : cardWidth * 2, behavior: 'smooth' })
  }
  if (restaurants.length === 0) {
    return (
      <div className="card p-4 text-sm">
        <div className="text-sm font-semibold">Sin resultados</div>
        <div className="mt-1 text-xs text-slate-500">Probá con otra búsqueda o categoría.</div>
      </div>
    )
  }
  return (
    <>
      <div className="relative flex items-center" style={{ maxWidth: '1160px' }}>
        <button
          className="absolute left-0 z-10 h-12 w-12 flex items-center justify-center rounded-full bg-white shadow border border-slate-200 hover:bg-slate-50 transition disabled:opacity-40 hidden md:flex"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
          onClick={() => scroll('left')}
          aria-label="Ver anteriores"
          disabled={restaurants.length <= 4}
        >
          <IconArrowLeft size={28} />
        </button>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto md:overflow-x-hidden pb-2"
          style={{ maxWidth: '1160px', scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
        >
          {restaurants.map((r) => (
            <div key={r.id} className="min-w-[260px] max-w-[260px] flex-shrink-0">
              <RestaurantCard restaurant={r} />
            </div>
          ))}
        </div>
        <button
          className="absolute right-0 z-10 h-12 w-12 flex items-center justify-center rounded-full bg-white shadow border border-slate-200 hover:bg-slate-50 transition disabled:opacity-40 hidden md:flex"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
          onClick={() => scroll('right')}
          aria-label="Ver siguientes"
          disabled={restaurants.length <= 4}
        >
          <IconArrowRight size={28} />
        </button>
      </div>
      <div className="flex justify-center mt-4">
        <Link
          to="/all-restaurants"
          className="btn btn-primary rounded-full px-6 py-2 text-base font-semibold shadow"
        >
          Ver más
        </Link>
      </div>
    </>
  )
}
