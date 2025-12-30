/* UIProvider: estado de UI global (drawer de carrito + filtros). */

import { createContext, useContext, useMemo, useState } from 'react'

type UIContextValue = {
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  filtersOpen: boolean
  setFiltersOpen: (open: boolean) => void
}

const UIContext = createContext<UIContextValue | null>(null)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const value = useMemo<UIContextValue>(() => ({ cartOpen, setCartOpen, filtersOpen, setFiltersOpen }), [
    cartOpen,
    filtersOpen,
  ])

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
