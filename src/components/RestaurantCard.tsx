/* Card de restaurante para el listado. */

import { Link } from 'react-router-dom'

import type { Restaurant } from '../types/domain'
import { isOpenNow } from '../utils/hours'
import { IconClock, IconDelivery } from './Icons'
import { formatNumber } from '../utils/formatNumber'

export default function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const open = isOpenNow(restaurant.hours)

  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_12px_36px_rgba(15,23,42,0.10)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
      aria-label={`Abrir ${restaurant.name}`}
    >
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-slate-900/25 to-transparent" aria-hidden="true" />
        <span
          className={`absolute left-3 top-3 inline-flex items-center rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur ${
            open ? 'bg-emerald-400/30' : 'bg-rose-400/30'
          }`}
        >
          {open ? 'Abierto' : 'Cerrado'}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 text-base font-semibold leading-tight text-slate-900 group-hover:text-slate-950">
            {restaurant.name}
          </div>
        </div>
        <div className="text-xs text-slate-500">{restaurant.categories.join(' · ')}</div>
        <div className="truncate text-xs text-slate-500">{restaurant.address}</div>
        {/* Removed 'Ver menú' button as requested. */}
        <div className="mt-2 flex gap-3 flex-wrap">
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 px-2 py-1">
            <IconClock className="h-4 w-4 text-emerald-600" />
            <span className="text-[11px] text-slate-700">
              {restaurant.estimatedTime ? `${restaurant.estimatedTime} min` : '30-40 min'}
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 px-2 py-1">
            <IconDelivery className="h-4 w-4 text-emerald-600" />
            <span className="text-[11px] text-slate-700">
              {typeof restaurant.deliveryCost === 'number' ? `$${formatNumber(restaurant.deliveryCost)} envío` : '$500 envío'}
            </span>
          </div>
          {restaurant.onlyTakeaway ? (
            <span className="flex items-center gap-1 rounded-xl bg-yellow-100 px-2 py-1 text-[11px] text-yellow-800 font-semibold">
              Solo retiros en el restaurant
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
