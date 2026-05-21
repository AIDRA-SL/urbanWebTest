import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Envíos y Devoluciones | UrbanStore',
  description: 'Información sobre envíos, plazos y política de devoluciones de UrbanStore Oviedo.',
}

export default function EnviosDevolucionesPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 pb-24">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Ayuda</p>
        <h1 className="text-3xl font-bold tracking-tight uppercase mb-10">Envíos y Devoluciones</h1>

        <div className="flex flex-col gap-10 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-4">Envíos</h2>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">Envío estándar — Península</p>
                  <p className="text-gray-400 mt-0.5">3–5 días hábiles</p>
                </div>
                <p className="font-medium text-gray-800 shrink-0 ml-4">4,95 €</p>
              </div>
              <div className="flex justify-between items-start py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">Envío gratuito</p>
                  <p className="text-gray-400 mt-0.5">En pedidos superiores a 60 €</p>
                </div>
                <p className="font-medium text-gray-800 shrink-0 ml-4">Gratis</p>
              </div>
              <div className="flex justify-between items-start py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">Recogida en tienda</p>
                  <p className="text-gray-400 mt-0.5">C/ Nueve de Mayo 15, Oviedo</p>
                </div>
                <p className="font-medium text-gray-800 shrink-0 ml-4">Gratis</p>
              </div>
            </div>
            <p className="mt-4 text-gray-400 text-xs">
              Los plazos de entrega son estimados y pueden variar en épocas de alta demanda. No realizamos envíos a Canarias, Ceuta, Melilla ni a países fuera de la Unión Europea.
            </p>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-900 mb-4">Devoluciones</h2>
            <p>
              Dispones de <span className="font-medium text-gray-800">30 días</span> desde la recepción de tu pedido para solicitar una devolución. Las prendas deben estar en perfecto estado, sin usar, con sus etiquetas originales y en su embalaje original.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex gap-3">
                <span className="font-bold text-gray-300 shrink-0">01</span>
                <p>Contáctanos por WhatsApp o email indicando tu número de pedido y el motivo de la devolución.</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-gray-300 shrink-0">02</span>
                <p>Te indicaremos cómo proceder con el envío de vuelta a nuestra tienda.</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-gray-300 shrink-0">03</span>
                <p>Una vez recibida y verificada la prenda, procesaremos el reembolso en un plazo de 5–7 días hábiles al mismo método de pago utilizado.</p>
              </div>
            </div>
            <p className="mt-4 text-gray-400 text-xs">
              Los gastos de devolución corren a cargo del cliente, excepto en caso de artículo defectuoso o envío incorrecto.
            </p>
          </section>

          <div className="p-6 bg-gray-50 border border-gray-100">
            <p className="text-sm font-semibold uppercase tracking-wider mb-1">¿Tienes alguna duda?</p>
            <p className="text-sm text-gray-500">
              Escríbenos por{' '}
              <a href="https://wa.me/34696641381" target="_blank" rel="noopener noreferrer" className="underline hover:text-black transition-colors">
                WhatsApp
              </a>{' '}
              o al email{' '}
              <a href="mailto:urbanoviedostore@gmail.com" className="underline hover:text-black transition-colors">
                urbanoviedostore@gmail.com
              </a>
              .
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
