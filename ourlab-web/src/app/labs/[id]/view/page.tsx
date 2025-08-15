"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, ExternalLink, MessageSquare, Check } from "lucide-react";

interface Lab {
  id: number;
  name: string;
  professor_name: string;
  homepage_url: string;
  university_name: string;
  department_name: string;
}

interface ReviewSummary {
  review_count: number;
  most_common_atmosphere: string | null;
  most_common_phd_salary: string | null;
  most_common_master_salary: string | null;
  most_common_undergraduate_salary: string | null;
  most_common_work_intensity: string | null;
  most_common_commute_importance: string | null;
  most_common_weekend_work: string | null;
  most_common_overtime_frequency: string | null;
  avg_career_corporate: number | null;
  avg_career_professor: number | null;
  avg_career_others: number | null;
  most_common_idea_acceptance: string | null;
  most_common_mentoring_style: string | null;
  most_common_research_guidance: string | null;
}

interface Review {
  id: number;
  user_name: string;
  atmosphere_level: string;
  phd_salary: string;
  master_salary: string;
  undergraduate_salary: string;
  work_intensity: string;
  commute_importance: string;
  weekend_work: string;
  overtime_frequency: string;
  career_corporate: number;
  career_professor: number;
  career_others: number;
  idea_acceptance: string;
  mentoring_style: string;
  research_guidance: string;
  pros_cons: string;
  created_at: string;
}

