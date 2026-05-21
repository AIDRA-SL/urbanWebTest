'use client'

interface Variant {
  id: string
  size: string | null
  color: string | null
  stock: number
}

interface Props {
  variants: Variant[]
  selected: string | null
  onSelect: (variantId: string, size: string | null) => void
}

export function SizeSelector({ variants, selected, onSelect }: Props) {
  const sizeVariants = variants.filter((v) => v.size && v.stock > 0)
  if (sizeVariants.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider">Talla</span>
        <button className="text-xs text-gray-500 underline hover:text-black transition-colors">
          Guía de tallas
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizeVariants.map((variant) => {
          const isSelected = selected === variant.id

          return (
            <button
              key={variant.id}
              onClick={() => onSelect(variant.id, variant.size)}
              className={[
                'min-w-[44px] h-11 px-3 text-sm border transition-all duration-150',
                isSelected
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 hover:border-black',
              ].join(' ')}
            >
              {variant.size}
            </button>
          )
        })}
      </div>
    </div>
  )
}
