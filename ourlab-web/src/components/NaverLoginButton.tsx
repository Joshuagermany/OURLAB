"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface User {
  id: string
  displayName: string
  email: string
  picture: string
  provider: string
}

export default function NaverLoginButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3001/api/auth/status', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.authenticated && data.user?.provider === 'naver') { 
        setUser(data.user) 
      }
      setLoading(false)
    })
    .catch(err => { 
      console.error('인증 상태 확인 실패:', err); 
      setLoading(false) 
    })
  }, [])

  const handleLogin = () => { 
    window.location.href = 'http://localhost:3001/auth/naver' 
  }

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
          <div className="text-sm">안녕하세요, {user.displayName}님!</div>
        </div>
        <Button onClick={handleLogout} variant="outline" size="sm" className="hover:bg-gray-100">로그아웃</Button>
      </div>
    )
  }

  return (
             <div className="bg-white rounded-lg" style={{
           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(34, 197, 94, 0.1)'
         }}>
           <Button onClick={handleLogin} className="w-full bg-green-500 hover:bg-green-600 border-0 shadow-none px-6 py-4 text-white" style={{ minWidth: '320px', height: '56px' }}>
              <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="white">
          <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"/>
        </svg>
      네이버로 시작하기
      </Button>
    </div>
  )
} 