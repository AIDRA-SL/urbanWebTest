import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { ProfileClient } from './ProfileClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mi cuenta — UrbanStore',
}

export default async function MiCuentaPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login?callbackUrl=/mi-cuenta')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, address: true, city: true, postalCode: true, province: true },
  })

  if (!user) redirect('/login')

  return (
    <div className="max-w-screen-md mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">UrbanStore</p>
        <h1 className="text-2xl font-bold tracking-tight uppercase">Mi cuenta</h1>
        <p className="text-sm text-gray-500 mt-1">{user.email}</p>
      </div>

      <ProfileClient user={user} />
    </div>
  )
}
