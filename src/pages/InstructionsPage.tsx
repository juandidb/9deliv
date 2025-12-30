/* Página con guía para locales que quieran sumarse. */


import { Link } from 'react-router-dom'
import { benefits } from '../data/benefits'

export default function InstructionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-slate-900">Sumá tu local</div>
          <div className="text-sm text-slate-500">Pasos claros para integrarte a 9delivery</div>
        </div>
        <Link to="/" className="btn btn-ghost rounded-full px-3 py-2 text-xs" aria-label="Volver al inicio">
          Volver
        </Link>
      </div>

      {/* Beneficios para aliados */}
      <div className="mt-4">
        <div className="text-lg font-bold text-slate-900 mb-2">Beneficios de ser aliado</div>
        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
          {benefits.map((b, i) => (
            <div
              key={b.title}
              className="min-w-[260px] max-w-[280px] bg-white rounded-2xl shadow-md border border-slate-100 flex flex-col items-center p-5 text-center"
            >
              <img
                src={import.meta.env.BASE_URL + 'assets/demo/menu/' + b.icon}
                alt={b.title}
                className="w-16 h-16 mb-3 object-contain"
                loading="lazy"
              />
              <div className="font-semibold text-slate-900 mb-1 text-base">{b.title}</div>
              <div className="text-sm text-slate-600">{b.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="card p-4 lg:p-5">
          <div className="text-sm font-semibold text-slate-900">Checklist inicial</div>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            <li>1. Enviá datos de tu local: nombre, dirección, horarios y teléfono.</li>
            <li>2. Prepará tu carta: categorías, platos, precios y disponibilidad.</li>
            <li>3. Sumá imágenes nítidas (portada + platos destacados).</li>
            <li>4. Definí zonas de entrega y medios de cobro.</li>
          </ul>
        </div>

        <div className="card p-4 lg:p-5">
          <div className="text-sm font-semibold text-slate-900">Cómo cargamos tu menú</div>
          <p className="mt-2 text-sm text-slate-600">
            Podés enviarnos un CSV/Excel simple o compartir tu carta en texto. Nuestro equipo arma la carga inicial y te habilita el panel para futuras ediciones.
          </p>
          <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2">
              <div className="font-semibold text-slate-900">Formatos aceptados</div>
              <div>CSV, XLSX o texto plano estructurado.</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2">
              <div className="font-semibold text-slate-900">Imágenes</div>
              <div>JPG o PNG, 1200x800 recomendado.</div>
            </div>
          </div>
        </div>

        <div className="card p-4 lg:p-5">
          <div className="text-sm font-semibold text-slate-900">Onboarding y soporte</div>
          <p className="mt-2 text-sm text-slate-600">
            Te acompañamos en la configuración inicial y te damos acceso al dashboard para editar platos, disponibilidad y horarios. Soporte prioritario por WhatsApp y mail.
          </p>
        </div>

        <div className="card p-4 lg:p-5">
          <div className="text-sm font-semibold text-slate-900">Listo para avanzar</div>
          <p className="mt-2 text-sm text-slate-600">
            Escribinos y coordinamos una breve llamada (15 min) para publicar tu local.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-slate-800">
            <a className="btn btn-primary rounded-full px-4 py-2" href="mailto:altas@9delivery.com">Contactar</a>
            <Link className="btn btn-ghost rounded-full px-4 py-2" to="/admin">Ver panel</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
