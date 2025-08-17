"use client";
import { useState } from "react";
import SearchLabForm from "@/components/SearchLabForm";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 gap-8 items-center">
        <section className="space-y-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">전국 4년제 대학 연구실 리뷰 플랫폼</h1>
          <p className="text-black/70">연구실의 문화, 워라밸, 지도교수 커뮤니케이션 등 실사용자 후기를 바탕으로 더 나은 선택을 도와드립니다.</p>
        </section>

        <section className="mt-4">
          <div className="mx-auto max-w-4xl text-left">
            <h2 className="text-xl font-semibold mb-2">진학하고 싶은 연구실 평가 확인하기</h2>
            <SearchLabForm variant="browse" />
          </div>
        </section>
      </div>
    </div>
  );
}
