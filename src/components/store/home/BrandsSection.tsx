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
    <section className="bg-zinc-900 py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <p className="text-xs uppercase tracking-widest text-zinc-500 text-center mb-10">
          Marcas colaboradoras
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="relative h-16 w-36 p-3 opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                fill
                unoptimized
                className="object-contain p-2"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
