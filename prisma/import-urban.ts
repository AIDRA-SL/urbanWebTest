import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { put } from '@vercel/blob'
import { nanoid } from 'nanoid'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

function createPrisma() {
  const dbUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
  const authToken = process.env.TURSO_AUTH_TOKEN
  const adapter = new PrismaLibSql({ url: dbUrl, authToken })
  return new PrismaClient({ adapter })
}

const ROOT = process.cwd()
const IMAGENES_DIR = path.join(ROOT, 'datosUrban', 'imagenes')
const JSON_PATH = path.join(ROOT, 'datosUrban', 'data', 'raw_products.json')

// Subcategorías scraped → slug parcial DB
const SUBCAT_SLUGS: Record<string, string> = {
  'sudaderas': 'sudaderas',
  'camisetas': 'camisetas',
  'camisas': 'camisas',
  'chaquetas': 'chaquetas',
  'pantalones': 'pantalones',
  'jeans': 'jeans',
  'joggers': 'joggers',
  'banadores': 'banadores',
  'bañadores': 'banadores',
  'sport': 'sport',
  'zapatillas': 'zapatillas',
  'jerseys': 'jerseys',
  'vestidos': 'vestidos',
  'bolsos': 'bolsos',
  'cinturones': 'cinturones',
  'accesorios': 'complementos',
  'gafas': 'complementos',
  'complementos': 'complementos',
}

const BADGE_COLORS: Record<string, string> = {
  'rebajas': '#dc2626',
  'nueva coleccion': '#16a34a',
  'nuevo': '#16a34a',
  'reserva': '#7c3aed',
}

function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

function mapCategoriesToSlugs(scrapedCats: string[]): string[] {
  const normalized = scrapedCats.map(norm)
  const slugs: string[] = []

  const gender = normalized.includes('hombre') ? 'hombre' : normalized.includes('mujer') ? 'mujer' : null
  if (gender) slugs.push(gender)

  for (const cat of normalized) {
    if (cat === 'hombre' || cat === 'mujer') continue
    const sub = SUBCAT_SLUGS[cat]
    if (!sub) continue
    if (sub === 'bolsos' || sub === 'cinturones' || sub === 'complementos') {
      slugs.push('complementos')
      if (sub !== 'complementos') slugs.push(sub)
    } else if (sub === 'zapatillas') {
      slugs.push('calzado')
      if (gender) {
        slugs.push(`calzado-${gender}`)
        slugs.push(`${gender}-zapatillas`)
      }
    } else if (gender) {
      slugs.push(`${gender}-${sub}`)
    }
  }

  return [...new Set(slugs)]
}

async function uploadLocalImage(localPath: string): Promise<string | null> {
  try {
    const raw = fs.readFileSync(localPath)
    const processed = await sharp(raw)
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()
    const blob = await put(`products/${nanoid()}.webp`, processed, {
      access: 'public',
      contentType: 'image/webp',
    })
    return blob.url
  } catch {
    return null
  }
}

interface ScrapedProduct {
  url: string
  slug: string
  name: string
  brand: string
  regular_price: string
  sale_price: string
  description: string
  short_description: string
  composition: string
  categories: string[]
  tags: string[]
  sizes: string[]
  images: string[]
  stock_status: string
  stock_quantity: string
  badges: string[]
  attributes: Record<string, string>
  local_images: string[]
}

async function main() {
  const prisma = createPrisma()

  if (!fs.existsSync(JSON_PATH)) {
    console.error(`No encontrado: ${JSON_PATH}`)
    console.error('Ejecuta primero: cd datosUrban && python scraper.py')
    process.exit(1)
  }

  const products: ScrapedProduct[] = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'))
  console.log(`Productos en raw_products.json: ${products.length}`)

  const dbCats = await prisma.category.findMany({ select: { id: true, slug: true } })
  const catMap = Object.fromEntries(dbCats.map(c => [c.slug, c.id]))

  let ok = 0, err = 0

  for (const p of products) {
    try {
      // Precio: si hay precio de oferta menor, ese es el precio real
      const reg = parseFloat(p.regular_price) || 0
      const sale = p.sale_price ? parseFloat(p.sale_price) : null
      const price = sale && sale < reg ? sale : reg
      const comparePrice = sale && sale < reg ? reg : null

      // Stock
      const stock = parseInt(p.stock_quantity) || (p.stock_status === 'instock' ? 10 : 0)

      // Descripción con marca al inicio
      const descParts: string[] = []
      if (p.brand) descParts.push(`**Marca: ${p.brand}**`)
      const body = p.description || p.short_description
      if (body) descParts.push(body)
      const description = descParts.join('\n\n') || null

      // Categorías
      const catSlugs = mapCategoriesToSlugs(p.categories)
      const categoryIds = catSlugs.filter(s => catMap[s]).map(s => catMap[s])

      // Crear o actualizar producto
      const found = await prisma.product.findUnique({ where: { slug: p.slug } })
      let productId: string

      if (!found) {
        const created = await prisma.product.create({
          data: {
            name: p.name,
            slug: p.slug,
            description,
            price,
            comparePrice,
            isActive: true,
            isFeatured: false,
            ...(categoryIds.length ? { categories: { connect: categoryIds.map(id => ({ id })) } } : {}),
            ...(p.sizes.length ? { variants: { create: p.sizes.map(size => ({ size, stock })) } } : {}),
          },
        })
        productId = created.id
      } else {
        await prisma.product.update({
          where: { id: found.id },
          data: { name: p.name, price, comparePrice, description, isActive: true },
        })
        productId = found.id
      }

      // Imágenes: sólo si el producto no tiene ninguna
      const imgCount = await prisma.productImage.count({ where: { productId } })
      if (imgCount === 0 && p.images.length > 0) {
        const slugDir = path.join(IMAGENES_DIR, p.slug)
        const localFiles = fs.existsSync(slugDir)
          ? fs.readdirSync(slugDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort()
          : []

        const imageData: { productId: string; url: string; altText: string; sortOrder: number; isPrimary: boolean }[] = []
        for (let i = 0; i < p.images.length; i++) {
          const localPath = localFiles[i] ? path.join(slugDir, localFiles[i]) : null
          const blobUrl = localPath ? await uploadLocalImage(localPath) : null
          imageData.push({
            productId,
            url: blobUrl ?? p.images[i],
            altText: p.name,
            sortOrder: i,
            isPrimary: i === 0,
          })
        }
        await prisma.productImage.createMany({ data: imageData })
      }

      // Badges → Promotions
      if (p.badges.length > 0) {
        const existingPromos = await prisma.promotion.count({ where: { productId } })
        if (existingPromos === 0) {
          await prisma.promotion.createMany({
            data: p.badges.map((badge, i) => ({
              productId,
              label: badge.toUpperCase(),
              badgeColor: BADGE_COLORS[norm(badge)] ?? '#000000',
              sortOrder: i,
              isActive: true,
            })),
          })
        }
      }

      console.log(`✓ [${++ok}/${products.length}] ${p.slug}`)
    } catch (e) {
      console.error(`✗ ${p.slug}: ${e instanceof Error ? e.message : e}`)
      err++
    }
  }

  console.log('\n━━ Importación completa ━━')
  console.log(`✓ OK: ${ok} | ✗ Errores: ${err}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
