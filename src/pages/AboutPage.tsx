/* Página sobre el proyecto. */

import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-slate-900">Sobre 9delivery</div>
          <div className="text-sm text-slate-500">Una experiencia cuidada para restaurantes y clientes</div>
        </div>
        <Link to="/" className="btn btn-ghost rounded-full px-3 py-2 text-xs" aria-label="Volver al inicio">
          Volver
        </Link>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="card p-4 lg:p-5">
          <div className="text-sm font-semibold text-slate-900">Qué hacemos</div>
          <p className="mt-2 text-sm text-slate-600">
            Conectamos cocinas locales con clientes que buscan entregas confiables. Priorizamos claridad en el menú, disponibilidad en tiempo real y pagos simples.
          </p>
        </div>
        <div className="card p-4 lg:p-5">
          <div className="text-sm font-semibold text-slate-900">Cómo lo hacemos</div>
          <p className="mt-2 text-sm text-slate-600">
            UX pensada para pantallas grandes, fichas limpias y flujo de compra directo. Operamos con soporte cercano para cada restaurante asociado.
          </p>
        </div>
        <div className="card p-4 lg:p-5">
          <div className="text-sm font-semibold text-slate-900">Por qué importa</div>
          <p className="mt-2 text-sm text-slate-600">
            Menos fricción para pedir y entregar: más ventas para los locales, mejores tiempos para los clientes.
          </p>
        </div>
      </div>

      <div className="card p-4 lg:p-5">
        <div className="text-sm font-semibold text-slate-900">Principios de diseño</div>
        <div className="mt-2 grid gap-2 text-sm text-slate-600 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2">Claridad primero: texto legible y acciones directas.</div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2">Performance: listados rápidos, imágenes optimizadas.</div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2">Consistencia: componentes reutilizables y estados claros.</div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2">Accesibilidad base: contraste y toques grandes.</div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2">Soporte humano: acompañamiento cercano a los locales.</div>
        </div>
      </div>

      <div className="card p-4 lg:p-5">
        <div className="text-sm font-semibold text-slate-900">Hablemos</div>
        <p className="mt-2 text-sm text-slate-600">¿Tenés un local y querés sumarte? ¿Sugerencias para la app? Escribinos.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-slate-800">
          <a className="btn btn-primary rounded-full px-4 py-2" href="mailto:hola@9delivery.com">Contactar</a>
          <Link className="btn btn-ghost rounded-full px-4 py-2" to="/instrucciones">Ver instrucciones</Link>
        </div>
      </div>
    </div>
  )
}
