export interface ProductImage {
  id: string
  url: string
  altText: string | null
  sortOrder: number
  isPrimary: boolean
}

export interface ProductVariant {
  id: string
  size: string | null
  color: string | null
  stock: number
  sku: string | null
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  sku: string | null
  isActive: boolean
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
  images: ProductImage[]
  variants: ProductVariant[]
  categories: ProductCategory[]
}

export type ProductCard = Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'comparePrice'> & {
  images: Pick<ProductImage, 'url' | 'altText' | 'isPrimary'>[]
  variants?: Pick<ProductVariant, 'id' | 'size' | 'stock'>[]
}
