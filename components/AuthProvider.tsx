'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { supabase } from '@/lib/supabase'

type UserRole = 'admin' | 'user' | null

type AuthContextType = {
  loading: boolean
  isLoggedIn: boolean
  email: string
  role: UserRole
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  loading: true,
  isLoggedIn: false,
  email: '',
  role: null,
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>(null)

  const refreshProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setEmail('')
        setRole(null)
        setLoading(false)
        return
      }

      setEmail(session.user.email || '')

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()

      if (error) {
        console.error('load profile error:', error)
        setRole(null)
        setLoading(false)
        return
      }

      setRole((profile?.role as UserRole) || 'user')
    } catch (error) {
      console.error('AuthProvider error:', error)
      setEmail('')
      setRole(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshProfile()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refreshProfile()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      loading,
      isLoggedIn: !!email,
      email,
      role,
      refreshProfile,
    }),
    [loading, email, role]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}