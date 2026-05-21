import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { AdminSettingsClient } from './AdminSettingsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Configuración — Admin',
}

export default async function ConfiguracionPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('login')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">Gestiona tus credenciales de acceso al panel.</p>
      </div>

      <AdminSettingsClient currentName={session.user.name} currentEmail={session.user.email} />
    </div>
  )
}
