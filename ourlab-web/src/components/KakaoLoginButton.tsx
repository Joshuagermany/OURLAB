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

export default function KakaoLoginButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3001/api/auth/status', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.authenticated && data.user?.provider === 'kakao') { 
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
    window.location.href = 'http://localhost:3001/auth/kakao' 
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
           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(254, 215, 0, 0.1)'
         }}>
           <Button onClick={handleLogin} className="w-full bg-yellow-400 hover:bg-yellow-500 border-0 shadow-none px-6 py-4 text-black" style={{ minWidth: '320px', height: '56px' }}>
                       <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="black">
          <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
        </svg>
        카카오로 시작하기
      </Button>
    </div>
  )
} 