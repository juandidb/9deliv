import type { MenuItem, Restaurant } from '../types/domain'
import restaurantsSeed from '../data/restaurants.json'
import { readJSON, removeKey, writeJSON } from '../utils/storage'

const RESTAURANTS_STORAGE_KEY = '9delivery.restaurants.v1'

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidMenuItem(input: unknown): input is MenuItem {
  if (!input || typeof input !== 'object') return false
  const obj = input as Record<string, unknown>
  if (!isNonEmptyString(obj.id)) return false
  if (!isNonEmptyString(obj.name)) return false
  if (typeof obj.price !== 'number' || Number.isNaN(obj.price)) return false
  if (typeof obj.description !== 'string') return false
  if (typeof obj.available !== 'boolean') return false
  if (typeof obj.category !== 'string') return false
  if (obj.image !== undefined && typeof obj.image !== 'string') return false
  if (obj.extras !== undefined) {
    if (!Array.isArray(obj.extras)) return false
    const extrasOk = obj.extras.every((extra) => {
      if (!extra || typeof extra !== 'object') return false
      const ex = extra as Record<string, unknown>
      if (!isNonEmptyString(ex.id)) return false
      if (!isNonEmptyString(ex.name)) return false
      if (typeof ex.price !== 'number' || Number.isNaN(ex.price)) return false
      return true
    })
    if (!extrasOk) return false
  }
  return true
}

function isValidRestaurant(input: unknown): input is Restaurant {
  if (!input || typeof input !== 'object') return false
  const obj = input as Record<string, unknown>
  if (!isNonEmptyString(obj.id)) return false
  if (!isNonEmptyString(obj.name)) return false
  if (!Array.isArray(obj.categories) || !obj.categories.every((c) => typeof c === 'string')) return false
  if (typeof obj.phone !== 'string') return false
  if (typeof obj.address !== 'string') return false
  if (typeof obj.hours !== 'string') return false
  if (!Array.isArray(obj.menu) || !obj.menu.every(isValidMenuItem)) return false
  if (typeof obj.image !== 'string') return false
  return true
}

function coerceSeed(): Restaurant[] {
  const seed = restaurantsSeed as unknown
  if (!Array.isArray(seed)) return []
  return seed.filter(isValidRestaurant)
}

export function getRestaurantsFromStoreOrSeed(): Restaurant[] {
  const stored = readJSON<unknown>(RESTAURANTS_STORAGE_KEY)
  if (Array.isArray(stored) && stored.every(isValidRestaurant)) {
    return stored
  }
  return coerceSeed()
}

export function saveRestaurantsToStore(restaurants: Restaurant[]): void {
  writeJSON(RESTAURANTS_STORAGE_KEY, restaurants)
}

export function resetRestaurantsStore(): void {
  removeKey(RESTAURANTS_STORAGE_KEY)
}
