"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface User {
  id: string
  displayName: string
  email: string
  picture: string
  provider: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 사용자 정보 가져오기
    fetch('http://localhost:3001/api/user', {
      credentials: 'include'
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('인증되지 않은 사용자')
      }
      return res.json()
    })
    .then(data => {
      setUser(data.user)
      setLoading(false)
    })
    .catch(err => {
      console.error('사용자 정보 가져오기 실패:', err)
      // 인증되지 않은 경우 로그인 페이지로 리다이렉트
      window.location.href = '/login'
    })
  }, [])

  const handleLogout = () => {
    fetch('http://localhost:3001/auth/logout', {
      credentials: 'include'
    })
    .then(() => {
      // 홈페이지로 이동 후 새로고침
      window.location.href = '/';
      setTimeout(() => {
        window.location.reload();
      }, 100);
    })
    .catch(err => {
      console.error('로그아웃 실패:', err)
      // 오류가 발생해도 홈페이지로 이동 후 새로고침
      window.location.href = '/';
      setTimeout(() => {
        window.location.reload();
      }, 100);
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div>로그인이 필요합니다.</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>프로필</CardTitle>
          <CardDescription>
            OURLAB 계정 정보
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center">
            {user.picture && (
              <img 
                src={user.picture} 
                alt={user.displayName}
                className="w-24 h-24 rounded-full"
              />
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">이름</label>
              <p className="mt-1 text-lg">{user.displayName}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">이메일</label>
              <p className="mt-1 text-lg">{user.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">계정 ID</label>
              <p className="mt-1 text-sm text-gray-500">{user.id}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">로그인 방식</label>
              <p className="mt-1 text-sm text-gray-500 capitalize">
                {user.provider === 'google' ? 'Google' : user.provider === 'naver' ? '네이버' : user.provider}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="hover:bg-gray-100"
            >
              로그아웃
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 