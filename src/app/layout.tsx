import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'UrbanStore — Moda en Oviedo',
    template: '%s | UrbanStore',
  },
  description: 'Tienda de ropa en Oviedo. Moda urbana y casual. C. Nueve de Mayo, 15, 33002 Oviedo, Asturias.',
  keywords: ['ropa', 'moda', 'Oviedo', 'Asturias', 'urban', 'streetwear'],
  authors: [{ name: 'UrbanStore' }],
  creator: 'UrbanStore',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'UrbanStore',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
