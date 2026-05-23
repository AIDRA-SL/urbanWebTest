import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth, isAdminSession } from '@/lib/auth'
import { saveUploadedFile } from '@/lib/upload'

import { saveUploadedVideo } from '@/lib/upload'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024   // 10 MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024  // 200 MB

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const subfolder = (formData.get('subfolder') as string | null) ?? 'products'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'Image too large (max 10MB)' }, { status: 400 })
    }
    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: 'Video too large (max 200MB)' }, { status: 400 })
    }

    const url = isVideo
      ? await saveUploadedVideo(file, subfolder)
      : await saveUploadedFile(file, subfolder)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('[upload]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
