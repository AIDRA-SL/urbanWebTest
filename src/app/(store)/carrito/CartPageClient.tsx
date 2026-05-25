'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Image from 'next/image'
import Link from 'next/link'
import { X, CreditCard, MapPin, Tag, Lock } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import { useSession } from '@/lib/auth-client'

interface Discount {
  pct: number
  label: string
}

export function CartPageClient() {
  const searchParams = useSearchParams()
  const { items, remove, updateQty, clear, totalPrice } = useCartStore()
  const { data: session } = useSession()

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>(
    searchParams.get('step') === 'checkout' ? 'checkout' : 'cart'
  )
  const [loading, setLoading] = useState(false)
  const [saveData, setSaveData] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', postalCode: '', province: '',
    cardNumber: '', cardExpiry: '', cardCvv: '',
  })
  const [orderNumber, setOrderNumber] = useState('')

  // Pre-fill checkout form from saved profile when user is logged in
  useEffect(() => {
    if (!session?.user) return
    fetch('/api/profile')
      .then((r) => r.json())
      .then((profile) => {
        setForm((prev) => ({
          ...prev,
          name: profile.name || prev.name,
          email: profile.email || prev.email,
          phone: profile.phone || prev.phone,
          address: profile.address || prev.address,
          city: profile.city || prev.city,
          postalCode: profile.postalCode || prev.postalCode,
          province: profile.province || prev.province,
        }))
      })
      .catch(() => {})
  }, [session?.user])

  // Discount code state
  const [couponInput, setCouponInput] = useState('')
  const [discount, setDiscount] = useState<Discount | null>(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const rawTotal = totalPrice()
  const discountAmount = discount ? rawTotal * (discount.pct / 100) : 0
  const finalTotal = rawTotal - discountAmount

  const applyCode = useCallback(async () => {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await fetch('/api/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (data.valid) {
        setDiscount({ pct: data.discountPct, label: data.code })
        setCouponError('')
      } else {
        setDiscount(null)
        setCouponError(data.error ?? 'Código no válido')
      }
    } catch {
      setCouponError('Error al validar el código')
    } finally {
      setCouponLoading(false)
    }
  }, [couponInput])

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    setLoading(true)
    try {
      trackEvent({ type: 'CHECKOUT_START' })
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          shippingAddress: [form.address, form.city, form.postalCode, form.province]
            .filter(Boolean)
            .join(', '),
          discountCode: discount?.label ?? null,
          discountAmount: discountAmount > 0 ? discountAmount : null,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            size: i.size,
            variantId: i.variantId,
          })),
        }),
      })
      const data = await res.json()
      if (data.data?.orderNumber) {
        if (saveData) {
          await fetch('/api/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              phone: form.phone,
              address: form.address,
              city: form.city,
              postalCode: form.postalCode,
              province: form.province,
            }),
          })
        }
        setOrderNumber(data.data.orderNumber)
        trackEvent({ type: 'ORDER_PLACED', orderId: data.data.id })
        clear()
        setStep('success')
      }
    } finally {
      setLoading(false)
    }
  }

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  // ─── Success ───────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-12 h-12 border-2 border-black flex items-center justify-center mb-6">
          <span className="text-xl">✓</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">¡Pedido realizado!</h1>
        <p className="text-gray-500 mb-1">Número de pedido: <strong>{orderNumber}</strong></p>
        <p className="text-sm text-gray-400 mb-8 max-w-sm">
          Nos pondremos en contacto contigo para confirmar tu pedido y coordinar la recogida o envío.
        </p>
        <Link href="/"><Button>Seguir comprando</Button></Link>
      </div>
    )
  }

  // ─── Empty cart ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Tu carrito está vacío</h1>
        <p className="text-sm text-gray-400 mb-8">Añade productos para poder realizar un pedido.</p>
        <Link href="/"><Button>Ir a la tienda</Button></Link>
      </div>
    )
  }

  // ─── Cart + Checkout ───────────────────────────────────────────────────────
  return (
    <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight uppercase mb-8">
        {step === 'cart' ? 'Carrito de compra' : 'Finalizar pedido'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* ── Left column ── */}
        <div className="lg:col-span-3">
          {step === 'cart' ? (
            // Cart items list
            <div className="flex flex-col divide-y divide-gray-100">
              {items.map((item) => (
                <div key={`${item.productId}:${item.variantId ?? ''}`} className="flex gap-4 py-4">
                  <div className="w-20 h-20 bg-gray-100 flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    {item.size && <p className="text-xs text-gray-400 mt-0.5">Talla: {item.size}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200">
                        <button className="px-2 py-1 text-sm" onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}>−</button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button
                          className="px-2 py-1 text-sm disabled:opacity-30 transition-opacity"
                          disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
                          onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
                        >+</button>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                  <button className="self-start p-1 text-gray-400 hover:text-black" onClick={() => remove(item.productId, item.variantId)}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            // Checkout form
            <form onSubmit={handleCheckout} className="flex flex-col gap-6">
              {/* Contact */}
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold text-gray-500 mb-3">Datos de contacto</p>
                <div className="flex flex-col gap-3">
                  <Input label="Nombre completo" required value={form.name} onChange={set('name')} placeholder="Tu nombre y apellidos" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="tu@email.com" />
                    <Input label="Teléfono" type="tel" value={form.phone} onChange={set('phone')} placeholder="+34 600 000 000" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-gray-400" />
                  <p className="text-xs uppercase tracking-widest font-semibold text-gray-500">Dirección de envío</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Input label="Calle y número" required value={form.address} onChange={set('address')} placeholder="Calle Mayor, 10, 2º A" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Ciudad" required value={form.city} onChange={set('city')} placeholder="Oviedo" />
                    <Input label="Código postal" required value={form.postalCode} onChange={set('postalCode')} placeholder="33001" />
                  </div>
                  <Input label="Provincia" required value={form.province} onChange={set('province')} placeholder="Asturias" />
                </div>
              </div>

              {/* Remember data */}
              {session?.user && (
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={saveData}
                    onChange={(e) => setSaveData(e.target.checked)}
                    className="w-4 h-4 accent-black"
                  />
                  <span className="text-xs text-gray-500">Recordar estos datos para futuras compras</span>
                </label>
              )}

              {/* Card */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={14} className="text-gray-400" />
                  <p className="text-xs uppercase tracking-widest font-semibold text-gray-500">Datos de tarjeta</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Input
                    label="Número de tarjeta"
                    value={form.cardNumber}
                    onChange={set('cardNumber')}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Caducidad (MM/AA)" value={form.cardExpiry} onChange={set('cardExpiry')} placeholder="12/28" maxLength={5} />
                    <Input label="CVV" value={form.cardCvv} onChange={set('cardCvv')} placeholder="123" maxLength={4} type="password" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                  <Lock size={11} />
                  <span>Los datos de tarjeta son orientativos. Te contactaremos para coordinar el pago.</span>
                </div>
              </div>

              <Button type="submit" loading={loading} size="lg">
                Confirmar pedido
              </Button>
              <button type="button" onClick={() => setStep('cart')} className="text-xs text-gray-400 hover:text-black text-center -mt-2">
                ← Volver al carrito
              </button>
            </form>
          )}
        </div>

        {/* ── Right column: summary ── */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 p-6 sticky top-24">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Resumen</h2>
            <div className="flex flex-col gap-2 text-sm mb-4">
              {items.map((item) => (
                <div key={`${item.productId}:${item.variantId ?? ''}`} className="flex justify-between">
                  <span className="text-gray-600 truncate max-w-[180px]">{item.name} × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Discount code input */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Tag size={13} className="text-gray-400" />
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Código de descuento</p>
              </div>
              {discount ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2">
                  <span className="text-xs font-mono font-semibold text-green-700">{discount.label} — {discount.pct}% dto.</span>
                  <button
                    type="button"
                    onClick={() => { setDiscount(null); setCouponInput('') }}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCode())}
                    placeholder="CÓDIGO"
                    className="flex-1 border border-gray-200 px-3 py-2 text-xs font-mono uppercase tracking-widest focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    type="button"
                    onClick={applyCode}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-3 py-2 text-xs bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
                  >
                    {couponLoading ? '...' : 'Aplicar'}
                  </button>
                </div>
              )}
              {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
            </div>

            {/* Totals */}
            <div className="flex flex-col gap-1.5 text-sm border-t border-gray-200 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(rawTotal)}</span>
              </div>
              {discount && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Descuento ({discount.pct}%)</span>
                  <span>−{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base mt-1 pt-1 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-2">Gastos de envío a calcular</p>
            {step === 'cart' && (
              <Button className="w-full mt-4" onClick={() => setStep('checkout')}>
                Continuar al pago
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
