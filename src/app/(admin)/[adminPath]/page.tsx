import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ adminPath: string }>
}

export default async function AdminRoot({ params }: Props) {
  const { adminPath } = await params
  redirect(`/${adminPath}/analytics`)
}
