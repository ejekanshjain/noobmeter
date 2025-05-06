import { getAuthSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Login } from './login'

export default async function LoginPage() {
  const session = await getAuthSession()

  if (session?.user) redirect('/dashboard')

  return <Login />
}
