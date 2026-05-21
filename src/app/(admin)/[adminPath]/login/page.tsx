'use client'

import { useState } from 'react'
import { signIn, signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { use } from 'react'

interface Props {
  params: Promise<{ adminPath: string }>
}

export default function AdminLogin({ params }: Props) {
  const { adminPath } = use(params)
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn.email({ email, password })
      if (result.error) {
        setError('Credenciales incorrectas')
      } else {
        const check = await fetch('/api/admin/check')
        if (!check.ok) {
          await signOut()
          setError('Acceso denegado')
        } else {
          router.push(`/${adminPath}/analytics`)
          router.refresh()
        }
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-bold text-xl tracking-[0.2em] uppercase text-white">UrbanStore</p>
          <p className="text-sm text-gray-500 mt-1">Panel de gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@urbanstore.es"
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button type="submit" loading={loading} className="w-full mt-2">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}
