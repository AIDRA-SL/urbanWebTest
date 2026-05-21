import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cómo comprar | UrbanStore',
  description: 'Aprende a comprar en UrbanStore Oviedo paso a paso.',
}

export default function ComoComprarPage() {
  const steps = [
    {
      n: '01',
      title: 'Explora la tienda',
      body: 'Navega por nuestras categorías o utiliza el buscador para encontrar lo que buscas.',
    },
    {
      n: '02',
      title: 'Elige tu talla y añade al carrito',
      body: 'En cada producto verás las tallas disponibles. Selecciona la tuya y añádela al carrito.',
    },
    {
      n: '03',
      title: 'Revisa tu pedido',
      body: 'Accede al carrito para revisar los artículos seleccionados. Puedes modificar cantidades o aplicar un código de descuento.',
    },
    {
      n: '04',
      title: 'Introduce tus datos',
      body: 'Rellena el formulario con tu dirección de envío y datos de contacto.',
    },
    {
      n: '05',
      title: 'Realiza el pago',
      body: 'Procesamos tu pago de forma segura mediante tarjeta de crédito o débito.',
    },
    {
      n: '06',
      title: 'Recibe tu pedido',
      body: 'Recibirás un correo de confirmación. Preparamos tu pedido de inmediato y lo enviamos en el plazo indicado.',
    },
  ]

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 pb-24">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Ayuda</p>
        <h1 className="text-3xl font-bold tracking-tight uppercase mb-10">Cómo comprar</h1>

        <div className="flex flex-col gap-8 mb-12">
          {steps.map((step) => (
            <div key={step.n} className="flex gap-6">
              <span className="text-2xl font-bold text-gray-100 tracking-tight shrink-0 w-10">{step.n}</span>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-1">{step.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50 border border-gray-100">
          <p className="text-sm font-semibold uppercase tracking-wider mb-1">¿Tienes alguna duda?</p>
          <p className="text-sm text-gray-500">
            Escríbenos por{' '}
            <a href="https://wa.me/34696641381" target="_blank" rel="noopener noreferrer" className="underline hover:text-black transition-colors">
              WhatsApp
            </a>{' '}
            o visítanos en tienda. Estaremos encantados de ayudarte.
          </p>
        </div>
      </div>
    </div>
  )
}
