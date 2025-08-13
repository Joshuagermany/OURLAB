"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Post {
  id: string
  title: string
  content: string
  author: string
  authorEmail: string
  createdAt: string
  commentCount: number
  viewCount: number
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)


  useEffect(() => {
    // 인증 상태 확인
    fetch('http://localhost:3001/api/auth/status', { credentials: 'include' })
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

    // 게시글 목록 가져오기
    fetch('http://localhost:3001/api/posts', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      setPosts(data.posts || [])
    })
    .catch(err => {
      console.error('게시글 목록 가져오기 실패:', err)
    })
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto px-4 py-8" style={{ maxWidth: '1920px', minWidth: '960px' }}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">커뮤니티</h1>
        {user && (
          <Link href="/community/write">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              새 게시글 작성
            </Button>
          </Link>
        )}
      </div>

      {!user && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              게시글을 작성하려면 <Link href="/login" className="text-blue-600 hover:underline">로그인</Link>이 필요합니다.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">아직 게시글이 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  <Link href={`/community/post/${post.id}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="mb-4 text-gray-700 line-clamp-2">
                  {post.content.length > 100 
                    ? `${post.content.substring(0, 100)}...` 
                    : post.content
                  }
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>조회수 {post.viewCount}</span>
                    <span>댓글 {post.commentCount}</span>
                  </div>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 