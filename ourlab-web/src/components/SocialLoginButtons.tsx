"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import GoogleLoginButton from "./GoogleLoginButton"
import NaverLoginButton from "./NaverLoginButton"
import KakaoLoginButton from "./KakaoLoginButton"

interface User {
  id: string
  displayName: string
  email: string
  picture: string
  provider: string
}

export default function SocialLoginButtons() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3001/api/auth/status', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.authenticated) { 
        setUser(data.user) 
      }
      setLoading(false)
    })
    .catch(err => { 
      console.error('인증 상태 확인 실패:', err); 
      setLoading(false) 
    })
  }, [])

  const handleLogout = () => {
    fetch('http://localhost:3001/auth/logout', { credentials: 'include' })
    .then(() => { 
      setUser(null); 
      // 홈페이지로 이동 후 새로고침
      window.location.href = '/';
      setTimeout(() => {
        window.location.reload();
      }, 100);
    })
    .catch(err => { 
      console.error('로그아웃 실패:', err) 
      // 오류가 발생해도 홈페이지로 이동 후 새로고침
      setUser(null);
      window.location.href = '/';
      setTimeout(() => {
        window.location.reload();
      }, 100);
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
            <img src={user.picture} alt={user.displayName} className="w-8 h-8 rounded-full" />
          )}
          <div className="text-sm">
            안녕하세요, {user.displayName}님! ({user.provider})
          </div>
        </div>
        <Button onClick={handleLogout} variant="outline" size="sm" className="hover:bg-gray-100">로그아웃</Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <GoogleLoginButton />
      <NaverLoginButton />
      <KakaoLoginButton />
    </div>
  )
} 