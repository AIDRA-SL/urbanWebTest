'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { ShoppingBag, Search, Menu, X, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { CategoryTree } from '@/types/category'
import { SearchBar } from './SearchBar'
import { useSession } from '@/lib/auth-client'
import { AnnouncementBar } from './AnnouncementBar'

interface NavbarProps {
  categories: CategoryTree[]
}

export function Navbar({ categories }: NavbarProps) {
  const totalItems = useCartStore((s) => s.totalItems())
  const toggleCart = useCartStore((s) => s.toggleCart)
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-white/80 backdrop-blur-md border-b ${scrolled ? 'border-gray-200/60 shadow-sm shadow-black/5' : 'border-transparent'}`}
      >
        <AnnouncementBar />

        {/* Row 1: Search | Logo (centered) | Account + Cart */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 items-center h-14">
            {/* Left: hamburger (mobile) + search */}
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-1 hover:opacity-60 transition-opacity"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menú"
              >
                {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
              </button>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-1 hover:opacity-60 transition-opacity"
                aria-label="Buscar"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Center: logo */}
            <div className="flex justify-center">
              <Link href="/" className="font-bold text-xl tracking-[0.15em] uppercase">
                UrbanStore
              </Link>
            </div>

            {/* Right: account + cart */}
            <div className="flex items-center justify-end gap-4">
              <Link
                href={session?.user ? '/mi-cuenta' : '/login'}
                className="p-1 hover:opacity-60 transition-opacity"
                aria-label="Mi cuenta"
              >
                {mounted && session?.user ? (
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-semibold flex items-center justify-center uppercase">
                    {(session.user.name || session.user.email || '?').charAt(0)}
                  </span>
                ) : (
                  <User size={20} strokeWidth={1.5} />
                )}
              </Link>

              <button
                onClick={toggleCart}
                className="p-1 relative hover:opacity-60 transition-opacity"
                aria-label="Carrito"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-black text-white text-[10px] flex items-center justify-center rounded-full font-medium">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Desktop nav (centered, full-width) */}
        <div className="hidden md:block border-t border-gray-100/70">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <nav className="flex items-center justify-center gap-10 h-10">
              {categories.map((cat) => (
                <div key={cat.id} className="relative group">
                  <Link
                    href={`/categoria/${cat.slug}`}
                    className="text-xs uppercase tracking-widest text-gray-600 hover:text-black transition-colors py-1"
                  >
                    {cat.name}
                  </Link>
                  {cat.children.length > 0 && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 hidden group-hover:block min-w-[160px] z-50">
                      <div className="bg-white/90 backdrop-blur-md border border-white/40 shadow-xl shadow-black/10 py-2">
                        {cat.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/categoria/${cat.slug}/${child.slug}`}
                            className="block px-4 py-2 text-xs uppercase tracking-wider text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <Link
                href="/marcas"
                className="text-xs uppercase tracking-widest text-gray-600 hover:text-black transition-colors"
              >
                Marcas
              </Link>
              <Link
                href="/contacto"
                className="text-xs uppercase tracking-widest text-gray-600 hover:text-black transition-colors"
              >
                Contacto
              </Link>
            </nav>
          </div>
        </div>

        {/* Search bar expandable */}
        {searchOpen && (
          <div className="border-t border-gray-100 py-3">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
              <SearchBar onClose={() => setSearchOpen(false)} />
            </div>
          </div>
        )}
      </header>

      {/* Spacer: 32px announcement + 56px row1 + 40px row2 = 128px desktop / 88px mobile */}
      <div className="h-[88px] md:h-32" />

      {/* Mobile menu backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile slide panel (left → right) */}
      <div
        className={`md:hidden fixed top-0 left-0 h-screen w-72 bg-white z-50 flex flex-col transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100 shrink-0">
          <span className="font-bold text-sm tracking-[0.15em] uppercase">UrbanStore</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 hover:opacity-60 transition-opacity"
            aria-label="Cerrar menú"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-6 py-6 flex flex-col">
          {categories.map((cat, idx) => (
            <div key={cat.id}>
              {idx > 0 && <div className="h-px bg-gray-100 my-1" />}
              <Link
                href={`/categoria/${cat.slug}`}
                className="block py-3 text-xs uppercase tracking-widest font-semibold text-gray-900 hover:text-gray-500 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
              {cat.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/categoria/${cat.slug}/${child.slug}`}
                  className="block py-2 pl-3 text-xs uppercase tracking-wider text-gray-400 hover:text-gray-700 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          ))}
          <div className="h-px bg-gray-100 my-1" />
          <Link
            href="/marcas"
            className="block py-3 text-xs uppercase tracking-widest font-semibold text-gray-900 hover:text-gray-500 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Marcas
          </Link>
          <div className="h-px bg-gray-100 my-1" />
          <Link
            href="/contacto"
            className="block py-3 text-xs uppercase tracking-widest font-semibold text-gray-900 hover:text-gray-500 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Contacto
          </Link>
        </nav>

        {/* Panel footer */}
        <div className="px-6 py-5 border-t border-gray-100 shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-gray-300">© UrbanStore</p>
        </div>
      </div>
    </>
  )
}
