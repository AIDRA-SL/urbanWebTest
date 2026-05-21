import { DiscountCodesClient } from './DiscountCodesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Códigos de descuento — Admin' }

export default function DescuentosPage() {
  return <DiscountCodesClient />
}
