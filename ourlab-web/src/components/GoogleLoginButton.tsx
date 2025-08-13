"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface User {
  id: string
  displayName: string
  email: string
  picture: string
}

export default function GoogleLoginButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 인증 상태 확인
    fetch('http://localhost:3001/api/auth/status', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data.authenticated) {
        setUser(data.user)
      }
      setLoading(false)
    })
    .catch(err => {
      console.error('인증 상태 확인 실패:', err)
      setLoading(false)
    })
  }, [])

  const handleLogin = () => {
    // Google OAuth 로그인 페이지로 리다이렉트
    window.location.href = 'http://localhost:3001/auth/google'
  }

  const handleLogout = () => {
    fetch('http://localhost:3001/auth/logout', {
      credentials: 'include'
    })
    .then(() => {
      setUser(null)
      window.location.href = '/'
    })
    .catch(err => {
      console.error('로그아웃 실패:', err)
    })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {user.picture && (
            <img 
              src={user.picture} 
              alt={user.displayName}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="text-sm">
            안녕하세요, {user.displayName}님!
          </div>
        </div>
        <Button 
          onClick={handleLogout}
          variant="outline"
          size="sm"
        >
          로그아웃
        </Button>
      </div>
    )
  }

  return (
    <Button 
      onClick={handleLogin}
      className="w-full"
    >
      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Google로 로그인
    </Button>
  )
} 