'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Props {
  currentName: string
  currentEmail: string
}

export function AdminSettingsClient({ currentName, currentEmail }: Props) {
  const [name, setName] = useState(currentName)
  const [email, setEmail] = useState(currentEmail)
  const [nameMsg, setNameMsg] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameLoading(true)
    setNameMsg('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      setNameMsg(res.ok ? 'Nombre actualizado.' : 'Error al guardar.')
    } finally {
      setNameLoading(false)
    }
  }

  const saveEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)
    setEmailMsg('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setEmailMsg(res.ok ? 'Email actualizado.' : 'Error al guardar.')
    } finally {
      setEmailLoading(false)
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg('')
    if (passwords.next !== passwords.confirm) {
      setPasswordMsg('Las contraseñas no coinciden.')
      return
    }
    if (passwords.next.length < 8) {
      setPasswordMsg('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    setPasswordLoading(true)
    try {
      const result = await authClient.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.next,
        revokeOtherSessions: true,
      })
      if (result.error) {
        setPasswordMsg(result.error.message ?? 'Error al cambiar la contraseña.')
      } else {
        setPasswordMsg('Contraseña actualizada.')
        setPasswords({ current: '', next: '', confirm: '' })
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  const isError = (msg: string) =>
    msg.startsWith('Error') || msg.includes('coinciden') || msg.includes('menos')

  return (
    <div className="max-w-lg space-y-10">
      {/* Change name */}
      <section className="bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-semibold mb-4">Nombre de administrador</h2>
        <form onSubmit={saveName} className="flex flex-col gap-4">
          <Input
            id="adminName"
            label="Nombre"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {nameMsg && (
            <p className={`text-xs ${isError(nameMsg) ? 'text-red-500' : 'text-green-600'}`}>{nameMsg}</p>
          )}
          <Button type="submit" loading={nameLoading} size="sm" className="self-start">
            Guardar nombre
          </Button>
        </form>
      </section>

      {/* Change email */}
      <section className="bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-semibold mb-4">Email de acceso</h2>
        <form onSubmit={saveEmail} className="flex flex-col gap-4">
          <Input
            id="adminEmail"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {emailMsg && (
            <p className={`text-xs ${isError(emailMsg) ? 'text-red-500' : 'text-green-600'}`}>{emailMsg}</p>
          )}
          <Button type="submit" loading={emailLoading} size="sm" className="self-start">
            Guardar email
          </Button>
        </form>
      </section>

      {/* Change password */}
      <section className="bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-semibold mb-4">Contraseña</h2>
        <form onSubmit={changePassword} className="flex flex-col gap-4">
          <Input
            id="currentPwd"
            label="Contraseña actual"
            type="password"
            autoComplete="current-password"
            required
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
          />
          <Input
            id="newPwd"
            label="Nueva contraseña"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={passwords.next}
            onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
          />
          <Input
            id="confirmPwd"
            label="Confirmar nueva contraseña"
            type="password"
            autoComplete="new-password"
            required
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
          />
          {passwordMsg && (
            <p className={`text-xs ${isError(passwordMsg) ? 'text-red-500' : 'text-green-600'}`}>{passwordMsg}</p>
          )}
          <Button type="submit" loading={passwordLoading} size="sm" className="self-start">
            Cambiar contraseña
          </Button>
        </form>
      </section>
    </div>
  )
}
