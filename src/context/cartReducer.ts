/* Reducer puro para lógica de carrito (fácil de testear). */

import type { CartLine, CartState } from '../types/domain'

export type CartAction =
  | {
      type: 'ADD_ITEM'
      payload: { restaurantId: string; item: { id: string; name: string; price: number; image?: string; extras?: { id: string; name: string; price: number }[] } }
    }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'SET_QTY'; payload: { itemId: string; quantity: number } }
  | { type: 'SET_NOTE'; payload: { itemId: string; note: string } }
  | { type: 'CLEAR' }

export const initialCartState: CartState = {
  restaurantId: null,
  items: [],
}

export function getCartTotal(state: CartState): number {
  return state.items.reduce((acc, it) => {
    const extrasTotal = it.extras ? it.extras.reduce((sum, e) => sum + e.price, 0) : 0;
    return acc + (it.unitPrice + extrasTotal) * it.quantity;
  }, 0)
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { restaurantId, item } = action.payload

      if (state.items.length > 0 && state.restaurantId && state.restaurantId !== restaurantId) {
        return state
      }

      // Extras: si el mismo item+extras ya está, sumar cantidad, si no, agregar nuevo
      const extrasKey = (item.extras || []).map(e => e.id).sort().join(',')
      const existing = state.items.find((i) => i.itemId === item.id && ((i.extras || []).map(e => e.id).sort().join(',') === extrasKey))
      const nextItems: CartLine[] = existing
        ? state.items.map((i) =>
            i.itemId === item.id && ((i.extras || []).map(e => e.id).sort().join(',') === extrasKey)
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [
            ...state.items,
            {
              restaurantId,
              itemId: item.id,
              name: item.name,
              unitPrice: item.price,
              quantity: 1,
              image: item.image,
              extras: item.extras,
            },
          ]

      return {
        restaurantId,
        items: nextItems,
      }
    }

    case 'REMOVE_ITEM': {
      const nextItems = state.items.filter((i) => i.itemId !== action.payload.itemId)
      return {
        restaurantId: nextItems.length ? state.restaurantId : null,
        items: nextItems,
      }
    }

    case 'SET_QTY': {
      const qty = Math.max(1, Math.floor(action.payload.quantity || 1))
      return {
        ...state,
        items: state.items.map((i) => (i.itemId === action.payload.itemId ? { ...i, quantity: qty } : i)),
      }
    }

    case 'SET_NOTE': {
      return {
        ...state,
        items: state.items.map((i) =>
          i.itemId === action.payload.itemId ? { ...i, note: action.payload.note } : i,
        ),
      }
    }

    case 'CLEAR':
      return initialCartState

    default:
      return state
  }
}
