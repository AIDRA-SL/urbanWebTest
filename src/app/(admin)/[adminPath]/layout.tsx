import { notFound, redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { auth, isAdminSession } from '@/lib/auth'
import { headers } from 'next/headers'

interface Props {
  children: React.ReactNode
  params: Promise<{ adminPath: string }>
}

export default async function AdminLayout({ children, params }: Props) {
  const { adminPath } = await params

  // Security: if path doesn't match env var, return 404
  if (adminPath !== process.env.ADMIN_PATH) {
    notFound()
  }

  // Login page bypasses the sidebar layout
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const isLoginPage = pathname.includes('/login')

  if (isLoginPage) {
    return <>{children}</>
  }

  const session = await auth.api.getSession({ headers: headersList })
  if (!isAdminSession(session)) {
    redirect(`/${adminPath}/login`)
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar adminPath={adminPath} />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  )
}
