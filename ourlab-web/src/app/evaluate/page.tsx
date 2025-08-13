"use client";
import SearchLabForm from "@/components/SearchLabForm";

export default function EvaluatePage() {
  return (
    <div className="mx-auto px-4 py-10" style={{ maxWidth: '1920px', minWidth: '960px' }}>
      <h1 className="text-2xl font-semibold mb-4">우리 연구실 평가하기</h1>
      <div className="w-full">
        <SearchLabForm variant="write" />
      </div>
    </div>
  );
} 