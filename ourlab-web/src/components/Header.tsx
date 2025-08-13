"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  displayName: string;
  email: string;
  picture: string;
  provider: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:3001/api/auth/status', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.authenticated) {
        setUser(data.user);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error('인증 상태 확인 실패:', err);
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    fetch('http://localhost:3001/auth/logout', { credentials: 'include' })
    .then(() => {
      setUser(null);
      // 홈페이지로 이동 후 새로고침
      window.location.href = '/';
      setTimeout(() => {
        window.location.reload();
      }, 100);
    })
    .catch(err => {
      console.error('로그아웃 실패:', err);
      // 오류가 발생해도 홈페이지로 이동 후 새로고침
      setUser(null);
      window.location.href = '/';
      setTimeout(() => {
        window.location.reload();
      }, 100);
    });
  };

  return (
    <header className="sticky top-0 z-10 w-full border-b border-black/10 bg-white py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl md:text-2xl font-bold text-black">
            OURLAB.
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/community" className="text-black hover:text-blue-600 transition-colors">
              커뮤니티
            </Link>
            <Link href="/evaluate" className="text-black hover:text-blue-600 transition-colors">
              우리 연구실 평가하기
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <>
                  <span 
                    className="text-black hover:underline cursor-pointer"
                    onClick={() => {
                      router.push('/profile');
                    }}
                  >
                    {user.displayName}님
                  </span>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="rounded-md border border-black/10 bg-white px-3 py-1.5 text-black hover:bg-gray-100"
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-black hover:underline">
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-md border border-black/10 bg-white px-3 py-1.5 text-black hover:bg-gray-100"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

