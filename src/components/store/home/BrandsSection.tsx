import Image from 'next/image'

interface Brand {
  id: string
  name: string
  logoUrl: string
}

interface Props {
  brands: Brand[]
}

export function BrandsSection({ brands }: Props) {
  if (brands.length === 0) return null

  return (
    <section className="border-t border-gray-100 py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <p className="text-xs uppercase tracking-widest text-gray-400 text-center mb-8">
          Marcas colaboradoras
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {brands.map((brand) => (
            <div key={brand.id} className="relative h-10 w-28 opacity-50 hover:opacity-80 transition-opacity grayscale hover:grayscale-0">
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                fill
                className="object-contain"
                sizes="112px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
