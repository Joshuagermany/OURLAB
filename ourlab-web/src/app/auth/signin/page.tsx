"use client"

import GoogleLoginButton from "@/components/GoogleLoginButton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>OURLAB에 로그인</CardTitle>
          <CardDescription>
            연구실 리뷰를 작성하고 확인하려면 로그인해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleLoginButton />
        </CardContent>
      </Card>
    </div>
  )
} 