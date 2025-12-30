/* CartProvider: state global del carrito (1 restaurante por pedido). */

import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

import type { CartState } from '../types/domain'
import { cartReducer, getCartTotal, initialCartState } from './cartReducer'
import { readJSON, removeKey, writeJSON } from '../utils/storage'

const CART_STORAGE_KEY = '9delivery.cart.v1'

function isValidCartState(input: unknown): input is CartState {
  if (!input || typeof input !== 'object') return false
  const obj = input as Record<string, unknown>
  const restaurantId = obj.restaurantId
  const items = obj.items

  const restaurantIdOk = restaurantId === null || typeof restaurantId === 'string'
  if (!restaurantIdOk) return false

  if (!Array.isArray(items)) return false
  for (const it of items) {
    if (!it || typeof it !== 'object') return false
    const itemObj = it as Record<string, unknown>
    if (typeof itemObj.restaurantId !== 'string') return false
    if (typeof itemObj.itemId !== 'string') return false
    if (typeof itemObj.name !== 'string') return false
    if (typeof itemObj.unitPrice !== 'number') return false
    if (typeof itemObj.quantity !== 'number') return false
    if (itemObj.note !== undefined && typeof itemObj.note !== 'string') return false
  }
  return true
}

function loadInitialCartState(): CartState {
  const stored = readJSON<CartState>(CART_STORAGE_KEY)
  if (!stored) return initialCartState
  if (!isValidCartState(stored)) return initialCartState
  return stored
}

type AddResult = { ok: true } | { ok: false; error: string }

type CartContextValue = {
  state: CartState
  addItem: (params: {
    restaurantId: string
    item: { id: string; name: string; price: number; image?: string; extras?: { id: string; name: string; price: number }[] }
  }) => AddResult
  removeItem: (itemId: string) => void
  setQuantity: (itemId: string, quantity: number) => void
  setNote: (itemId: string, note: string) => void
  clear: () => void
  total: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialCartState)

  useEffect(() => {
    if (state.items.length === 0) {
      removeKey(CART_STORAGE_KEY)
      return
    }
    writeJSON(CART_STORAGE_KEY, state)
  }, [state])

  const value = useMemo<CartContextValue>(() => {
    return {
      state,
      addItem: ({ restaurantId, item }) => {
        if (state.items.length > 0 && state.restaurantId && state.restaurantId !== restaurantId) {
          return { ok: false, error: 'El carrito sólo puede contener ítems de un mismo restaurante' }
        }
        dispatch({ type: 'ADD_ITEM', payload: { restaurantId, item } })
        return { ok: true }
      },
      removeItem: (itemId) => dispatch({ type: 'REMOVE_ITEM', payload: { itemId } }),
      setQuantity: (itemId, quantity) => dispatch({ type: 'SET_QTY', payload: { itemId, quantity } }),
      setNote: (itemId, note) => dispatch({ type: 'SET_NOTE', payload: { itemId, note } }),
      clear: () => dispatch({ type: 'CLEAR' }),
      total: getCartTotal(state),
    }
  }, [state])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
