"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, TrendingUp } from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  author: string
  authorEmail: string
  createdAt: string
  viewCount: number
  likeCount: number
  commentCount: number
  isColumn: boolean
  boards: string[]
}

export default function BestPostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // 인증 상태 확인
    fetch('http://localhost:3001/api/auth/status', { credentials: 'include' })
    .then(res => res.json())
    .then(authData => {
      if (authData.authenticated) {
        setUser(authData.user)
      }
    })
    .catch(err => {
      console.error('인증 상태 확인 실패:', err)
    })

    // 베스트 게시글 가져오기 (조회수 순)
    fetch('http://localhost:3001/api/posts/best', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      setPosts(data.posts || [])
      setLoading(false)
    })
    .catch(err => {
      console.error('베스트 게시글 가져오기 실패:', err)
      setLoading(false)
    })
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
      <div className="mb-6">
        <Link href="/community">
          <Button variant="outline" className="mb-4 hover:bg-gray-100">
            ← 커뮤니티로 돌아가기
          </Button>
        </Link>
      </div>

      {/* 베스트 게시글 헤더 */}
      <Card className="mb-8 w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            베스트 게시글
          </CardTitle>
          <p className="text-gray-600">조회수 순으로 정렬된 인기 게시글입니다</p>
        </CardHeader>
      </Card>

      {/* 광고 배너 */}
      <div className="mb-8 w-full">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-6 text-center text-white">
          <div className="text-lg font-semibold mb-2">광고 공간</div>
          <div className="text-sm opacity-90">서비스 런칭 후 광고가 표시됩니다</div>
        </div>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">아직 베스트 게시글이 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post, index) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow w-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <CardTitle className="text-lg">
                    <Link href={`/community/post/${post.id}`} className="hover:text-blue-600 flex items-center gap-2">
                      {post.isColumn && (
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      )}
                      {post.title}
                    </Link>
                  </CardTitle>
                </div>
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
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      조회수 {post.viewCount}
                    </span>
                    <span>댓글 {post.commentCount}</span>
                    <span>좋아요 {post.likeCount}</span>
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