const reviews = [
  {
    name: 'Carlos M.',
    rating: 5,
    text: 'Super amable el trato de Tino, ropa increíble y de calidad. Los precios son muy buenos para lo que ofrecen.',
    date: 'hace 2 semanas',
  },
  {
    name: 'Laura P.',
    rating: 5,
    text: 'El dueño hace que te sientas como en casa y es muy profesional. La ropa es increíble y tiene gran variedad.',
    date: 'hace 1 mes',
  },
  {
    name: 'Miguel A.',
    rating: 5,
    text: 'Una tienda con un estilo muy cuidado. Encontré exactamente lo que buscaba y a muy buen precio. Volveré sin duda.',
    date: 'hace 3 semanas',
  },
  {
    name: 'Sara G.',
    rating: 5,
    text: 'Genial selección de marcas urbanas. La atención personalizada es de 10. Muy recomendable si estás en Oviedo.',
    date: 'hace 1 mes',
  },
  {
    name: 'Roberto F.',
    rating: 4,
    text: 'Muy buena relación calidad-precio. Amplio surtido de tallas y estilos. Una de las mejores tiendas de la ciudad.',
    date: 'hace 2 meses',
  },
  {
    name: 'Ana B.',
    rating: 5,
    text: 'El mejor sitio para encontrar moda urbana en Oviedo. Siempre hay novedades y el servicio es excelente.',
    date: 'hace 3 semanas',
  },
  {
    name: 'Javier R.',
    rating: 5,
    text: 'Llevo años comprando aquí y nunca me ha defraudado. Gran selección de ropa para todos los estilos.',
    date: 'hace 1 mes',
  },
]

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? '#FBBC04' : 'none'}
      stroke={filled ? '#FBBC04' : '#d1d5db'}
      strokeWidth="1.5"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function ReviewCard({ review }: { review: typeof reviews[0] }) {
  return (
    <div className="w-72 flex-shrink-0 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <StarIcon key={i} filled={i <= review.rating} />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <GoogleLogo />
          <span className="text-[10px] text-gray-400 font-medium">Google</span>
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{review.text}</p>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
            {review.name[0]}
          </div>
          <span className="text-xs font-medium text-gray-800">{review.name}</span>
        </div>
        <span className="text-[10px] text-gray-400">{review.date}</span>
      </div>
    </div>
  )
}

export function ReviewsCarousel() {
  const doubled = [...reviews, ...reviews]

  return (
    <section className="py-16 bg-gray-50/60 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 mb-8">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight uppercase">Lo que dicen nuestros clientes</h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <GoogleLogo />
              Reseñas verificadas en Google
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50/60 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50/60 to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee gap-5 w-max px-4">
          {doubled.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </div>
      </div>
    </section>
  )
}
