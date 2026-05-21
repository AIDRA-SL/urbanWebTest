export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
  parentId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CategoryTree extends Category {
  children: CategoryTree[]
}
