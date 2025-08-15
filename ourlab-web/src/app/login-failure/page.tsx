"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function LoginFailurePage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-red-600">로그인 실패</CardTitle>
          <CardDescription>
            소셜 로그인 중 문제가 발생했습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            <p>다음 중 하나의 이유로 로그인이 실패했을 수 있습니다:</p>
            <ul className="mt-2 text-left list-disc list-inside space-y-1">
              <li>인증 과정이 취소되었습니다</li>
              <li>네트워크 연결에 문제가 있습니다</li>
              <li>OAuth 설정에 문제가 있습니다</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/login">
              <Button className="w-full">다시 로그인하기</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full hover:bg-gray-100">홈으로 돌아가기</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 