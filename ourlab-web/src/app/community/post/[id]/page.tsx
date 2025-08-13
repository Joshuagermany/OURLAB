"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
  viewCount: number
}

interface Comment {
  id: string
  content: string
  author: string
  authorEmail: string
  createdAt: string
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [user, setUser] = useState<any>(null)


  useEffect(() => {
    // 인증 상태 확인
    fetch('http://localhost:3001/api/auth/status', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.authenticated) {
        setUser(data.user)
      }
    })
    .catch(err => {
      console.error('인증 상태 확인 실패:', err)
    })

    // 게시글 상세 정보 가져오기
    fetch(`http://localhost:3001/api/posts/${postId}`, { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.post) {
        setPost(data.post)
      } else {
        alert('게시글을 찾을 수 없습니다.')
        router.push('/community')
      }
      setLoading(false)
    })
    .catch(err => {
      console.error('게시글 가져오기 실패:', err)
      setLoading(false)
    })

    // 댓글 목록 가져오기
    fetch(`http://localhost:3001/api/posts/${postId}/comments`, { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      setComments(data.comments || [])
    })
    .catch(err => {
      console.error('댓글 목록 가져오기 실패:', err)
    })
  }, [postId, router])

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    setCommentLoading(true)

    try {
      const response = await fetch(`http://localhost:3001/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newComment.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [...prev, data.comment])
        setNewComment("")
      } else {
        const error = await response.json()
        alert(`댓글 작성 실패: ${error.message}`)
      }
    } catch (err) {
      console.error('댓글 작성 실패:', err)
      alert('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setCommentLoading(false)
    }
  }

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

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">게시글을 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="mx-auto px-4 py-8" style={{ maxWidth: '1920px', minWidth: '960px' }}>
      <div className="mb-6">
        <Link href="/community">
          <Button variant="outline" className="mb-4">
            ← 커뮤니티로 돌아가기
          </Button>
        </Link>
      </div>

      <Card className="mb-8 w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>작성자: {post.author}</span>
            <div className="flex items-center gap-4">
              <span>조회수 {post.viewCount}</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {post.content}
          </div>

        </CardContent>
      </Card>

      {user ? (
        <Card className="mb-8 w-full">
          <CardHeader>
            <CardTitle className="text-lg">댓글 작성</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCommentSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="댓글을 입력하세요"
                required
              />
              <div className="mt-4 flex justify-end">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={commentLoading}
                >
                  {commentLoading ? '작성 중...' : '댓글 작성'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
              ) : (
        <Card className="mb-8 w-full">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              댓글을 작성하려면 <Link href="/login" className="text-blue-600 hover:underline">로그인</Link>이 필요합니다.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">댓글 ({comments.length})</h3>
        
        {comments.length === 0 ? (
          <Card className="w-full">
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">아직 댓글이 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="w-full">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900">{comment.author}</span>
                  <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                </div>
                <div className="whitespace-pre-wrap text-gray-700">
                  {comment.content}
                </div>

              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 