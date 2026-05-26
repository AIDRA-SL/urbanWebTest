import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import type { Metadata } from 'next'
import { ContactoForm } from './ContactoForm'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contacta con nuestra tienda. Envíanos un mensaje, llámanos o visítanos en Oviedo.',
}

export default function ContactoPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 pb-24">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Tienda</p>
        <h1 className="text-3xl font-bold tracking-tight uppercase">Contacto</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact info */}
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden border border-gray-100 h-48">
            <iframe
              src="https://maps.google.com/maps?q=Calle+Nueve+de+Mayo+15%2C+33002+Oviedo%2C+Asturias&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de la tienda"
            />
          </div>
          <div className="flex gap-4 p-6 bg-gray-50 border border-gray-100">
            <MapPin size={18} className="shrink-0 mt-0.5 text-gray-400" />
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-1">Dirección</p>
              <p className="text-sm text-gray-500">C/ Nueve de Mayo 15<br />33002 Oviedo, Asturias</p>
            </div>
          </div>

          <div className="flex gap-4 p-6 bg-gray-50 border border-gray-100">
            <Phone size={18} className="shrink-0 mt-0.5 text-gray-400" />
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-1">Teléfono</p>
              <a href="tel:+34696641381" className="text-sm text-gray-500 hover:text-black transition-colors">
                696 64 13 81
              </a>
            </div>
          </div>

          <div className="flex gap-4 p-6 bg-gray-50 border border-gray-100">
            <Mail size={18} className="shrink-0 mt-0.5 text-gray-400" />
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-1">Email</p>
              <a href="mailto:urbanoviedostore@gmail.com" className="text-sm text-gray-500 hover:text-black transition-colors break-all">
                urbanoviedostore@gmail.com
              </a>
            </div>
          </div>

          <div className="flex gap-4 p-6 bg-gray-50 border border-gray-100">
            <Clock size={18} className="shrink-0 mt-0.5 text-gray-400" />
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-1">Horario</p>
              <p className="text-sm text-gray-500">
                Lun–Vie 10:30–14:00, 17:00–20:30<br />
                Sáb 11:00–14:00, 17:00–20:30
              </p>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border border-gray-100">
            <p className="text-sm font-semibold uppercase tracking-wider mb-1">WhatsApp</p>
            <p className="text-sm text-gray-500 mb-4">¿Prefieres escribirnos directamente? Estamos disponibles en WhatsApp en horario de tienda.</p>
            <a
              href="https://wa.me/34696641381"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#25d366] text-white text-xs uppercase tracking-wider px-5 py-3 hover:bg-[#20ba5a] transition-colors"
            >
              Abrir WhatsApp
            </a>
          </div>
        </div>

        {/* Contact form */}
        <ContactoForm />
      </div>
    </div>
  )
}
