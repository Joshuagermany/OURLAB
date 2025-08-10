"use client";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">회원가입</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm mb-1">이메일</label>
          <input type="email" className="w-full rounded-md border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
        </div>
        <div>
          <label className="block text-sm mb-1">비밀번호</label>
          <input type="password" className="w-full rounded-md border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
        </div>
        <div>
          <label className="block text-sm mb-1">비밀번호 확인</label>
          <input type="password" className="w-full rounded-md border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <button type="submit" className="rounded-md border border-black/10 px-4 py-2 text-black hover:bg-gray-100">회원가입</button>
          <Link href="/login" className="text-sm text-black hover:underline">로그인</Link>
        </div>
      </form>
    </div>
  );
}