export default function LabViewPage() {
  const params = useParams();
  const router = useRouter();
  const labId = params.id as string;

  const [lab, setLab] = useState<Lab | null>(null);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLabData();
    fetchReviews();
  }, [labId]);

  const fetchLabData = async () => {
    try {
      const response = await fetch(`/api/labs/${labId}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("연구실 정보를 불러올 수 없습니다.");
      }
      const data = await response.json();
      setLab(data.lab);
      setReviewSummary(data.reviewSummary);
    } catch (error) {
      setError(error instanceof Error ? error.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/labs/${labId}/reviews`, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("리뷰 목록 조회 오류:", error);
    }
  };

  const renderValue = (value: string | number | null) => {
    if (value === null || value === undefined) return <span className="text-gray-400">평가 없음</span>;
    return <span className="text-sm font-medium">{value}</span>;
  };

  const renderReviewCard = (review: Review) => {
    return (
      <Card key={review.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{review.user_name}</h4>
              <p className="text-sm text-gray-500">
                {new Date(review.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-600">연구실 분위기:</span>
              <div className="mt-1">{renderValue(review.atmosphere_level)}</div>
            </div>

            <div>
              <span className="text-gray-600">박사생 인건비:</span>
              <div className="mt-1">{renderValue(review.phd_salary)}</div>
            </div>
            <div>
              <span className="text-gray-600">석사생 인건비:</span>
              <div className="mt-1">{renderValue(review.master_salary)}</div>
            </div>
            <div>
              <span className="text-gray-600">주말 근무:</span>
              <div className="mt-1">{renderValue(review.weekend_work)}</div>
            </div>
            <div>
              <span className="text-gray-600">업무 강도:</span>
              <div className="mt-1">{renderValue(review.work_intensity)}</div>
            </div>
            <div>
              <span className="text-gray-600">출퇴근 시간:</span>
              <div className="mt-1">{renderValue(review.commute_importance)}</div>
            </div>
            <div>
              <span className="text-gray-600">야근 빈도:</span>
              <div className="mt-1">{renderValue(review.overtime_frequency)}</div>
            </div>
            <div>
              <span className="text-gray-600">선배 진로 (대기업/교수/기타):</span>
              <div className="mt-1">{renderValue(`${review.career_corporate}/${review.career_professor}/${review.career_others}명`)}</div>
            </div>
            <div>
              <span className="text-gray-600">아이디어 수용도:</span>
              <div className="mt-1">{renderValue(review.idea_acceptance)}</div>
            </div>
            <div>
              <span className="text-gray-600">멘토링 스타일:</span>
              <div className="mt-1">{renderValue(review.mentoring_style)}</div>
            </div>
            <div>
              <span className="text-gray-600">연구 지도:</span>
              <div className="mt-1">{renderValue(review.research_guidance)}</div>
            </div>

          </div>
          {review.pros_cons && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{review.pros_cons}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="mx-auto" style={{ maxWidth: '1920px', minWidth: '960px' }}>
        <div className="px-4 py-8">
          <div className="text-center">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error || !lab) {
    return (
      <div className="mx-auto" style={{ maxWidth: '1920px', minWidth: '960px' }}>
        <div className="px-4 py-8">
          <div className="text-center text-red-600">
            {error || "연구실을 찾을 수 없습니다."}
          </div>
          <div className="text-center mt-4">
            <Button onClick={() => router.back()}>뒤로 가기</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto relative" style={{ maxWidth: '1920px', minWidth: '960px' }}>
      <div className="px-4 py-8">
        {/* 뒤로 가기 버튼 */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로 가기
        </Button>

        {/* 연구실 기본 정보 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">{lab.name}</CardTitle>
                <p className="text-gray-600 mb-1">
                  {lab.university_name} {lab.department_name}
                </p>
                {lab.professor_name && (
                  <p className="text-gray-600">교수님: {lab.professor_name}</p>
                )}
              </div>
              {lab.homepage_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(lab.homepage_url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  홈페이지
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* 평균 점수 요약 */}
        {reviewSummary && reviewSummary.review_count > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                전체 평가 요약 ({reviewSummary.review_count}개 리뷰)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* 평균 별점 */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold">3.00</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= 3
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({reviewSummary.review_count}개)</span>
                </div>
                
                {/* 별점 분포 */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-8">★ {rating}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${rating === 5 ? 28 : rating === 4 ? 17 : rating === 3 ? 11 : rating === 2 ? 17 : 28}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">
                        {rating === 5 ? 28 : rating === 4 ? 17 : rating === 3 ? 11 : rating === 2 ? 17 : 28}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 카테고리별 평가 */}
              <div className="space-y-4">
                {/* 연구실 분위기 */}
                <div className="flex items-start gap-4">
                  <h4 className="text-sm font-medium text-gray-700 flex-shrink-0">연구실 분위기</h4>
                  <div className="space-y-2 flex-1">
                    {['매우 엄격함', '엄격한 편', '무난함', '프리함', '매우 프리함'].map((option) => {
                      const percentage = option === '프리함' ? 53 : option === '무난함' ? 47 : 0;
                      const isSelected = option === '프리함';
                      return (
                        <div key={option} className="relative">
                          <div 
                            className={`px-3 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 ${
                              isSelected 
                                ? 'bg-orange-500 w-20' 
                                : 'bg-gray-700 w-16'
                            }`}
                          >
                            <span className="block truncate">{option}</span>
                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 업무 강도 */}
                <div className="flex items-start gap-4">
                  <h4 className="text-sm font-medium text-gray-700 flex-shrink-0">업무 강도</h4>
                  <div className="space-y-2 flex-1">
                    {['강한 편', '무난한 편', '여유로운 편'].map((option) => {
                      const percentage = option === '무난한 편' ? 71 : option === '강한 편' ? 29 : 0;
                      const isSelected = option === '무난한 편';
                      return (
                        <div key={option} className="relative">
                          <div 
                            className={`px-3 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 ${
                              isSelected 
                                ? 'bg-green-500 w-20' 
                                : 'bg-gray-700 w-16'
                            }`}
                          >
                            <span className="block truncate">{option}</span>
                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 멘토링 스타일 */}
                <div className="flex items-start gap-4">
                  <h4 className="text-sm font-medium text-gray-700 flex-shrink-0">멘토링 스타일</h4>
                  <div className="space-y-2 flex-1">
                    {['매우 친절하고 배려심 많음', '친절하신 편', '중립적', '까다로운 편', '비협조적'].map((option) => {
                      const percentage = option === '중립적' ? 41 : option === '친절하신 편' ? 24 : option === '까다로운 편' ? 35 : 0;
                      const isSelected = option === '중립적';
                      return (
                        <div key={option} className="relative">
                          <div 
                            className={`px-3 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 ${
                              isSelected 
                                ? 'bg-blue-500 w-20' 
                                : 'bg-gray-700 w-16'
                            }`}
                          >
                            <span className="block truncate">{option}</span>
                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 주말 근무 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">주말 근무</h4>
                  <div className="space-y-1">
                    {['자주 있음', '종종 있음', '거의 없음'].map((option) => (
                      <div key={option} className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-1">
                          {option}
                          {option === '거의 없음' && <Check className="w-3 h-3 text-green-500" />}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 야근 빈도 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">야근 빈도</h4>
                  <div className="space-y-1">
                    {['자주 있음', '종종 있음', '거의 없음'].map((option) => (
                      <div key={option} className="flex items-center justify-between">
                        <span className="text-sm">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}



        {/* 리뷰 목록 */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            이 연구실 후기
          </h3>
          
          {reviews.length === 0 ? (
            <Card className="min-h-[200px] flex items-center justify-center">
              <CardContent className="text-center text-gray-500">
                <div>
                  <p className="text-lg">아직 리뷰가 없습니다.</p>
                  <p className="text-sm mt-2 text-gray-400">첫 번째 리뷰를 작성해보세요!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div>{reviews.map(renderReviewCard)}</div>
          )}
        </div>

        {/* 평가 작성 버튼 */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push(`/labs/${labId}/evaluate`)}
            className="px-8 py-3 text-lg hover:underline"
            size="lg"
          >
            이 연구실 평가하기
          </Button>
        </div>


      </div>
    </div>
  );
} 