"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, ExternalLink, MessageSquare, Check } from "lucide-react";

// 평가 옵션 상수들
const ATMOSPHERE_OPTIONS = ['매우 엄격함', '엄격한 편', '무난함', '프리함', '매우 프리함'];
const SALARY_OPTIONS = ['학비만 지급', '학비+생활비 지급', '학비+생활비+용돈 지급'];
const UNDERGRADUATE_SALARY_OPTIONS = ['미지급', '소정의 연구비 지급'];
const WORK_INTENSITY_OPTIONS = ['강한 편', '무난한 편', '여유로운 편'];
const COMMUTE_IMPORTANCE_OPTIONS = ['맞춰야 함', '크게 중요하지 않음'];
const FREQUENCY_OPTIONS = ['자주 있음', '종종 있음', '거의 없음'];
const IDEA_ACCEPTANCE_OPTIONS = ['학생 아이디어 적극 수용', '일부만 수용', '거의 수용하지 않음'];
const MENTORING_STYLE_OPTIONS = ['매우 친절하고 배려심 많음', '친절하신 편', '중립적', '까다로운 편', '비협조적'];
const RESEARCH_GUIDANCE_OPTIONS = ['큰 방향만 제시', '자율 진행 후 필요 시 보고', '세부 업무까지 직접 관여'];

interface Lab {
  id: number;
  name: string;
  university_name: string;
  department_name: string;
  professor_name: string | null;
  homepage_url: string | null;
}

interface Review {
  id: number;
  user_name: string;
  created_at: string;
  atmosphere_level: string | null;
  phd_salary: string | null;
  master_salary: string | null;
  undergraduate_salary: string | null;
  work_intensity: string | null;
  commute_importance: string | null;
  weekend_work: string | null;
  overtime_frequency: string | null;
  career_corporate: number | null;
  career_professor: number | null;
  career_others: number | null;
  idea_acceptance: string | null;
  mentoring_style: string | null;
  research_guidance: string | null;
  pros_cons: string | null;
  rating: number | null;
}

interface ReviewSummary {
  review_count: number;
  avg_rating: number | null;
  atmosphere_stats: Record<string, number>;
  work_intensity_stats: Record<string, number>;
  commute_importance_stats: Record<string, number>;
  weekend_work_stats: Record<string, number>;
  overtime_frequency_stats: Record<string, number>;
  idea_acceptance_stats: Record<string, number>;
  mentoring_style_stats: Record<string, number>;
  research_guidance_stats: Record<string, number>;
  rating_stats: Record<string, number>;
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

