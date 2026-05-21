import fs from 'fs/promises'
import path from 'path'
import { nanoid } from 'nanoid'
import sharp from 'sharp'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function saveUploadedFile(
  file: File,
  subfolder = 'products'
): Promise<string> {
  const dir = path.join(UPLOAD_DIR, subfolder)
  await fs.mkdir(dir, { recursive: true })

  const filename = `${nanoid()}.webp`
  const filepath = path.join(dir, filename)
  const buffer = Buffer.from(await file.arrayBuffer())

  await sharp(buffer)
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(filepath)

  return `/uploads/${subfolder}/${filename}`
}

export async function deleteUploadedFile(url: string): Promise<void> {
  try {
    const relative = url.startsWith('/') ? url.slice(1) : url
    const filepath = path.join(process.cwd(), 'public', relative)
    await fs.unlink(filepath)
  } catch {
    // File may not exist, ignore
  }
}
