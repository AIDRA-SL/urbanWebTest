import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth, isAdminSession } from '@/lib/auth'
import { saveUploadedFile } from '@/lib/upload'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const subfolder = (formData.get('subfolder') as string | null) ?? 'products'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const url = await saveUploadedFile(file, subfolder)
    return NextResponse.json({ url })
  } catch (error) {
    console.error('[upload]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
