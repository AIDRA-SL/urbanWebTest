'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronDown, Plus, Edit, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  isActive: boolean
  sortOrder: number
}

interface Props {
  categories: Category[]
  adminPath: string
}

interface TreeNode extends Category {
  children: TreeNode[]
}

function buildTree(cats: Category[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  const roots: TreeNode[] = []
  for (const c of cats) map.set(c.id, { ...c, children: [] })
  for (const node of map.values()) {
    if (node.parentId) map.get(node.parentId)?.children.push(node)
    else roots.push(node)
  }
  return roots
}

function CategoryNode({ node, categories, onEdit, onDelete, depth = 0 }: {
  node: TreeNode
  categories: Category[]
  onEdit: (cat: Category) => void
  onDelete: (id: string, name: string) => void
  depth?: number
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-sm group transition-colors`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        <button onClick={() => setExpanded(!expanded)} className="w-4 flex-shrink-0">
          {node.children.length > 0 && (
            expanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />
          )}
        </button>
        <span className={`flex-1 text-sm ${!node.isActive ? 'text-gray-400 line-through' : ''}`}>
          {node.name}
        </span>
        <span className="text-xs text-gray-400 hidden sm:block">/{node.slug}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(node)} className="p-1 text-gray-400 hover:text-black">
            <Edit size={13} />
          </button>
          <button onClick={() => onDelete(node.id, node.name)} className="p-1 text-gray-400 hover:text-red-600">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {expanded && node.children.map((child) => (
        <CategoryNode key={child.id} node={child} categories={categories} onEdit={onEdit} onDelete={onDelete} depth={depth + 1} />
      ))}
    </div>
  )
}

export function CategoriesClient({ categories, adminPath }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const tree = buildTree(categories)

  const openNew = () => {
    setEditCat(null)
    setName('')
    setParentId('')
    setShowForm(true)
  }

  const openEdit = (cat: Category) => {
    setEditCat(cat)
    setName(cat.name)
    setParentId(cat.parentId ?? '')
    setShowForm(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar categoría "${name}"?`)) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.error); return }
    router.refresh()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      const url = editCat ? `/api/categories/${editCat.id}` : '/api/categories'
      const method = editCat ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId: parentId || null }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowForm(false)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  void adminPath

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Tree */}
      <div className="lg:col-span-3 bg-white border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-widest text-gray-500">Árbol de categorías</h3>
          <button onClick={openNew} className="flex items-center gap-1 text-xs text-black hover:opacity-70 transition-opacity">
            <Plus size={13} /> Nueva
          </button>
        </div>
        {tree.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No hay categorías. Crea la primera.</p>
        ) : (
          tree.map((node) => (
            <CategoryNode key={node.id} node={node} categories={categories} onEdit={openEdit} onDelete={handleDelete} />
          ))
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="lg:col-span-2 bg-white border border-gray-100 p-6">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
            {editCat ? 'Editar categoría' : 'Nueva categoría'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nombre *" value={name} onChange={(e) => setName(e.target.value)} required />
            <Select
              label="Categoría padre (opcional)"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">— Sin padre (categoría principal)</option>
              {categories
                .filter((c) => c.id !== editCat?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </Select>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" loading={saving} size="sm">{editCat ? 'Guardar' : 'Crear'}</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
