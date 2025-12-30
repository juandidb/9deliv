/* Home: listado con buscador + filtro por categoría (drawer desde bottom nav). */

import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import RestaurantList from '../components/RestaurantList'
// Spinner minimalista
function Spinner() {
  return (
    <span className="mx-auto mb-4 block h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" aria-label="Cargando" />
  )
}
import { IconInfo } from '../components/Icons'
import { useUI } from '../context/UIContext'
import { getRestaurants } from '../services/api'
import type { Restaurant } from '../types/domain'

export default function HomePage() {
  const { filtersOpen, setFiltersOpen } = useUI()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const { query, setQuery } = useOutletContext<{ query: string, setQuery: (q: string) => void }>()
  const [category, setCategory] = useState<string>('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    getRestaurants().then((data) => {
      if (!alive) return
      setRestaurants(data)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>()
    restaurants.forEach((r) => r.categories.forEach((c) => set.add(c)))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [restaurants])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return restaurants.filter((r) => {
      const matchesCategory = !category || r.categories.includes(category)
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.categories.some((c) => c.toLowerCase().includes(q)) ||
        r.menu.some((m) => m.name.toLowerCase().includes(q))
      return matchesCategory && matchesQuery
    })
  }, [category, query, restaurants])

  // const totalRestaurants = restaurants.length
  // const totalCategories = categories.length

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="card p-6 text-center">
          <Spinner />
          <div className="text-base font-semibold text-slate-900">Cargando restaurantes…</div>
          <div className="mt-2 text-xs text-slate-500">Estamos trayendo el catálogo.</div>
        </div>
      </div>
    )
  }

  // Top 10 más elegidos (ficticio)
  const top10 = [
    { name: 'Brooklyn', img: '/10maselegidos/brooklyn.jpeg' },
    { name: 'Food Mitre', img: '/10maselegidos/foodmitre1.jpg' },
    { name: 'Pampita', img: '/10maselegidos/pampita.jpg' },
    { name: 'Toro Burger', img: '/10maselegidos/toroburger.png' },
    { name: 'Potetti', img: '/10maselegidos/pottetti.jpg' },
    { name: 'Real City', img: '/10maselegidos/realcity.jpeg' },
    { name: 'Saborearte', img: '/10maselegidos/saborearte.jpg' },
    { name: 'Manolo', img: '/10maselegidos/manolo.jpg' },
    { name: 'San Marcos', img: '/10maselegidos/sanmarcos.png' },
    { name: 'Torremolinos', img: '/10maselegidos/310063490_573214684611753_2636550487080421926_n.jpg' },
  ]

  return (
    <>
      {/* Top 10 más elegidos */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-slate-900">¡Los 10 más elegidos!</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar sm:flex-wrap sm:overflow-x-visible sm:pb-0">
          {top10.map((r, i) => (
            <div key={i} className="flex flex-col items-center min-w-[90px] max-w-[100px] flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 shadow">
                <img src={r.img} alt={r.name} className="w-full h-full object-cover" />
              </div>
              <span className="mt-2 text-xs text-slate-700 text-center max-w-[5rem] truncate">{r.name}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="space-y-4 lg:grid lg:grid-cols-[360px,1fr] lg:gap-6 lg:space-y-0 xl:grid-cols-[400px,1fr]">
      <div className="space-y-4">
        <div className="card p-4 lg:sticky lg:top-24 lg:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Explorá el catálogo</div>
              <div className="mt-0.5 text-xs text-slate-500">Buscá por restaurante, categoría o plato</div>
            </div>
          </div>

          {/* Buscador movido al header */}
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <IconInfo className="h-4 w-4" />
            Mostrando {filtered.length} restaurantes
          </div>

          <div className="mt-3">
            <div className="label">Categorías</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className={`chip ${!category ? 'chip-active' : ''}`}
                onClick={() => setCategory('')}
              >
                Todas
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`chip ${category === c ? 'chip-active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="hidden items-center justify-between rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-sm text-slate-600 backdrop-blur-xl lg:flex">
          <div className="font-semibold text-slate-900">Selección destacada</div>
          <div className="text-xs text-slate-500">{filtered.length} resultado{filtered.length === 1 ? '' : 's'}</div>
        </div>

        <RestaurantList restaurants={filtered} />
      </div>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
            aria-label="Cerrar filtros"
          />
          <section className="absolute bottom-0 left-0 right-0 mx-auto w-full max-w-md rounded-t-3xl bg-white/95 p-4 backdrop-blur">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Filtros</div>
              <button type="button" className="btn btn-ghost" onClick={() => setFiltersOpen(false)}>
                Cerrar
              </button>
            </div>

            <div className="mt-3">
              <div className="text-xs text-slate-500">Categoría</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`chip ${!category ? 'chip-active' : ''}`}
                  onClick={() => setCategory('')}
                >
                  Todas
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`chip ${category === c ? 'chip-active' : ''}`}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
