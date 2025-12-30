import { Outlet } from 'react-router-dom'

import { CartProvider } from './context/CartContext'
import { UIProvider, useUI } from './context/UIContext'
import CartDrawer from './components/CartDrawer'
import Header from './components/Header'
import BottomNav from './components/BottomNav'


import { useState } from 'react'

function AppShell() {
  const { cartOpen, setCartOpen, filtersOpen, setFiltersOpen } = useUI()
  const [query, setQuery] = useState('')

  return (
    <div className="min-h-dvh bg-transparent text-slate-900">
      <Header onOpenCart={() => setCartOpen(true)} query={query} setQuery={setQuery} />

      <main className="mx-auto w-full max-w-2xl px-4 pb-28 pt-4 lg:max-w-6xl lg:px-10 xl:max-w-7xl xl:px-14">
        <div className="surface w-full lg:p-8 xl:p-10">
          <Outlet context={{ query, setQuery }} />
        </div>
      </main>

      <footer className="mx-auto w-full max-w-2xl px-4 pb-24 pt-10 lg:max-w-6xl lg:px-10 xl:max-w-7xl xl:px-14">
        <div className="rounded-2xl border border-white/40 bg-transparent px-6 py-8 text-xs text-slate-700 backdrop-blur-xl shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-lg font-bold text-slate-900 mb-2">9delivery</div>
              <div className="mb-1">Av. Siempre Viva 1234, Córdoba, Argentina</div>
              <div className="mb-1">Tel: <a href="tel:+543514444444" className="underline">+54 351 444-4444</a></div>
              <div className="mb-1">Email: <a href="mailto:info@9delivery.com" className="underline">info@9delivery.com</a></div>
              <div className="flex gap-3 mt-3">
                <a href="https://www.instagram.com/9delivery" target="_blank" rel="noopener" aria-label="Instagram"><img src="/assets/instagram.svg" alt="Instagram" className="h-5 w-5" /></a>
                <a href="https://www.facebook.com/9delivery" target="_blank" rel="noopener" aria-label="Facebook"><img src="/assets/facebook.svg" alt="Facebook" className="h-5 w-5" /></a>
                <a href="https://www.linkedin.com/company/9delivery" target="_blank" rel="noopener" aria-label="LinkedIn"><img src="/assets/linkedin.svg" alt="LinkedIn" className="h-5 w-5" /></a>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2">Categorías</div>
              <ul className="space-y-1">
                <li><a href="/restaurantes" className="hover:underline">Restaurantes</a></li>
                <li><a href="/supermercados" className="hover:underline">Supermercados</a></li>
                <li><a href="/farmacias" className="hover:underline">Farmacias</a></li>
                <li><a href="/kioscos" className="hover:underline">Kioscos</a></li>
                <li><a href="/licores" className="hover:underline">Bebidas</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2">Sobre 9delivery</div>
              <ul className="space-y-1">
                <li><a href="/unete" className="hover:underline">Sé parte (restaurantes)</a></li>
                <li><a href="/trabaja" className="hover:underline">Trabajá con nosotros</a></li>
                <li><a href="/contacto" className="hover:underline">Contacto</a></li>
                <li><a href="/blog" className="hover:underline">Blog</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2">Legales y apps</div>
              <ul className="space-y-1">
                <li><a href="/terminos" className="hover:underline">Términos y Condiciones</a></li>
                <li><a href="/privacidad" className="hover:underline">Política de Privacidad</a></li>
                <li><a href="/defensa-consumidor" className="hover:underline">Defensa del consumidor</a></li>
                <li className="flex gap-2 mt-2">
                  <a href="#" aria-label="App Store"><img src="/assets/appstore.svg" alt="App Store" className="h-7" /></a>
                  <a href="#" aria-label="Google Play"><img src="/assets/playstore.svg" alt="Google Play" className="h-7" /></a>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center text-[11px] text-slate-400 py-4 border-t border-slate-100 mt-8">&copy; {new Date().getFullYear()} 9delivery S.A. Todos los derechos reservados.</div>
        </div>
      </footer>

      <BottomNav
        onGoSearch={() => {
          // navegación la maneja el Link interno del BottomNav
        }}
        onToggleFilters={() => setFiltersOpen(!filtersOpen)}
        onOpenCart={() => setCartOpen(true)}
      />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <UIProvider>
      <CartProvider>
        <AppShell />
      </CartProvider>
    </UIProvider>
  )
}
