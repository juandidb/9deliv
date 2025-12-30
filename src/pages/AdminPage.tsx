import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import type { MenuExtra, MenuItem, Restaurant } from '../types/domain'
import { isSupabaseConfigured } from '../services/supabaseClient'
import {
  sbDeleteMenuItem,
  sbDeleteRestaurant,
  sbGetAllRestaurantsForAdmin,
  sbGetMyRestaurants,
  sbGetSession,
  sbSignIn,
  sbSignOut,
  sbSignUp,
  sbUploadCoverImage,
  sbUploadMenuImage,
  sbUpsertMenuItem,
  sbUpsertRestaurant,
} from '../services/supabaseApi'

import { parseCategoriesText, resolveMenuCategory } from '../utils/categories'

function newId(prefix: string) {
  return `${prefix}${Math.random().toString(16).slice(2, 10)}`
}

function parseAdminEmails(): string[] {
  const raw = String(import.meta.env.VITE_ADMIN_EMAILS ?? '')
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

type HoursSlot = { from: string; to: string }

function normalizeTime(value: string): string {
  if (!value) return ''
  const [h = '00', m = '00'] = value.split(':')
  const hour = Math.min(23, Math.max(0, Number(h)))
  const min = Math.min(59, Math.max(0, Number(m)))
  return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
}

function parseHoursSlots(raw: string): HoursSlot[] {
  const matches = raw.match(/\b\d{1,2}:\d{2}\b/g) ?? []
  const slots: HoursSlot[] = []
  for (let i = 0; i < matches.length; i += 2) {
    const from = normalizeTime(matches[i])
    const to = normalizeTime(matches[i + 1] ?? matches[i])
    slots.push({ from, to })
  }
  if (slots.length === 0) return [{ from: '09:00', to: '18:00' }]
  return slots
}

function formatHoursSlots(slots: HoursSlot[]): string {
  return slots
    .map((slot) => `${slot.from}-${slot.to}`)
    .join('  -  ')
}

function formatError(e: unknown): string {
  if (e instanceof Error) return e.message
  if (e && typeof e === 'object') {
    // handle common Supabase error shapes
    try {
      // @ts-ignore
      const obj = e as any
      if (obj?.message) return String(obj.message)
      if (obj?.error) return String(obj.error?.message ?? obj.error)
      return JSON.stringify(obj, Object.getOwnPropertyNames(obj))
    } catch {
      return String(e)
    }
  }
  return String(e)
}

export default function AdminPage() {
  const supabaseAvailable = isSupabaseConfigured()

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [notice, setNotice] = useState<string | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [signedIn, setSignedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [categoriesDraftByRestaurantId, setCategoriesDraftByRestaurantId] = useState<Record<string, string>>({})
  const [hoursDraftByRestaurantId, setHoursDraftByRestaurantId] = useState<Record<string, HoursSlot[]>>({})

  const isAdmin = useMemo(() => {
    if (!userEmail) return false
    const admins = parseAdminEmails()
    return admins.includes(userEmail.toLowerCase())
  }, [userEmail])

  const selected = useMemo(() => restaurants.find((r) => r.id === selectedId) ?? null, [restaurants, selectedId])
  const hoursSlots = selected ? hoursDraftByRestaurantId[selected.id] ?? parseHoursSlots(selected.hours) : []

  useEffect(() => {
    if (!selected) return
    setCategoriesDraftByRestaurantId((prev) => {
      if (prev[selected.id] != null) return prev
      return { ...prev, [selected.id]: selected.categories.join(', ') }
    })
  }, [selected])

  useEffect(() => {
    if (!selected) return
    setHoursDraftByRestaurantId((prev) => {
      const parsed = parseHoursSlots(selected.hours)
      const existing = prev[selected.id]
      if (!existing) {
        return { ...prev, [selected.id]: parsed }
      }
      if (formatHoursSlots(existing) !== formatHoursSlots(parsed)) {
        return { ...prev, [selected.id]: parsed }
      }
      return prev
    })
  }, [selected])

  async function fetchRestaurantsForCurrentUser() {
    return isAdmin ? sbGetAllRestaurantsForAdmin() : sbGetMyRestaurants()
  }

  useEffect(() => {
    let alive = true
    async function init() {
      if (!supabaseAvailable) return
      try {
        const { data } = await sbGetSession()
        if (!alive) return
        const ok = Boolean(data.session?.user)
        setSignedIn(ok)
        setUserEmail(data.session?.user.email ?? null)
        if (ok) {
          const mine = await fetchRestaurantsForCurrentUser()
          if (!alive) return
          setRestaurants(mine)
          setSelectedId(mine[0]?.id ?? '')
        } else {
          setRestaurants([])
          setSelectedId('')
        }
      } catch (e) {
        if (!alive) return
        setNotice(`Error al conectar con Supabase: ${formatError(e)}`)
      }
    }
    init()
    return () => {
      alive = false
    }
  }, [supabaseAvailable, isAdmin])

  function updateRestaurant(patch: Partial<Restaurant>) {
    if (!selected) return
    setRestaurants((prev) => prev.map((r) => (r.id === selected.id ? { ...r, ...patch } : r)))
  }

  function updateMenuItem(itemId: string, patch: Partial<MenuItem>) {
    if (!selected) return
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id !== selected.id) return r
        return { ...r, menu: r.menu.map((m) => (m.id === itemId ? { ...m, ...patch } : m)) }
      }),
    )
  }

  function addExtraToMenuItem(itemId: string) {
    if (!selected) return
    const extra: MenuExtra = { id: newId('extra'), name: '', price: 0 }
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id !== selected.id) return r
        return {
          ...r,
          menu: r.menu.map((m) => (m.id === itemId ? { ...m, extras: [...(m.extras ?? []), extra] } : m)),
        }
      }),
    )
    setNotice('Extra agregado. Completá nombre y precio.')
  }

  function updateMenuItemExtra(itemId: string, extraId: string, patch: Partial<MenuExtra>) {
    if (!selected) return
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id !== selected.id) return r
        return {
          ...r,
          menu: r.menu.map((m) => {
            if (m.id !== itemId) return m
            const nextExtras = (m.extras ?? []).map((ex) => (ex.id === extraId ? { ...ex, ...patch } : ex))
            return { ...m, extras: nextExtras }
          }),
        }
      }),
    )
  }

  function removeExtraFromMenuItem(itemId: string, extraId: string) {
    if (!selected) return
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id !== selected.id) return r
        return {
          ...r,
          menu: r.menu.map((m) => {
            if (m.id !== itemId) return m
            const nextExtras = (m.extras ?? []).filter((ex) => ex.id !== extraId)
            return { ...m, extras: nextExtras }
          }),
        }
      }),
    )
  }

  function addRestaurant() {
    const id = newId('rest')
    const draft: Restaurant = {
      id,
      name: '',
      categories: [],
      phone: '+549',
      address: '',
      hours: '',
      image: '',
      menu: [],
    }
    setRestaurants((prev) => [draft, ...prev])
    setSelectedId(id)
    setCategoriesDraftByRestaurantId((prev) => ({ ...prev, [id]: '' }))
    setNotice('Restaurante creado. Editá los datos y guardá.')
  }

  function updateHoursSlots(nextSlots: HoursSlot[]) {
    if (!selected) return
    setHoursDraftByRestaurantId((prev) => ({ ...prev, [selected.id]: nextSlots }))
    updateRestaurant({ hours: formatHoursSlots(nextSlots) })
  }

  function changeHoursSlot(index: number, field: keyof HoursSlot, value: string) {
    if (!selected) return
    const slots = hoursDraftByRestaurantId[selected.id] ?? parseHoursSlots(selected.hours)
    const normalized = normalizeTime(value)
    const next = slots.map((slot, i) => (i === index ? { ...slot, [field]: normalized } : slot))
    updateHoursSlots(next)
  }

  function addHoursSlot() {
    if (!selected) return
    const slots = hoursDraftByRestaurantId[selected.id] ?? parseHoursSlots(selected.hours)
    if (slots.length >= 3) return
    const last = slots[slots.length - 1] ?? { from: '09:00', to: '18:00' }
    const base = last.to || last.from || '09:00'
    const nextSlot: HoursSlot = { from: base, to: base }
    updateHoursSlots([...slots, nextSlot])
  }

  function removeHoursSlot(index: number) {
    if (!selected) return
    const slots = hoursDraftByRestaurantId[selected.id] ?? parseHoursSlots(selected.hours)
    if (slots.length <= 1) return
    const next = slots.filter((_, i) => i !== index)
    updateHoursSlots(next)
  }

  function deleteSelectedRestaurant() {
    if (!selected) return
    const ok = window.confirm(`¿Eliminar ${selected.name}?`) 
    if (!ok) return
    setNotice('Eliminando en Supabase...')
    setBusy(true)
    sbDeleteRestaurant(selected.id)
      .then(async () => {
        const mine = await fetchRestaurantsForCurrentUser()
        setRestaurants(mine)
        setSelectedId(mine[0]?.id ?? '')
        setNotice('Restaurante eliminado.')
      })
      .catch((e) => setNotice(`No se pudo eliminar: ${formatError(e)}`))
      .finally(() => setBusy(false))
  }

  function addMenuItem() {
    if (!selected) return
    const item: MenuItem = {
      id: newId('item'),
      name: '',
      price: 0,
      description: '',
      available: true,
      category: '',
      image: '',
      extras: [],
    }
    setRestaurants((prev) => prev.map((r) => (r.id === selected.id ? { ...r, menu: [item, ...r.menu] } : r)))
    setNotice('Plato agregado. Editalo y guardá.')
  }

  function deleteMenuItem(itemId: string) {
    if (!selected) return
    setBusy(true)
    sbDeleteMenuItem(itemId)
      .then(async () => {
        const mine = await fetchRestaurantsForCurrentUser()
        setRestaurants(mine)
        setSelectedId((prev) => prev || mine[0]?.id || '')
        setNotice('Plato eliminado.')
      })
      .catch((e) => setNotice(`No se pudo eliminar plato: ${formatError(e)}`))
      .finally(() => setBusy(false))
  }

  function onUploadMenuItemImage(itemId: string, file: File) {
    if (!selected) return
    setBusy(true)
    sbUploadMenuImage({ restaurantId: selected.id, itemId, file })
      .then((publicUrl) => {
        updateMenuItem(itemId, { image: publicUrl })
        setNotice('Imagen subida a Supabase Storage.')
      })
      .catch((e) => setNotice(`No se pudo subir imagen: ${formatError(e)}`))
      .finally(() => setBusy(false))
  }

  function onUploadCover(file: File) {
    if (!selected) return
    setBusy(true)
    sbUploadCoverImage({ restaurantId: selected.id, file })
      .then((publicUrl) => {
        updateRestaurant({ image: publicUrl })
        setNotice('Portada subida a Supabase Storage.')
      })
      .catch((e) => setNotice(`No se pudo subir portada: ${formatError(e)}`))
      .finally(() => setBusy(false))
  }

  function save() {
    if (!signedIn) {
      setNotice('Tenés que iniciar sesión para guardar en Supabase.')
      return
    }
    setBusy(true)
    ;(async () => {
      for (const r of restaurants) {
        if (!r.name.trim()) throw new Error('Completá el nombre del restaurante antes de guardar.')
        const draftCategories = categoriesDraftByRestaurantId[r.id]
        const categories = draftCategories != null ? parseCategoriesText(draftCategories) : r.categories
        await sbUpsertRestaurant({ ...r, categories })
        for (const item of r.menu) {
          if (!item.name.trim()) throw new Error('Completá el nombre del plato antes de guardar.')
          const extras = (item.extras ?? []).map((ex) => {
            if (!ex.name.trim()) throw new Error('Completá el nombre de cada extra antes de guardar.')
            const price = Number(ex.price)
            if (Number.isNaN(price)) throw new Error('Usá números válidos para el precio de cada extra.')
            return { ...ex, name: ex.name.trim(), price }
          })
          await sbUpsertMenuItem(r.id, {
            ...item,
            extras,
            category: resolveMenuCategory(item.category, categories),
          })
        }
      }
    })()
      .then(async () => {
        const mine = await fetchRestaurantsForCurrentUser()
        setRestaurants(mine)
        setSelectedId((prev) => prev || mine[0]?.id || '')
        setNotice('Cambios guardados en Supabase.')
      })
      .catch((e) => setNotice(`No se pudo guardar: ${formatError(e)}`))
      .finally(() => setBusy(false))
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-base font-semibold">Panel de restaurantes</div>
          <div className="text-xs text-slate-500">Panel para restaurantes (Supabase).</div>
        </div>
        <Link className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" to="/">
          Volver
        </Link>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
        {!supabaseAvailable ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Falta configurar Supabase. Completá las variables en tu .env (ver .env.example) y reiniciá `npm run dev`.
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-3">
            {signedIn ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm">
                  Sesión iniciada{userEmail ? <span className="text-slate-500"> · {userEmail}</span> : null}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setBusy(true)
                    sbSignOut()
                      .then(() => {
                        setSignedIn(false)
                        setUserEmail(null)
                        setRestaurants([])
                        setSelectedId('')
                        setNotice('Sesión cerrada.')
                      })
                      .catch((e) => setNotice(`No se pudo cerrar sesión: ${formatError(e)}`))
                      .finally(() => setBusy(false))
                  }}
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="grid gap-2 md:grid-cols-3">
                <input
                  className="input"
                  placeholder="Email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Contraseña"
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busy || !authEmail || !authPassword}
                    onClick={() => {
                      setBusy(true)
                      sbSignIn(authEmail, authPassword)
                        .then(async ({ data, error }) => {
                          if (error) throw error
                          setSignedIn(true)
                          const email = data.user?.email ?? null
                          setUserEmail(email)
                          const admins = parseAdminEmails()
                          const isAdminNow = Boolean(email && admins.includes(email.toLowerCase()))
                          const list = isAdminNow ? await sbGetAllRestaurantsForAdmin() : await sbGetMyRestaurants()
                          setRestaurants(list)
                          setSelectedId(list[0]?.id ?? '')
                          setNotice('Sesión iniciada.')
                        })
                        .catch((e) => setNotice(`No se pudo iniciar sesión: ${formatError(e)}`))
                        .finally(() => setBusy(false))
                    }}
                  >
                    Ingresar
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={busy || !authEmail || !authPassword}
                    onClick={() => {
                      setBusy(true)
                      sbSignUp(authEmail, authPassword)
                        .then(async ({ error }) => {
                          if (error) throw error
                          setNotice('Cuenta creada. Si tu proyecto requiere confirmación de email, revisá tu casilla y volvé a ingresar.')
                        })
                        .catch((e) => setNotice(`No se pudo crear cuenta: ${formatError(e)}`))
                        .finally(() => setBusy(false))
                    }}
                  >
                    Crear cuenta
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {notice ? (
        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn btn-primary"
          onClick={save}
          disabled={!supabaseAvailable || !signedIn || busy}
        >
          Guardar
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={addRestaurant}
          disabled={!supabaseAvailable || !signedIn || busy}
        >
          Nuevo restaurante
        </button>
      </div>

      <div className="mt-4 card p-3">
        <label className="label" htmlFor="restaurant">
          Restaurante
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <select
            id="restaurant"
            className="w-full rounded-2xl border-slate-200 bg-white/80 text-sm md:w-auto"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="" disabled>
              Seleccioná un restaurante
            </option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.id})
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn rounded-xl border border-rose-200 bg-rose-50 text-rose-800"
            onClick={deleteSelectedRestaurant}
            disabled={!selected}
          >
            Eliminar
          </button>
        </div>
      </div>

      {selected ? (
        <div className="mt-4 space-y-4">
          <section className="card p-3">
            <div className="text-sm font-semibold">Datos del restaurante</div>

            <div className="mt-3 grid gap-3">
              <label className="text-xs text-slate-600">
                Nombre
                <input
                  className="input mt-1"
                  value={selected.name}
                  onChange={(e) => updateRestaurant({ name: e.target.value })}
                  placeholder="Nombre del restaurante"
                />
              </label>

              <label className="text-xs text-slate-600">
                Teléfono (WhatsApp)
                <div className="mt-1 flex overflow-hidden rounded-2xl border border-slate-200 bg-white/80">
                  <div className="flex items-center bg-slate-50 px-3 text-sm font-semibold text-slate-700">+549</div>
                  <input
                    className="w-full border-0 bg-transparent text-sm focus:ring-0"
                    value={selected.phone.startsWith('+549') ? selected.phone.slice(4) : selected.phone}
                    onChange={(e) => {
                      updateRestaurant({ phone: `+549${e.target.value}` })
                    }}
                    placeholder="11 2345-6789"
                    inputMode="tel"
                  />
                </div>
              </label>

              <label className="text-xs text-slate-600">
                Dirección
                <input
                  className="input mt-1"
                  value={selected.address}
                  onChange={(e) => updateRestaurant({ address: e.target.value })}
                  placeholder="Dirección"
                />
              </label>

              <label className="text-xs text-slate-600">
                Horarios
                <div className="mt-2 space-y-2">
                  {hoursSlots.map((slot, index) => (
                    <div key={`hours-${slot.from}-${slot.to}-${index}`} className="flex items-center gap-2">
                      <input
                        type="time"
                        className="input"
                        value={slot.from}
                        onChange={(e) => changeHoursSlot(index, 'from', e.target.value)}
                      />
                      <span className="text-[10px] uppercase tracking-wide text-slate-500">a</span>
                      <input
                        type="time"
                        className="input"
                        value={slot.to}
                        onChange={(e) => changeHoursSlot(index, 'to', e.target.value)}
                      />
                      {hoursSlots.length > 1 ? (
                        <button
                          type="button"
                          className="btn btn-ghost px-2 text-xs"
                          onClick={() => removeHoursSlot(index)}
                          aria-label="Eliminar franja horaria"
                        >
                          Quitar
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <button
                    type="button"
                    className="btn btn-ghost px-3 py-1 text-xs"
                    onClick={addHoursSlot}
                    disabled={hoursSlots.length >= 3}
                  >
                    Agregar turno
                  </button>
                  <span>Se guarda como: {formatHoursSlots(hoursSlots)}</span>
                </div>
              </label>


              <label className="text-xs text-slate-600">
                Costo de envío ($)
                <input
                  className="input mt-1"
                  type="number"
                  min="0"
                  value={selected.deliveryCost ?? ''}
                  onChange={e => updateRestaurant({ deliveryCost: Number(e.target.value) })}
                  placeholder="Ej: 500"
                />
              </label>


              <label className="text-xs text-slate-600">
                Tiempo estimado de entrega (minutos)
                <div className="flex gap-2 mt-1 items-center">
                  <input
                    className="input w-20"
                    type="number"
                    min="1"
                    max="180"
                    value={selected.estimatedTime?.split('-')[0]?.replace(/\D/g, '') || ''}
                    onChange={e => {
                      const min = e.target.value.replace(/\D/g, '')
                      const max = selected.estimatedTime?.split('-')[1]?.replace(/\D/g, '') || ''
                      updateRestaurant({ estimatedTime: min && max ? `${min}-${max}` : min ? `${min}-${min}` : '' })
                    }}
                    placeholder="Mín"
                  />
                  <span>-</span>
                  <input
                    className="input w-20"
                    type="number"
                    min="1"
                    max="180"
                    value={selected.estimatedTime?.split('-')[1]?.replace(/\D/g, '') || ''}
                    onChange={e => {
                      const min = selected.estimatedTime?.split('-')[0]?.replace(/\D/g, '') || ''
                      const max = e.target.value.replace(/\D/g, '')
                      updateRestaurant({ estimatedTime: min && max ? `${min}-${max}` : max ? `${max}-${max}` : '' })
                    }}
                    placeholder="Máx"
                  />
                  <span className="ml-1 text-xs text-slate-500">min</span>
                </div>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={!!selected.onlyTakeaway}
                  onChange={e => updateRestaurant({ onlyTakeaway: e.target.checked })}
                />
                Solo disponible para retiros
              </label>

              <label className="text-xs text-slate-600">
                Categorías (separadas por coma)
                <input
                  className="input mt-1"
                  value={categoriesDraftByRestaurantId[selected.id] ?? selected.categories.join(', ')}
                  onChange={(e) => {
                    const nextText = e.target.value
                    setCategoriesDraftByRestaurantId((prev) => ({ ...prev, [selected.id]: nextText }))
                    updateRestaurant({ categories: parseCategoriesText(nextText) })
                  }}
                  onBlur={(e) => updateRestaurant({ categories: parseCategoriesText(e.target.value) })}
                  placeholder="Pizzas, Hamburguesas, Ensaladas"
                />
              </label>

              <label className="text-xs text-slate-600">
                Imagen/portada (URL)
                <input
                  className="input mt-1"
                  value={selected.image || ''}
                  onChange={(e) => updateRestaurant({ image: e.target.value })}
                  placeholder="/assets/restaurants/<id>/cover.jpg"
                />
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <label className="btn btn-primary cursor-pointer">
                    Seleccionar archivo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) onUploadCover(file)
                      }}
                    />
                  </label>
                  {selected.image ? (
                    <button
                      type="button"
                      className="btn btn-ghost px-3 py-1.5 text-xs"
                      onClick={() => updateRestaurant({ image: '' })}
                    >
                      Eliminar portada
                    </button>
                  ) : null}
                </div>
              </label>
            </div>
          </section>

          <section className="card p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Menú</div>
                <div className="text-xs text-slate-500">Los platos se muestran agrupados por categoría.</div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={addMenuItem}
              >
                Agregar plato
              </button>
            </div>

            {selected.menu.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-slate-200/80 bg-white/70 p-3 text-sm">
                <div className="text-sm font-semibold">Sin platos</div>
                <div className="mt-1 text-xs text-slate-500">Agregá el primer plato para que aparezca en el catálogo.</div>
              </div>
            ) : (
              <div className="mt-3 grid gap-3">
                {selected.menu.map((m) => (
                  <div key={m.id} className="rounded-2xl border border-slate-200/80 bg-white/70 p-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={m.image || '/assets/menu/placeholder.svg'}
                        alt={m.name}
                        className="h-16 w-16 rounded-2xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate text-sm font-semibold">{m.name}</div>
                          <button
                            type="button"
                            className="btn rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-800"
                            onClick={() => deleteMenuItem(m.id)}
                          >
                            Eliminar
                          </button>
                        </div>

                        <div className="mt-2 grid gap-2">
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <label className="text-xs text-slate-600">
                              Nombre
                              <input
                                className="input mt-1"
                                value={m.name}
                                onChange={(e) => updateMenuItem(m.id, { name: e.target.value })}
                                placeholder="Nombre del plato"
                              />
                            </label>
                            <label className="text-xs text-slate-600">
                              Precio
                              <input
                                className="input mt-1"
                                type="number"
                                value={m.price}
                                onChange={(e) => updateMenuItem(m.id, { price: Number(e.target.value) })}
                              />
                            </label>
                          </div>

                          <label className="text-xs text-slate-600">
                            Descripción
                            <input
                              className="input mt-1"
                              value={m.description}
                              onChange={(e) => updateMenuItem(m.id, { description: e.target.value })}
                              placeholder="Descripción"
                            />
                          </label>

                          <label className="text-xs text-slate-600">
                            Extras (opcional)
                            <div className="mt-2 space-y-2">
                              {(m.extras ?? []).map((ex) => (
                                <div
                                  key={ex.id}
                                  className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 p-2"
                                >
                                  <input
                                    className="input flex-1 min-w-[180px]"
                                    value={ex.name}
                                    onChange={(e) => updateMenuItemExtra(m.id, ex.id, { name: e.target.value })}
                                    placeholder="Nombre del extra"
                                  />
                                  <input
                                    className="input w-28"
                                    type="number"
                                    value={ex.price}
                                    onChange={(e) => updateMenuItemExtra(m.id, ex.id, { price: Number(e.target.value) })}
                                    placeholder="Precio"
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-ghost px-3 py-1 text-xs"
                                    onClick={() => removeExtraFromMenuItem(m.id, ex.id)}
                                  >
                                    Quitar
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                className="btn btn-ghost px-3 py-1.5 text-xs"
                                onClick={() => addExtraToMenuItem(m.id)}
                              >
                                Agregar extra
                              </button>
                            </div>
                          </label>

                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <label className="text-xs text-slate-600">
                              Categoría
                              <select
                                className="input mt-1"
                                value={resolveMenuCategory(m.category, selected.categories)}
                                onChange={(e) => updateMenuItem(m.id, { category: e.target.value })}
                              >
                                <option value="Otros">Otros</option>
                                {selected.categories
                                  .filter((c) => c.toLocaleLowerCase() !== 'otros')
                                  .map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                              </select>
                            </label>
                            <label className="text-xs text-slate-600">
                              Disponible
                              <div className="mt-2 flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={m.available}
                                  onChange={(e) => updateMenuItem(m.id, { available: e.target.checked })}
                                />
                                <span className="text-sm text-slate-700">{m.available ? 'Sí' : 'No'}</span>
                              </div>
                            </label>
                          </div>

                          <label className="text-xs text-slate-600">
                            Imagen (URL o carga local)
                            <input
                              className="input mt-1"
                              value={m.image || ''}
                              onChange={(e) => updateMenuItem(m.id, { image: e.target.value })}
                              placeholder="/assets/restaurants/<id>/menu/<archivo>.jpg"
                            />
                            <input
                              className="mt-2 block w-full text-sm"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) onUploadMenuItemImage(m.id, file)
                              }}
                            />
                            <div className="mt-1 text-xs text-slate-500">
                              Nota: la carga local se guarda como texto (Data URL) en el navegador; usar imágenes livianas.
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="mt-4 card p-3 text-sm">Creá o seleccioná un restaurante.</div>
      )}
    </div>
  )
}
