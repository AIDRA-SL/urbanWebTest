'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

export function ContactoForm() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'ok' : 'error')
      if (res.ok) setForm({ nombre: '', email: '', asunto: '', mensaje: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div>
      <h2 className="text-sm uppercase tracking-widest font-semibold mb-6">Envíanos un mensaje</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">Nombre *</label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">Asunto *</label>
          <input
            type="text"
            required
            value={form.asunto}
            onChange={(e) => setForm({ ...form, asunto: e.target.value })}
            className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            placeholder="¿En qué podemos ayudarte?"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">Mensaje *</label>
          <textarea
            required
            rows={6}
            value={form.mensaje}
            onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
            className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
            placeholder="Escribe tu mensaje aquí..."
          />
        </div>

        {status === 'ok' && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-100 px-4 py-3">
            Mensaje enviado correctamente. Te responderemos pronto.
          </p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3">
            Error al enviar el mensaje. Inténtalo de nuevo o contáctanos por WhatsApp.
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="flex items-center justify-center gap-2 bg-black text-white text-xs uppercase tracking-widest px-6 py-4 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={14} />
          {status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
        </button>
      </form>
    </div>
  )
}
