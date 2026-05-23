import { put, del } from '@vercel/blob'
import { nanoid } from 'nanoid'
import sharp from 'sharp'

export async function saveUploadedFile(
  file: File,
  subfolder = 'products'
): Promise<string> {
  const filename = `${nanoid()}.webp`
  const buffer = Buffer.from(await file.arrayBuffer())

  const processed = await sharp(buffer)
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()

  const blob = await put(`${subfolder}/${filename}`, processed, {
    access: 'public',
    contentType: 'image/webp',
  })

  return blob.url
}

export async function saveUploadedVideo(
  file: File,
  subfolder = 'videos'
): Promise<string> {
  const ext = file.type === 'video/webm' ? 'webm' : file.type === 'video/quicktime' ? 'mov' : 'mp4'
  const filename = `${nanoid()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const blob = await put(`${subfolder}/${filename}`, buffer, {
    access: 'public',
    contentType: file.type,
  })

  return blob.url
}

export async function deleteUploadedFile(url: string): Promise<void> {
  try {
    if (url.includes('blob.vercel-storage.com')) {
      await del(url)
    }
  } catch {
    // ignore
  }
}
