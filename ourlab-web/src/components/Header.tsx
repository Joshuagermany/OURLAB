import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-black/10 bg-white py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl md:text-2xl font-bold text-black">
          OURLAB.
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-black hover:underline">
            로그인
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-black/10 bg-white px-3 py-1.5 text-black hover:bg-gray-100"
          >
            회원가입
          </Link>
        </div>
      </div>
    </header>
  );
}

