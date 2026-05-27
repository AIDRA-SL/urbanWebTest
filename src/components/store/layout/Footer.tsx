import Link from 'next/link'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  )
}


function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.79 1.53V6.75a4.85 4.85 0 0 1-1.02-.06z"/>
    </svg>
  )
}

export function Footer() {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? 'UrbanStore'
  const address = process.env.NEXT_PUBLIC_STORE_ADDRESS ?? 'C/ Nueve de Mayo 15, 33002 Oviedo'
  const phone = process.env.NEXT_PUBLIC_STORE_PHONE ?? ''
  const email = process.env.NEXT_PUBLIC_STORE_EMAIL ?? ''
  const instagram = process.env.NEXT_PUBLIC_STORE_INSTAGRAM ?? ''
  const facebook = process.env.NEXT_PUBLIC_STORE_FACEBOOK ?? ''
  const tiktok = process.env.NEXT_PUBLIC_STORE_TIKTOK ?? ''

  return (
    <footer className="relative text-white mt-24 overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(255,255,255,0.04)_0%,transparent_100%)]" />
      {/* Top glass border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand + contact */}
          <div>
            <p className="font-bold text-lg tracking-[0.2em] uppercase mb-2">{storeName}</p>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Descubre lo último en moda urbana y lujo. Conecta, explora, brilla.
            </p>

            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span>{address}</span>
              </div>
              {phone && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Phone size={14} className="shrink-0" />
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                    {phone}
                  </a>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail size={14} className="shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                    {email}
                  </a>
                </div>
              )}
              <div className="flex items-start gap-2 text-sm text-gray-400">
                <Clock size={14} className="mt-0.5 shrink-0" />
                <span>
                  Lun–Vie 10:30–14:00, 17:00–20:30<br />
                  Sáb 11:00–14:00, 17:00–20:30
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                  <InstagramIcon />
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                  <FacebookIcon />
                </a>
              )}
              {tiktok && (
                <a href={tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="TikTok">
                  <TikTokIcon />
                </a>
              )}
            </div>
          </div>

          {/* Mi cuenta */}
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold mb-4 text-gray-300">Mi cuenta</p>
            <ul className="flex flex-col gap-2">
              {[
                { label: 'Mi cuenta', href: '/mi-cuenta' },
                { label: 'Mis pedidos', href: '/mi-cuenta' },
                { label: 'Contacto', href: '/contacto' },
                { label: 'Envíos y devoluciones', href: '/ayuda/envios-devoluciones' },
                { label: 'Cómo comprar', href: '/ayuda/como-comprar' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold mb-4 text-gray-300">Legal</p>
            <ul className="flex flex-col gap-2">
              {[
                { label: 'Aviso legal', href: '/legal/aviso-legal' },
                { label: 'Política de privacidad', href: '/legal/privacidad' },
                { label: 'Política de cookies', href: '/legal/cookies' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {storeName}. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-500">Oviedo, Asturias, España</p>
        </div>
      </div>
    </footer>
  )
}
