# 9delivery (MVP)

MVP mobile-first (React + Vite + Tailwind) para mostrar menús de restaurantes y enviar pedidos por WhatsApp.

## Correr local

- `npm install`
- `npm run seed` (copia `src/data/restaurants.json` a `public/data/restaurants.json`)
- `npm run dev`

## Tests

- `npm run test`

## Datos mock

- Fuente: `src/data/restaurants.json`
- Acceso SIEMPRE vía servicio: `src/services/api.ts` (`getRestaurants`, `getRestaurantById`)

## WhatsApp

La construcción del link está encapsulada en `src/utils/whatsapp.ts`.
Se redirige a:

`https://wa.me/{PHONE}?text={ENCODED_MESSAGE}`

Donde `PHONE` va en formato internacional sin `+` ni espacios.

## Cómo reemplazar mock por backend (futuro)

En `src/services/api.ts`:

- Mantener las firmas `async`.
- Reemplazar la lectura de JSON por `fetch` a un endpoint REST.
- La UI no debería cambiar si el contrato se mantiene (`Restaurant`, `MenuItem`).

Ejemplo (conceptual):

```ts
export async function getRestaurants() {
  const res = await fetch('/api/restaurants')
  if (!res.ok) throw new Error('Error cargando restaurantes')
  return res.json()
}
```

## Deploy

- Vercel: importar repo y listo (Vite build).
- GitHub Pages: configurar base path en Vite y deployear `dist/`.
