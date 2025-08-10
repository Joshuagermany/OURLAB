"use client";
import SearchLabForm from "@/components/SearchLabForm";

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">연구실 평가 확인하기</h1>
      <SearchLabForm variant="browse" />
    </div>
  );
}

