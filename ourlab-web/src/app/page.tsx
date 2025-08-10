"use client";
import { useState } from "react";
import SearchLabForm from "@/components/SearchLabForm";

export default function Home() {
  const [tab, setTab] = useState<"write" | "reviews" | "search" | "community">("write");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 gap-8 items-center">
        <section className="space-y-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">전국 4년제 대학 연구실 리뷰 플랫폼</h1>
          <p className="text-black/70">연구실의 문화, 워라밸, 지도교수 커뮤니케이션 등 실사용자 후기를 바탕으로 더 나은 선택을 도와드립니다.</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setTab("write")} className={`rounded-lg border border-black/10 px-4 py-3 hover:bg-gray-100 ${tab === "write" ? "bg-gray-100 text-black" : "text-black"}`}>우리 연구실 평가하기</button>
            <button onClick={() => setTab("reviews")} className={`rounded-lg border border-black/10 px-4 py-3 hover:bg-gray-100 ${tab === "reviews" ? "bg-gray-100 text-black" : "text-black"}`}>연구실 평가 확인하기</button>
            <button onClick={() => setTab("search")} className={`rounded-lg border border-black/10 px-4 py-3 hover:bg-gray-100 ${tab === "search" ? "bg-gray-100 text-black" : "text-black"}`}>관심분야 연구실 검색하기</button>
            <button onClick={() => setTab("community")} className={`rounded-lg border border-black/10 px-4 py-3 hover:bg-gray-100 ${tab === "community" ? "bg-gray-100 text-black" : "text-black"}`}>대학원생 커뮤니티</button>
          </div>
        </section>

        <section className="mt-4">
          {tab === "write" && (
            <div className="mx-auto max-w-4xl text-left">
              <h2 className="text-xl font-semibold mb-2">우리 연구실 평가하기</h2>
              <SearchLabForm variant="write" />
            </div>
          )}
          {tab === "reviews" && (
            <div className="mx-auto max-w-4xl text-left">
              <h2 className="text-xl font-semibold mb-2">연구실 평가 확인하기</h2>
              <SearchLabForm variant="browse" />
            </div>
          )}
          {tab === "search" && (
            <div className="mx-auto max-w-4xl text-left">
              <h2 className="text-xl font-semibold mb-2">관심분야 연구실 검색하기</h2>
              <p className="text-black/70">연구분야 검색은 추후 연결됩니다.</p>
            </div>
          )}
          {tab === "community" && (
            <div className="mx-auto max-w-4xl text-left">
              <h2 className="text-xl font-semibold mb-2">대학원생 커뮤니티</h2>
              <p className="text-black/70">커뮤니티는 추후 연결됩니다.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
