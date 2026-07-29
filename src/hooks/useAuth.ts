import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface AuthStatus {
  authenticated: boolean
  isAdmin: boolean
  userId?: string
  loading: boolean
  error?: string
}

export function useAuth(requireAdmin = false) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    authenticated: false,
    isAdmin: false,
    loading: true
  })
  const router = useRouter()

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth/status', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setAuthStatus({
          authenticated: data.authenticated,
          isAdmin: data.isAdmin,
          userId: data.userId,
          loading: false
        })

        // Redirect if authentication is required but not authenticated
        if (requireAdmin && (!data.authenticated || !data.isAdmin)) {
          router.push('/admin')
        }
      } else {
        setAuthStatus({
          authenticated: false,
          isAdmin: false,
          loading: false
        })

        // Redirect if authentication is required
        if (requireAdmin) {
          router.push('/admin')
        }
      }
    } catch (error) {
      console.error('Auth status check failed:', error)
      setAuthStatus({
        authenticated: false,
        isAdmin: false,
        loading: false,
        error: 'Authentication check failed'
      })

      // Redirect on error if authentication is required
      if (requireAdmin) {
        router.push('/admin')
      }
    }
  }, [requireAdmin, router])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  const refreshAuth = async () => {
    setAuthStatus(prev => ({ ...prev, loading: true }))
    await checkAuthStatus()
  }

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      // Always clear local auth state and redirect
      setAuthStatus({
        authenticated: false,
        isAdmin: false,
        loading: false
      })
      router.push('/admin')
    }
  }

  return {
    ...authStatus,
    refreshAuth,
    logout
  }
}