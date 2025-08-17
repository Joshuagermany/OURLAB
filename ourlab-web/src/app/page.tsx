"use client";
import { useState } from "react";
import SearchLabForm from "@/components/SearchLabForm";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 gap-8 items-center">
        {/* 메인 배너 */}
        <section 
          className="relative overflow-hidden rounded-2xl p-12 text-center min-h-[250px] flex items-center justify-center"
          style={{
            backgroundImage: "url('/banner-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* 어두운 오버레이 */}
          <div className="absolute inset-0 bg-black/40"></div>
          
          {/* 텍스트 콘텐츠 */}
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
              전국 대학교 연구실 리뷰 1위 '아워랩'
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              연구실의 문화, 워라밸, 지도교수 커뮤니케이션 등 실사용자 후기로 더 나은 선택을 도와드립니다.
            </p>
          </div>
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
