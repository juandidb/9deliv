import type { MenuItem, Restaurant } from '../types/domain'
import { getSupabaseClient } from './supabaseClient'
import { canonicalizeCategoryList, resolveMenuCategory } from '../utils/categories'

type RestaurantRow = {
  id: string
  owner_user_id: string
  name: string
  phone: string
  address: string
  hours: string
  categories: string[]
  image: string
  deliveryCost?: number
  estimatedTime?: string
  onlyTakeaway?: boolean

}

type MenuItemRow = {
  id: string
  restaurant_id: string
  name: string
  price: number
  description: string
  available: boolean
  category: string
  image: string | null
  extras: { id: string; name: string; price: number }[] | null
}

export async function sbGetSession() {
  const sb = getSupabaseClient()
  return sb.auth.getSession()
}

export async function sbSignIn(email: string, password: string) {
  const sb = getSupabaseClient()
  return sb.auth.signInWithPassword({ email, password })
}

export async function sbSignUp(email: string, password: string) {
  const sb = getSupabaseClient()
  return sb.auth.signUp({ email, password })
}

export async function sbSignOut() {
  const sb = getSupabaseClient()
  return sb.auth.signOut()
}

function toDomainRestaurant(r: RestaurantRow, menu: MenuItemRow[]): Restaurant {
  const categories = canonicalizeCategoryList(r.categories ?? [])
  return {
    id: r.id,
    name: r.name,
    categories,
    phone: r.phone,
    address: r.address,
    hours: r.hours,
    image: r.image,
    deliveryCost: r.deliveryCost ?? undefined,
    estimatedTime: r.estimatedTime ?? undefined,
    onlyTakeaway: r.onlyTakeaway ?? false,
    menu: menu.map((m) => ({
      id: m.id,
      name: m.name,
      price: m.price,
      description: m.description,
      available: m.available,
      category: resolveMenuCategory(m.category, categories),
      image: m.image ?? undefined,
      extras: Array.isArray(m.extras) ? m.extras : [],
    })),
  }
}

export async function sbGetRestaurantsPublic(): Promise<Restaurant[]> {
  const sb = getSupabaseClient()

  const restaurantsRes = await sb
    .from('restaurants')
    .select('id, owner_user_id, name, phone, address, hours, categories, image, deliveryCost, estimatedTime, onlyTakeaway')
    .order('name')

  if (restaurantsRes.error) throw restaurantsRes.error
  const rs = (restaurantsRes.data ?? []) as RestaurantRow[]

  const { data: menu, error: mErr } = await sb
    .from('menu_items')
    .select('id, restaurant_id, name, price, description, available, category, image, extras')
    .order('name')
  if (mErr) throw mErr
  const ms = (menu ?? []) as MenuItemRow[]

  const byRestaurantId = new Map<string, MenuItemRow[]>()
  ms.forEach((m) => {
    const arr = byRestaurantId.get(m.restaurant_id) ?? []
    arr.push(m)
    byRestaurantId.set(m.restaurant_id, arr)
  })

  return rs.map((r) => toDomainRestaurant(r, byRestaurantId.get(r.id) ?? []))
}

export async function sbGetAllRestaurantsForAdmin(): Promise<Restaurant[]> {
  // La lectura es igual que el catálogo público; las políticas RLS definen si el usuario puede ver más/menos.
  return sbGetRestaurantsPublic()
}

export async function sbGetRestaurantByIdPublic(id: string): Promise<Restaurant | null> {
  const sb = getSupabaseClient()

  let rRes: { data: unknown; error: any } = { data: null, error: null }
  try {
    rRes = await sb
      .from('restaurants')
      .select('id, owner_user_id, name, phone, address, hours, categories, image')
      .eq('id', id)
      .maybeSingle()
  } catch (e) {
    throw e
  }
  if (rRes.error) throw rRes.error
  const r = rRes.data
  if (!r) return null

  const { data: menu, error: mErr } = await sb
    .from('menu_items')
    .select('id, restaurant_id, name, price, description, available, category, image, extras')
    .eq('restaurant_id', id)
    .order('name')
  if (mErr) throw mErr

  return toDomainRestaurant(r as RestaurantRow, (menu ?? []) as MenuItemRow[])
}

