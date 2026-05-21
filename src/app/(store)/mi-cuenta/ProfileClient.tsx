'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  postalCode: string | null
  province: string | null
}

interface Props {
  user: UserProfile
}

export function ProfileClient({ user }: Props) {
  const router = useRouter()

  const handleSignOut = async () => {
    await authClient.signOut({ fetchOptions: { onSuccess: () => router.push('/') } })
  }

  const [personal, setPersonal] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
  })
  const [address, setAddress] = useState({
    address: user.address ?? '',
    city: user.city ?? '',
    postalCode: user.postalCode ?? '',
    province: user.province ?? '',
  })
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [personalMsg, setPersonalMsg] = useState('')
  const [addressMsg, setAddressMsg] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [personalLoading, setPersonalLoading] = useState(false)
  const [addressLoading, setAddressLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const savePersonal = async (e: React.FormEvent) => {
    e.preventDefault()
    setPersonalLoading(true)
    setPersonalMsg('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: personal.name, email: personal.email, phone: personal.phone }),
      })
      setPersonalMsg(res.ok ? 'Datos guardados.' : 'Error al guardar.')
    } finally {
      setPersonalLoading(false)
    }
  }

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddressLoading(true)
    setAddressMsg('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      })
      setAddressMsg(res.ok ? 'Dirección guardada.' : 'Error al guardar.')
    } finally {
      setAddressLoading(false)
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg('')
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg('Las contraseñas nuevas no coinciden.')
      return
    }
    if (passwords.newPassword.length < 8) {
      setPasswordMsg('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    setPasswordLoading(true)
    try {
      const result = await authClient.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        revokeOtherSessions: false,
      })
      if (result.error) {
        setPasswordMsg(result.error.message ?? 'Error al cambiar la contraseña.')
      } else {
        setPasswordMsg('Contraseña actualizada.')
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-xl space-y-12">
      {/* Personal data */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest mb-5">Datos personales</h2>
        <form onSubmit={savePersonal} className="flex flex-col gap-4">
          <Input
            id="name"
            label="Nombre"
            type="text"
            value={personal.name}
            onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
            required
          />
          <Input
            id="email"
            label="Email"
            type="email"
            value={personal.email}
            onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
            required
          />
          <Input
            id="phone"
            label="Teléfono"
            type="tel"
            value={personal.phone}
            onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
          />
          {personalMsg && (
            <p className={`text-xs ${personalMsg.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
              {personalMsg}
            </p>
          )}
          <Button type="submit" loading={personalLoading} size="sm" className="self-start">
            Guardar
          </Button>
        </form>
      </section>

      {/* Shipping address */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest mb-5">Dirección de envío</h2>
        <form onSubmit={saveAddress} className="flex flex-col gap-4">
          <Input
            id="address"
            label="Calle y número"
            type="text"
            value={address.address}
            onChange={(e) => setAddress({ ...address, address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="city"
              label="Ciudad"
              type="text"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
            <Input
              id="postalCode"
              label="Código postal"
              type="text"
              value={address.postalCode}
              onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
            />
          </div>
          <Input
            id="province"
            label="Provincia"
            type="text"
            value={address.province}
            onChange={(e) => setAddress({ ...address, province: e.target.value })}
          />
          {addressMsg && (
            <p className={`text-xs ${addressMsg.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
              {addressMsg}
            </p>
          )}
          <Button type="submit" loading={addressLoading} size="sm" className="self-start">
            Guardar dirección
          </Button>
        </form>
      </section>

      {/* Change password */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest mb-5">Cambiar contraseña</h2>
        <form onSubmit={changePassword} className="flex flex-col gap-4">
          <Input
            id="currentPassword"
            label="Contraseña actual"
            type="password"
            autoComplete="current-password"
            required
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
          />
          <Input
            id="newPassword"
            label="Nueva contraseña"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          />
          <Input
            id="confirmPassword"
            label="Confirmar nueva contraseña"
            type="password"
            autoComplete="new-password"
            required
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
          />
          {passwordMsg && (
            <p className={`text-xs ${passwordMsg.startsWith('Error') || passwordMsg.includes('coinciden') || passwordMsg.includes('menos') ? 'text-red-500' : 'text-green-600'}`}>
              {passwordMsg}
            </p>
          )}
          <Button type="submit" loading={passwordLoading} size="sm" className="self-start">
            Cambiar contraseña
          </Button>
        </form>
      </section>

      {/* Sign out */}
      <section className="border-t border-gray-100 pt-6">
        <button
          onClick={handleSignOut}
          className="text-xs text-gray-400 uppercase tracking-wider hover:text-black transition-colors"
        >
          Cerrar sesión
        </button>
      </section>
    </div>
  )
}
