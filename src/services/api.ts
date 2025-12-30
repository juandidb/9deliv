/* Capa de servicios: hoy lee mocks locales; mañana cambia a fetch sin tocar componentes. */

import type { Restaurant } from '../types/domain'
import { getRestaurantsFromStoreOrSeed } from './restaurantsStore'
import { isSupabaseConfigured } from './supabaseClient'
import { sbGetRestaurantByIdPublic, sbGetRestaurantsPublic } from './supabaseApi'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getRestaurants(): Promise<Restaurant[]> {
  await sleep(80)
  if (isSupabaseConfigured()) return sbGetRestaurantsPublic()
  return getRestaurantsFromStoreOrSeed()
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  await sleep(80)
  if (isSupabaseConfigured()) return sbGetRestaurantByIdPublic(id)
  return getRestaurantsFromStoreOrSeed().find((r) => r.id === id) ?? null
}

/*
  Para reemplazar por backend:
  - Cambiar getRestaurants/getRestaurantById a fetch('/api/restaurants')...
  - Mantener las mismas firmas para no tocar UI.
*/
