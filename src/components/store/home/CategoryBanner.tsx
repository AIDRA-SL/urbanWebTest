import Link from 'next/link'
import Image from 'next/image'
import type { CategoryTree } from '@/types/category'

interface Props {
  categories: CategoryTree[]
}

export function CategoryBanner({ categories }: Props) {
  const featured = categories.filter((c) => c.imageUrl && c.slug.toLowerCase() !== 'calzado').slice(0, 4)
  if (featured.length === 0) return null

  return (
    <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {featured.map((cat) => (
          <Link
            key={cat.id}
            href={`/categoria/${cat.slug}`}
            className="group relative aspect-[4/5] overflow-hidden bg-gray-100 block"
          >
            {cat.imageUrl && (
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="text-white font-bold text-sm uppercase tracking-widest">
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
