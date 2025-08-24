"use client";
import Link from "next/link";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="bg-white rounded-lg p-6 border border-gray-100" style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <h1 className="text-2xl font-semibold mb-6">회원가입</h1>
        

        
        {/* 소셜 로그인 버튼들 */}
        <div className="mb-6">
          <SocialLoginButtons />
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">이미 계정이 있으신가요?</p>
          <Link href="/login" className="text-sm text-blue-600 hover:underline">로그인하기</Link>
        </div>
      </div>
    </div>
  );
}

