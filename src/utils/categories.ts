function normalizeKey(input: string): string {
  return input
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function singularizeKey(key: string): string {
  // Heurística simple para ES: intenta unificar plural/singular.
  // - hamburguesas -> hamburguesa
  // - sandwiches -> sandwich
  // - tacos -> taco
  // Mantiene palabras muy cortas para evitar recortes raros.
  if (key.length <= 3) return key

  const tokens = key.split(' ')
  const last = tokens[tokens.length - 1] ?? ''

  const toSingular = (w: string) => {
    if (w.length <= 3) return w
    if (w.endsWith('es') && w.length > 4) return w.slice(0, -2)
    if (w.endsWith('s') && w.length > 3) return w.slice(0, -1)
    return w
  }

  tokens[tokens.length - 1] = toSingular(last)
  return tokens.join(' ').trim()
}

function pluralizeKey(key: string): string {
  if (!key) return ''
  const tokens = key.split(' ')
  const last = tokens[tokens.length - 1] ?? ''

  const toPlural = (w: string) => {
    if (!w) return w
    if (w.length <= 2) return w
    // Si ya termina en s, lo dejamos (ej: "tacos" ya está plural)
    if (w.endsWith('s')) return w
    // Feliz -> felices (z -> ces)
    if (w.endsWith('z')) return `${w.slice(0, -1)}ces`
    // canción -> canciones
    if (w.endsWith('ion')) return `${w}es`
    // vocal -> +s
    if (/[aeiou]$/.test(w)) return `${w}s`
    // consonante -> +es
    return `${w}es`
  }

  tokens[tokens.length - 1] = toPlural(last)
  return tokens.join(' ').trim()
}

function titleCaseFirst(input: string): string {
  const collapsed = input.trim().replace(/\s+/g, ' ')
  if (!collapsed) return ''
  const lower = collapsed.toLocaleLowerCase()
  return lower.charAt(0).toLocaleUpperCase() + lower.slice(1)
}

// Mapa de aliases -> etiqueta canónica (en plural para “familias” típicas)
const CATEGORY_ALIASES: Record<string, string> = {
  // Oficiales: Pizzas, Empanadas, Hamburguesas, Sandwiches, Ensaladas,
  // Carnes, Postres, Bebidas, Burritos, Milanesas, Tacos, Wraps, Picadas, Pastas

  hamburguesa: 'Hamburguesas',
  hamburguesas: 'Hamburguesas',
  hamnurguesa: 'Hamburguesas',
  hamnurguesas: 'Hamburguesas',

  pizza: 'Pizzas',
  pizzas: 'Pizzas',

  empanada: 'Empanadas',
  empanadas: 'Empanadas',

  ensalada: 'Ensaladas',
  ensaladas: 'Ensaladas',

  carne: 'Carnes',
  carnes: 'Carnes',

  bebida: 'Bebidas',
  bebidas: 'Bebidas',

  postre: 'Postres',
  postres: 'Postres',

  sandwich: 'Sandwiches',
  sandwiches: 'Sandwiches',
  sanguche: 'Sandwiches',
  sanguches: 'Sandwiches',
  sanguchito: 'Sandwiches',
  sanguchitos: 'Sandwiches',

  pasta: 'Pastas',
  pastas: 'Pastas',

  burrito: 'Burritos',
  burritos: 'Burritos',

  taco: 'Tacos',
  tacos: 'Tacos',

  wrap: 'Wraps',
  wraps: 'Wraps',

  picada: 'Picadas',
  picadas: 'Picadas',

  helado: 'Helados',
  helados: 'Helados',

  milanesa: 'Milanesas',
  milanesas: 'Milanesas',

  otros: 'Otros',
}

export function categoryKey(input: string): string {
  return singularizeKey(normalizeKey(input))
}

export function canonicalCategoryLabel(input: string): string {
  const key = normalizeKey(input)
  if (!key) return ''

  // 1) Alias exacto
  const aliased = CATEGORY_ALIASES[key]
  if (aliased) return aliased

  // 2) Alias por singularización (ej: "sandwiches" -> "sandwich")
  const singularKeyValue = singularizeKey(key)
  const aliasedSingular = CATEGORY_ALIASES[singularKeyValue]
  if (aliasedSingular) return aliasedSingular

  // 3) Fallback: intentamos dejarlo en plural para mantener consistencia visual
  // (p.ej. "milanesa" -> "Milanesas").
  return titleCaseFirst(pluralizeKey(singularizeKey(key)))
}

export function canonicalizeCategoryList(list: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of list ?? []) {
    const label = canonicalCategoryLabel(raw)
    if (!label) continue
    const key = categoryKey(label)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(label)
  }
  return out
}

export function parseCategoriesText(input: string): string[] {
  const parts = input.split(',')
  return canonicalizeCategoryList(parts)
}

export function resolveMenuCategory(raw: string, restaurantCategories: string[]): string {
  const k = categoryKey(raw)
  if (!k) return 'Otros'

  const normalizedRestaurantCategories = canonicalizeCategoryList(restaurantCategories)
  const match = normalizedRestaurantCategories.find((c) => categoryKey(c) === k)
  return match ?? 'Otros'
}
