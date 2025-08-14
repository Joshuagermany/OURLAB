"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, ExternalLink, MessageSquare, Plus } from "lucide-react";

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
  avg_atmosphere: number | null;
  avg_work_life_balance: number | null;
  avg_professor_communication: number | null;
  avg_research_environment: number | null;
  avg_overall_satisfaction: number | null;
  avg_total_score: number | null;
}

interface Review {
  id: number;
  user_name: string;
  atmosphere: number;
  work_life_balance: number;
  professor_communication: number;
  research_environment: number;
  overall_satisfaction: number;
  comment: string;
  created_at: string;
}

export default function LabDetailPage() {
  const params = useParams();
  const router = useRouter();
  const labId = params.id as string;

  const [lab, setLab] = useState<Lab | null>(null);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchLabData();
    fetchReviews();
    fetchUserData();
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

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/status', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error("사용자 정보 조회 오류:", error);
    }
  };

  const renderStars = (score: number | null) => {
    if (score === null) return <span className="text-gray-400">평가 없음</span>;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= score ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{score.toFixed(1)}</span>
      </div>
    );
  };

  const renderReviewCard = (review: Review) => {
    const totalScore = (
      (review.atmosphere + review.work_life_balance + review.professor_communication + 
       review.research_environment + review.overall_satisfaction) / 5
    ).toFixed(1);

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
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{totalScore}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-600">연구실 분위기:</span>
              <div className="flex items-center gap-1 mt-1">
                {renderStars(review.atmosphere)}
              </div>
            </div>
            <div>
              <span className="text-gray-600">워라밸:</span>
              <div className="flex items-center gap-1 mt-1">
                {renderStars(review.work_life_balance)}
              </div>
            </div>
            <div>
              <span className="text-gray-600">지도교수 커뮤니케이션:</span>
              <div className="flex items-center gap-1 mt-1">
                {renderStars(review.professor_communication)}
              </div>
            </div>
            <div>
              <span className="text-gray-600">연구 환경:</span>
              <div className="flex items-center gap-1 mt-1">
                {renderStars(review.research_environment)}
              </div>
            </div>
          </div>
          {review.comment && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
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
    <div className="mx-auto" style={{ maxWidth: '1920px', minWidth: '960px' }}>
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
                  <p className="text-gray-600">지도교수: {lab.professor_name}</p>
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
                전체 평가 ({reviewSummary.review_count}개 리뷰)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <span className="text-sm text-gray-600">전체 만족도</span>
                  <div className="mt-1">{renderStars(reviewSummary.avg_total_score)}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">연구실 분위기</span>
                  <div className="mt-1">{renderStars(reviewSummary.avg_atmosphere)}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">워라밸</span>
                  <div className="mt-1">{renderStars(reviewSummary.avg_work_life_balance)}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">지도교수 커뮤니케이션</span>
                  <div className="mt-1">{renderStars(reviewSummary.avg_professor_communication)}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">연구 환경</span>
                  <div className="mt-1">{renderStars(reviewSummary.avg_research_environment)}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">전체 만족도</span>
                  <div className="mt-1">{renderStars(reviewSummary.avg_overall_satisfaction)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 리뷰 작성 버튼 */}
        <div className="mb-6">
          {user ? (
            <Button
              onClick={() => router.push(`/labs/${labId}/review`)}
              className="w-full md:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              리뷰 작성하기
            </Button>
          ) : (
            <Button
              onClick={() => router.push('/login')}
              className="w-full md:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              로그인하고 리뷰 작성하기
            </Button>
          )}
        </div>

        {/* 리뷰 목록 */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            리뷰 목록 ({reviews.length}개)
          </h3>
          
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!
              </CardContent>
            </Card>
          ) : (
            <div>{reviews.map(renderReviewCard)}</div>
          )}
        </div>
      </div>
    </div>
  );
} 