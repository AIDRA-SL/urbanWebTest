import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-4">Error 404</p>
      <h1 className="text-5xl font-bold tracking-tight mb-4">Página no encontrada</h1>
      <p className="text-gray-500 mb-8 text-center max-w-sm">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="bg-black text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-gray-900 transition-colors"
      >
        Volver a la tienda
      </Link>
    </div>
  )
}
