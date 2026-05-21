'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Metadata } from 'next'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/mi-cuenta'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn.email({
        email: form.email,
        password: form.password,
        fetchOptions: {
          onSuccess: () => router.push(callbackUrl),
          onError: (ctx) => setError(ctx.error.message ?? 'Error al iniciar sesión'),
        },
      })
      if (result?.error) setError(result.error.message ?? 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">UrbanStore</p>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Iniciar sesión</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            id="password"
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && <p className="text-xs text-red-500">{error}</p>}

          <Button type="submit" loading={loading} className="w-full mt-2">
            Entrar
          </Button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/registro" className="text-black underline hover:no-underline">
            Regístrate
          </Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-3">
          Puedes{' '}
          <Link href="/carrito" className="underline hover:no-underline">
            comprar sin cuenta
          </Link>
          {' '}si lo prefieres.
        </p>
      </div>
    </div>
  )
}
