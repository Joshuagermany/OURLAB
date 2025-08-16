"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

export default function WritePostPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [selectedBoards, setSelectedBoards] = useState<string[]>([])
  const [isColumn, setIsColumn] = useState(false)
  const router = useRouter()

  // 게시판 목록
  const boards = {
    topRow: ['자유 게시판', '학부 인턴 게시판', '대학원 입시', '고민 게시판'],
    bottomRow: ['반도체 광장', 'AI・컴공 광장', '기계 광장', '바이오 광장', '화학・재료 광장']
  }

  // 게시판 선택/해제 함수
  const toggleBoard = (board: string) => {
    setSelectedBoards(prev => {
      if (prev.includes(board)) {
        return prev.filter(b => b !== board)
      } else {
        if (prev.length >= 3) {
          alert('최대 3개까지만 선택할 수 있습니다.')
          return prev
        }
        return [...prev, board]
      }
    })
  }

  useEffect(() => {
    // 인증 상태 확인
    fetch('http://localhost:3001/api/auth/status', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.authenticated) {
        setUser(data.user)
      } else {
        // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
        router.push('/login')
      }
    })
    .catch(err => {
      console.error('인증 상태 확인 실패:', err)
      router.push('/login')
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    if (selectedBoards.length === 0) {
      alert('최소 1개의 게시판을 선택해주세요.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          isColumn: isColumn,
          selectedBoards: selectedBoards
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/community/post/${data.post.id}`)
      } else {
        const error = await response.json()
        alert(`게시글 작성 실패: ${error.message}`)
      }
    } catch (err) {
      console.error('게시글 작성 실패:', err)
      alert('게시글 작성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto px-4 py-8" style={{ maxWidth: '1920px', minWidth: '960px' }}>
      <Card className="min-h-[600px]">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            새 게시글 작성
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 게시판 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                게시판 선택 <span className="text-red-500">*</span>
                <span className="text-sm text-gray-500 ml-2">(최대 3개까지 선택 가능)</span>
              </label>
              <div className="space-y-3">
                {/* 상단 줄 */}
                <div className="grid grid-cols-4 gap-2">
                  {boards.topRow.map((board) => (
                    <button
                      key={board}
                      type="button"
                      onClick={() => toggleBoard(board)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedBoards.includes(board)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {board}
                    </button>
                  ))}
                </div>
                
                {/* 하단 줄 */}
                <div className="grid grid-cols-5 gap-2">
                  {boards.bottomRow.map((board) => (
                    <button
                      key={board}
                      type="button"
                      onClick={() => toggleBoard(board)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedBoards.includes(board)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {board}
                    </button>
                  ))}
                </div>
              </div>
              {selectedBoards.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  선택된 게시판: {selectedBoards.join(', ')}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="제목을 입력하세요"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                내용
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={20}
                placeholder="내용을 입력하세요"
                required
              />
            </div>

            {/* 칼럼 등록 체크박스 */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isColumn"
                checked={isColumn}
                onChange={(e) => setIsColumn(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="isColumn" className="text-sm text-gray-700">
                칼럼 등록
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="hover:bg-gray-100"
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? '작성 중...' : '게시글 작성'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 