export async function sbGetMyRestaurants(): Promise<Restaurant[]> {
  const sb = getSupabaseClient()
  const { data: sessionData } = await sb.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) return []

  let myRes: { data: unknown; error: any } = { data: null, error: null }
  try {
    myRes = await sb
      .from('restaurants')
      .select('id, owner_user_id, name, phone, address, hours, categories, image, deliveryCost, estimatedTime, onlyTakeaway')
      .eq('owner_user_id', userId)
      .order('name')
  } catch (e) {
    throw e
  }
  if (myRes.error) throw myRes.error
  const rs = (myRes.data ?? []) as RestaurantRow[]

  if (rs.length === 0) return []
  const ids = rs.map((r) => r.id)

  const { data: menu, error: mErr } = await sb
    .from('menu_items')
    .select('id, restaurant_id, name, price, description, available, category, image, extras')
    .in('restaurant_id', ids)
    .order('name')
  if (mErr) throw mErr
  const ms = (menu ?? []) as MenuItemRow[]

  const byRestaurantId = new Map<string, MenuItemRow[]>()
  ms.forEach((m) => {
    const arr = byRestaurantId.get(m.restaurant_id) ?? []
    arr.push(m)
    byRestaurantId.set(m.restaurant_id, arr)
  })

  return rs.map((r) => toDomainRestaurant(r, byRestaurantId.get(r.id) ?? []))
}

export async function sbUpsertRestaurant(r: Restaurant): Promise<void> {
  const sb = getSupabaseClient()
  const { data: sessionData } = await sb.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) throw new Error('No autenticado')

  // 1) Intentar UPDATE sin tocar owner_user_id (evita cambiar la propiedad al editar)
  const { data: updated, error: uErr } = await sb
    .from('restaurants')
    .update({
      name: r.name,
      phone: r.phone,
      address: r.address,
      hours: r.hours,
      categories: r.categories,
      image: r.image,
      deliveryCost: r.deliveryCost ?? null,
      estimatedTime: r.estimatedTime ?? null,
      onlyTakeaway: r.onlyTakeaway ?? false,
    })
    .eq('id', r.id)
    .select('id')

  if (uErr) throw uErr
  if (updated && updated.length > 0) return

  // 2) Si no existía, INSERT con owner_user_id
  const row: RestaurantRow = {
    id: r.id,
    owner_user_id: userId,
    name: r.name,
    phone: r.phone,
    address: r.address,
    hours: r.hours,
    categories: r.categories,
    image: r.image,
    deliveryCost: r.deliveryCost ?? null,
    estimatedTime: r.estimatedTime ?? null,
    onlyTakeaway: r.onlyTakeaway ?? false,
  }
  const { error: iErr } = await sb.from('restaurants').insert(row)
  if (iErr) throw iErr
}

export async function sbDeleteRestaurant(restaurantId: string): Promise<void> {
  const sb = getSupabaseClient()
  const { error: mErr } = await sb.from('menu_items').delete().eq('restaurant_id', restaurantId)
  if (mErr) throw mErr
  const { error: rErr } = await sb.from('restaurants').delete().eq('id', restaurantId)
  if (rErr) throw rErr
}

export async function sbUpsertMenuItem(restaurantId: string, item: MenuItem): Promise<void> {
  const sb = getSupabaseClient()

  const row: MenuItemRow = {
    id: item.id,
    restaurant_id: restaurantId,
    name: item.name,
    price: item.price,
    description: item.description,
    available: item.available,
    category: item.category,
    image: item.image ?? null,
    extras: item.extras ?? [],
  }

  const { error } = await sb.from('menu_items').upsert(row)
  if (error) throw error
}

export async function sbDeleteMenuItem(itemId: string): Promise<void> {
  const sb = getSupabaseClient()
  const { error } = await sb.from('menu_items').delete().eq('id', itemId)
  if (error) throw error
}

export async function sbUploadMenuImage(params: {
  restaurantId: string
  itemId: string
  file: File
}): Promise<string> {
  const sb = getSupabaseClient()
  const ext = params.file.name.split('.').pop() || 'jpg'
  const path = `restaurants/${params.restaurantId}/menu/${params.itemId}.${ext}`
  const { error } = await sb.storage.from('menu-images').upload(path, params.file, {
    upsert: true,
    cacheControl: '3600',
    contentType: params.file.type || undefined,
  })
  if (error) throw error
  const { data } = sb.storage.from('menu-images').getPublicUrl(path)
  return data.publicUrl
}

export async function sbUploadCoverImage(params: { restaurantId: string; file: File }): Promise<string> {
  const sb = getSupabaseClient()
  const ext = params.file.name.split('.').pop() || 'jpg'
  const path = `restaurants/${params.restaurantId}/cover.${ext}`
  const { error } = await sb.storage.from('menu-images').upload(path, params.file, {
    upsert: true,
    cacheControl: '3600',
    contentType: params.file.type || undefined,
  })
  if (error) throw error
  const { data } = sb.storage.from('menu-images').getPublicUrl(path)
  return data.publicUrl
}
