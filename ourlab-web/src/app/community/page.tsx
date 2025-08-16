"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, BookOpen } from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  author: string
  authorEmail: string
  createdAt: string
  commentCount: number
  viewCount: number
  isColumn: boolean
  boards: string[]
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedBoard, setSelectedBoard] = useState<string>('자유 게시판')

  // 게시판 목록
  const boards = {
    topRow: ['자유 게시판', '학부 인턴 게시판', '대학원 입시', '고민 게시판'],
    bottomRow: ['반도체 광장', 'AI・컴공 광장', '기계 광장', '바이오 광장', '화학・재료 광장']
  }


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
  }, [])

  useEffect(() => {
    // 게시글 목록 가져오기
    fetch(`http://localhost:3001/api/posts?board=${encodeURIComponent(selectedBoard)}`, { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      setPosts(data.posts || [])
    })
    .catch(err => {
      console.error('게시글 목록 가져오기 실패:', err)
    })
  }, [selectedBoard])

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

      {/* 게시판 선택 UI */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            커뮤니티 홈
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 상단 줄 */}
            <div className="grid grid-cols-4 gap-3">
              {boards.topRow.map((board) => (
                <button
                  key={board}
                  onClick={() => setSelectedBoard(board)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedBoard === board
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {board}
                </button>
              ))}
            </div>
            
            {/* 하단 줄 */}
            <div className="grid grid-cols-5 gap-3">
              {boards.bottomRow.map((board) => (
                <button
                  key={board}
                  onClick={() => setSelectedBoard(board)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedBoard === board
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {board}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {!user && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              게시글을 작성하려면 <Link href="/login" className="text-blue-600 hover:underline">로그인</Link>이 필요합니다.
            </p>
          </CardContent>
        </Card>
      )}

      {/* 광고 배너 */}
      <div className="mb-8 w-full">
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-center text-white">
          <div className="text-lg font-semibold mb-2">광고 공간</div>
          <div className="text-sm opacity-90">서비스 런칭 후 광고가 표시됩니다</div>
        </div>
      </div>

      {/* 선택된 게시판 표시 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {selectedBoard}
        </h2>
      </div>

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
                  <Link href={`/community/post/${post.id}`} className="hover:text-blue-600 flex items-center gap-2">
                    {post.isColumn && (
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    )}
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