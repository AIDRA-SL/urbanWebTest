import { ShieldCheck, Lock, Truck, RotateCcw } from 'lucide-react'

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Autenticidad garantizada',
    desc: 'Todos nuestros productos son 100% originales, directamente de marcas y distribuidores oficiales.',
  },
  {
    icon: Lock,
    title: 'Pago seguro',
    desc: 'Transacciones protegidas con cifrado SSL. Aceptamos tarjeta, Bizum y transferencia.',
  },
  {
    icon: Truck,
    title: 'Envío rápido 24/48h',
    desc: 'Recibe tu pedido en casa en 1-2 días hábiles con seguimiento en tiempo real.',
  },
  {
    icon: RotateCcw,
    title: 'Envíos y devoluciones gratis +60€',
    desc: 'Envíos y devoluciones sin coste en pedidos superiores a 60€. Sin complicaciones.',
  },
]

export function TrustSection() {
  return (
    <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-16">
      <h2 className="text-2xl font-bold tracking-tight uppercase text-center mb-10">
        Compra con total confianza
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex flex-col items-center text-center gap-4 p-6 border border-gray-100 hover:border-gray-300 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center shrink-0">
              <Icon size={24} strokeWidth={1.5} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide mb-1">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