  // 기존 평가자들이 선택한 옵션을 파란색으로 표시하는 함수
  const renderRadioGroup = (
    title: string,
    options: string[],
    selectedOptions: string[],
    required: boolean = true
  ) => (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option);
          return (
            <div
              key={option}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-blue-500 text-white border border-blue-600'
                  : 'bg-gray-200 text-gray-700 border border-gray-300'
              }`}
            >
              {option}
            </div>
          );
        })}
      </div>
    </div>
  );

  // 별점 표시 함수
  const renderStarRating = (avgRating: number) => (
    <div className="flex items-center gap-3">
      <span className="text-2xl font-bold text-gray-600">
        {avgRating.toFixed(1)}/5
      </span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 ${
              star <= avgRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );

  // 진로 입력 표시 함수
  const renderCareerDisplay = (
    title: string,
    value: number
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {title}
      </label>
      <div className="px-3 py-2 bg-gray-100 rounded-md text-sm">
        {value}명
      </div>
    </div>
  );

  // 기존 평가자들이 선택한 옵션들을 추출하는 함수들
  const getSelectedOptions = (field: keyof Review) => {
    const options = new Set<string>();
    reviews.forEach(review => {
      const value = review[field];
      if (value && typeof value === 'string') {
        options.add(value);
      }
    });
    return Array.from(options);
  };

  const getAverageCareer = (field: keyof Review) => {
    const values = reviews.map(review => review[field]).filter(v => typeof v === 'number');
    if (values.length === 0) return 0;
    return Math.round(values.reduce((sum, val) => sum + (val as number), 0) / values.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div>연구실을 찾을 수 없습니다.</div>
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
          className="mb-6 hover:bg-gray-100"
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
                  onClick={() => window.open(lab.homepage_url!, '_blank')}
                  className="hover:bg-gray-100"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  홈페이지
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* 평가 결과 표시 */}
        {reviews.length > 0 ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>연구실 평가 결과</CardTitle>
              <p className="text-sm text-gray-600">
                기존 평가자들이 선택한 항목들이 파란색으로 표시됩니다.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* 별점 평가 */}
                {reviewSummary?.avg_rating && (
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4">별점 평가</h3>
                    {renderStarRating(Number(reviewSummary.avg_rating))}
                  </div>
                )}

                {/* 연구실의 분위기 */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">연구실의 분위기</h3>
                  {renderRadioGroup(
                    "연구실 분위기",
                    ATMOSPHERE_OPTIONS,
                    getSelectedOptions('atmosphere_level')
                  )}
                </div>

                {/* 인건비 지급 */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">인건비 지급 (선택사항)</h3>
                  <div className="space-y-4">
                    {renderRadioGroup(
                      "박사생",
                      SALARY_OPTIONS,
                      getSelectedOptions('phd_salary'),
                      false
                    )}
                    {renderRadioGroup(
                      "석사생",
                      SALARY_OPTIONS,
                      getSelectedOptions('master_salary'),
                      false
                    )}
                    {renderRadioGroup(
                      "학부생",
                      UNDERGRADUATE_SALARY_OPTIONS,
                      getSelectedOptions('undergraduate_salary'),
                      false
                    )}
                  </div>
                </div>

                {/* 업무 강도 / 워라밸 */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">업무 강도 / 워라밸</h3>
                  <div className="space-y-4">
                    {renderRadioGroup(
                      "업무 강도",
                      WORK_INTENSITY_OPTIONS,
                      getSelectedOptions('work_intensity')
                    )}
                    {renderRadioGroup(
                      "출퇴근 시간",
                      COMMUTE_IMPORTANCE_OPTIONS,
                      getSelectedOptions('commute_importance')
                    )}
                    {renderRadioGroup(
                      "주말/공휴일 근무 여부",
                      FREQUENCY_OPTIONS,
                      getSelectedOptions('weekend_work')
                    )}
                    {renderRadioGroup(
                      "야근 빈도",
                      FREQUENCY_OPTIONS,
                      getSelectedOptions('overtime_frequency')
                    )}
                  </div>
                </div>

                {/* 선배들의 진로 */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">선배들의 진로 (최근 10명 졸업생 기준)</h3>
                  <div className="space-y-4">
                    {renderCareerDisplay("대기업", getAverageCareer('career_corporate'))}
                    {renderCareerDisplay("교수", getAverageCareer('career_professor'))}
                    {renderCareerDisplay("그 외", getAverageCareer('career_others'))}
                  </div>
                </div>

                {/* 교수님 평가 */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">지도 교수님 평가</h3>
                  <div className="space-y-4">
                    {renderRadioGroup(
                      "연구 아이디어 수용도",
                      IDEA_ACCEPTANCE_OPTIONS,
                      getSelectedOptions('idea_acceptance')
                    )}
                    {renderRadioGroup(
                      "멘토링 및 인품",
                      MENTORING_STYLE_OPTIONS,
                      getSelectedOptions('mentoring_style')
                    )}
                    {renderRadioGroup(
                      "연구 지도 스타일",
                      RESEARCH_GUIDANCE_OPTIONS,
                      getSelectedOptions('research_guidance')
                    )}
                  </div>
                </div>

                {/* 연구실의 장점 및 단점 */}
                {reviews.some(review => review.pros_cons) && (
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4">연구실의 장점 및 단점</h3>
                    <div className="space-y-4">
                      {reviews
                        .filter(review => review.pros_cons)
                        .map((review, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600 mb-2">
                              익명 • {new Date(review.created_at).toLocaleDateString('ko-KR')}
                            </div>
                            <div className="text-gray-800 whitespace-pre-wrap">
                              {review.pros_cons}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <p className="text-lg">아직 평가가 없습니다.</p>
                <p className="text-sm mt-2 text-gray-400">첫 번째 평가를 작성해보세요!</p>
              </div>
            </CardContent>
          </Card>
        )}

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