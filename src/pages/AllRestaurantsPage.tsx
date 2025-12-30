import { useEffect, useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import RestaurantCard from '../components/RestaurantCard'
import { getRestaurants } from '../services/api'
import type { Restaurant } from '../types/domain'
import { IconInfo } from '../components/Icons'

export default function AllRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const { query, setQuery } = useOutletContext<{ query: string, setQuery: (q: string) => void }>()

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

  if (loading) {
    return (
      <span className="mx-auto mb-4 block h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" aria-label="Cargando" />
    )
  }

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-[360px,1fr] lg:gap-6 lg:space-y-0 xl:grid-cols-[400px,1fr]">
      <div className="space-y-4">
        <div className="card p-4 lg:sticky lg:top-24 lg:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Explorá el catálogo</div>
              <div className="mt-0.5 text-xs text-slate-500">Buscá por restaurante, categoría o plato</div>
            </div>
          </div>
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
        <div className="text-xl font-semibold text-slate-900">Todos los restaurantes</div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      </div>
    </div>
  )
}
