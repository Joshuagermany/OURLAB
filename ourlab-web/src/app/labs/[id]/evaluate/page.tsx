"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Plus, Star, Check, ExternalLink } from "lucide-react";

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
  most_common_work_intensity: string | null;
  most_common_commute_importance: string | null;
  most_common_phd_salary: string | null;
  most_common_master_salary: string | null;
}

interface ReviewForm {
  atmosphereLevel: string;
  phdSalary: string;
  masterSalary: string;
  undergraduateSalary: string;
  workIntensity: string;
  commuteImportance: string;
  weekendWork: string;
  overtimeFrequency: string;
  careerCorporate: number;
  careerProfessor: number;
  careerOthers: number;
  ideaAcceptance: string;
  mentoringStyle: string;
  researchGuidance: string;
  prosCons: string;
  rating: number;
}

const ATMOSPHERE_OPTIONS = ['매우 엄격함', '엄격한 편', '무난함', '프리함', '매우 프리함'];
const SALARY_OPTIONS = ['학비만 지급', '학비+생활비 지급', '학비+생활비+용돈 지급'];
const UNDERGRADUATE_SALARY_OPTIONS = ['미지급', '소정의 연구비 지급'];
const FREQUENCY_OPTIONS = ['자주 있음', '종종 있음', '거의 없음'];
const WORK_INTENSITY_OPTIONS = ['강한 편', '무난한 편', '여유로운 편'];
const COMMUTE_IMPORTANCE_OPTIONS = ['맞춰야 함', '크게 중요하지 않음'];
const IDEA_ACCEPTANCE_OPTIONS = ['학생 아이디어 적극 수용', '일부만 수용', '거의 수용하지 않음'];
const MENTORING_STYLE_OPTIONS = ['매우 친절하고 배려심 많음', '친절하신 편', '중립적', '까다로운 편', '비협조적'];
const RESEARCH_GUIDANCE_OPTIONS = ['큰 방향만 제시', '자율 진행 후 필요 시 보고', '세부 업무까지 직접 관여'];

export default function LabEvaluatePage() {
  const params = useParams();
  const router = useRouter();
  const labId = params.id as string;

  const [lab, setLab] = useState<Lab | null>(null);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [form, setForm] = useState<ReviewForm>({
    atmosphereLevel: '',
    phdSalary: '',
    masterSalary: '',
    undergraduateSalary: '',
    workIntensity: '',
    commuteImportance: '',
    weekendWork: '',
    overtimeFrequency: '',
    careerCorporate: 0,
    careerProfessor: 0,
    careerOthers: 0,
    ideaAcceptance: '',
    mentoringStyle: '',
    researchGuidance: '',
    prosCons: '',
    rating: 0
  });

  useEffect(() => {
    fetchLabData();
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

  const handleAuthentication = () => {
    setIsAuthenticated(true);
    alert('학교 메일 인증이 완료되었습니다. 이제 평가를 작성할 수 있습니다.');
  };

  const renderValue = (value: string | number | null) => {
    if (value === null || value === undefined) return <span className="text-gray-400">평가 없음</span>;
    return <span className="text-sm font-medium">{value}</span>;
  };

  const renderRadioGroup = (
    title: string,
    options: string[],
    value: string,
    onChange: (value: string) => void,
    required: boolean = true
  ) => (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              value === option
                ? 'bg-gray-700 text-white border border-gray-600'
                : 'bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  const renderNumberInput = (
    title: string,
    value: number,
    onChange: (value: number) => void,
    min: number = 0,
    max: number = 24,
    required: boolean = true
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        min={min}
        max={max}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        placeholder={`${min}-${max}`}
      />
    </div>
  );

  const renderStarRating = (
    value: number,
    onChange: (value: number) => void
  ) => (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        별점 평가 <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="focus:outline-none"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= value
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-600 ml-2">
          {value}/5
        </span>
      </div>
    </div>
  );

  const renderCareerInput = (
    title: string,
    value: number,
    onChange: (value: number) => void,
    remaining: number
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {title} (남은 인원: {remaining}명)
      </label>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => {
          const newValue = parseInt(e.target.value) || 0;
          if (newValue <= remaining + value) {
            onChange(newValue);
          }
        }}
        min={0}
        max={10}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        placeholder="0-10"
      />
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 모든 필수 항목이 입력되었는지 확인
    if (!form.atmosphereLevel || !form.workIntensity || !form.commuteImportance ||
        !form.weekendWork || !form.overtimeFrequency ||
        form.careerCorporate === 0 || form.careerProfessor === 0 || form.careerOthers === 0 ||
        !form.ideaAcceptance || !form.mentoringStyle || !form.researchGuidance || form.rating === 0) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    // 진로 합계 검증
    if (form.careerCorporate + form.careerProfessor + form.careerOthers !== 10) {
      alert("선배 진로 합계는 10명이어야 합니다.");
      return;
    }

    setSubmitting(true);
    
    try {
      if (!user) {
        alert("로그인이 필요합니다.");
        router.push('/login');
        return;
      }

      const userEmail = user.email;
      const userName = user.displayName || user.name || "익명 사용자";

      const response = await fetch(`/api/labs/${labId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail,
          userName,
          ...form
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "리뷰 작성에 실패했습니다.");
      }

      alert("리뷰가 성공적으로 작성되었습니다!");
      router.push(`/labs/${labId}/view`);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : "리뷰 작성 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
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

  const remainingCareer = 10 - form.careerCorporate - form.careerProfessor - form.careerOthers;

  return (
    <div className="mx-auto" style={{ maxWidth: '1920px', minWidth: '960px' }}>
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
                  onClick={() => window.open(lab.homepage_url, '_blank')}
                  className="hover:bg-gray-100"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  홈페이지
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* 이 연구실을 나의 연구실로 등록 */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-5 h-5 ${
                    isFavorite
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-400'
                  }`}
                />
              </button>
              <div 
                className="cursor-pointer hover:underline"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <CardTitle>
                  이 연구실을 나의 연구실로 등록
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-5">
            <div className="flex justify-between items-start">
              <p className="text-gray-500">나의 연구실 등록은 학교 메일 인증 후 가능합니다.</p>
              <Button
                variant="outline"
                size="sm"
                className="-mt-3 hover:bg-gray-100"
                onClick={handleAuthentication}
              >
                <Check className="w-4 h-4 mr-1 text-gray-500" />
                대학교 인증하기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 평가 폼 */}
        {user ? (
          <div className="relative">
            <Card className={`relative ${!isAuthenticated ? 'blur-sm pointer-events-none' : ''}`}>
              <CardHeader>
                <CardTitle>연구실 평가하기</CardTitle>
                <p className="text-sm text-gray-600">
                  이 연구실에 대한 경험이나 의견을 공유해주세요.<br />
                  다른 학생들이 더 나은 선택을 할 수 있도록 도와주세요.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  *평가자와 평가인원에 대한 정보는 모두 비공개 처리됩니다.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* 1. 연구실의 분위기 */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4">1. 연구실의 분위기</h3>
                    {renderRadioGroup(
                      "연구실 분위기",
                      ATMOSPHERE_OPTIONS,
                      form.atmosphereLevel,
                      (value) => setForm(prev => ({ ...prev, atmosphereLevel: value }))
                    )}
                  </div>

                  {/* 2. 인건비 지급 */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4">2. 인건비 지급 (선택사항)</h3>
                    <div className="space-y-4">
                      {renderRadioGroup(
                        "박사생",
                        SALARY_OPTIONS,
                        form.phdSalary,
                        (value) => setForm(prev => ({ ...prev, phdSalary: value })),
                        false
                      )}
                      {renderRadioGroup(
                        "석사생",
                        SALARY_OPTIONS,
                        form.masterSalary,
                        (value) => setForm(prev => ({ ...prev, masterSalary: value })),
                        false
                      )}
                      {renderRadioGroup(
                        "학부생",
                        UNDERGRADUATE_SALARY_OPTIONS,
                        form.undergraduateSalary,
                        (value) => setForm(prev => ({ ...prev, undergraduateSalary: value })),
                        false
                      )}
                    </div>
                  </div>

                  {/* 3. 업무 강도 / 워라밸 */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4">3. 업무 강도 / 워라밸</h3>
                    <div className="space-y-4">

                      {renderRadioGroup(
                        "업무 강도",
                        WORK_INTENSITY_OPTIONS,
                        form.workIntensity,
                        (value) => setForm(prev => ({ ...prev, workIntensity: value }))
                      )}
                      {renderRadioGroup(
                        "출퇴근 시간",
                        COMMUTE_IMPORTANCE_OPTIONS,
                        form.commuteImportance,
                        (value) => setForm(prev => ({ ...prev, commuteImportance: value }))
                      )}
                      {renderRadioGroup(
                        "주말/공휴일 근무 여부",
                        FREQUENCY_OPTIONS,
                        form.weekendWork,
                        (value) => setForm(prev => ({ ...prev, weekendWork: value }))
                      )}
                      {renderRadioGroup(
                        "야근 빈도",
                        FREQUENCY_OPTIONS,
                        form.overtimeFrequency,
                        (value) => setForm(prev => ({ ...prev, overtimeFrequency: value }))
                      )}
                    </div>
                  </div>

                  {/* 4. 선배들의 진로 */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4">4. 선배들의 진로 (최근 10명 졸업생 기준)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {renderCareerInput(
                        "대기업",
                        form.careerCorporate,
                        (value) => setForm(prev => ({ ...prev, careerCorporate: value })),
                        remainingCareer + form.careerCorporate
                      )}
                      {renderCareerInput(
                        "교수",
                        form.careerProfessor,
                        (value) => setForm(prev => ({ ...prev, careerProfessor: value })),
                        remainingCareer + form.careerProfessor
                      )}
                      {renderCareerInput(
                        "그 외",
                        form.careerOthers,
                        (value) => setForm(prev => ({ ...prev, careerOthers: value })),
                        remainingCareer + form.careerOthers
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      총합: {form.careerCorporate + form.careerProfessor + form.careerOthers}/10명
                    </p>
                  </div>

                  {/* 5. 지도 교수님 평가 */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4">5. 지도 교수님 평가</h3>
                    <div className="space-y-4">
                      {renderRadioGroup(
                        "연구 아이디어 수용도",
                        IDEA_ACCEPTANCE_OPTIONS,
                        form.ideaAcceptance,
                        (value) => setForm(prev => ({ ...prev, ideaAcceptance: value }))
                      )}
                      {renderRadioGroup(
                        "멘토링 및 인품",
                        MENTORING_STYLE_OPTIONS,
                        form.mentoringStyle,
                        (value) => setForm(prev => ({ ...prev, mentoringStyle: value }))
                      )}
                      {renderRadioGroup(
                        "연구 지도 스타일",
                        RESEARCH_GUIDANCE_OPTIONS,
                        form.researchGuidance,
                        (value) => setForm(prev => ({ ...prev, researchGuidance: value }))
                      )}
                    </div>
                  </div>

                  {/* 6. 별점 평가 */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4">6. 별점 평가</h3>
                    {renderStarRating(
                      form.rating,
                      (value) => setForm(prev => ({ ...prev, rating: value }))
                    )}
                  </div>

                  {/* 7. 연구실의 장점 및 단점 */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4">7. 연구실의 장점 및 단점</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        장점 및 단점 (선택사항)
                      </label>
                      <textarea
                        value={form.prosCons}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(prev => ({ ...prev, prosCons: e.target.value }))}
                        placeholder="연구실의 장점과 단점을 자유롭게 작성해주세요."
                        rows={4}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none"
                      />
                    </div>
                  </div>

                  {/* 에러 메시지 */}
                  {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                  )}

                  {/* 제출 버튼 */}
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {submitting ? "저장 중..." : "평가 저장"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={submitting}
                      className="hover:bg-gray-100"
                    >
                      취소
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {/* 블러 처리 시 오버레이 메시지 */}
            {!isAuthenticated && (
              <div className="absolute inset-0 bg-white/80 flex items-start justify-center z-50 pt-50">
                <div className="text-center p-8">
                  <div className="text-2xl font-bold text-gray-700 mb-4">
                    🔒 평가 작성이 잠겨있습니다
                  </div>
                  <p className="text-gray-600 mb-6">
                    위의 "대학교 인증하기" 버튼을 클릭하여<br />
                    학교 메일 인증을 완료한 후 평가를 작성할 수 있습니다.
                  </p>
                  <Button
                    onClick={handleAuthentication}
                    size="lg"
                    className="px-8 py-3"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    대학교 인증하기
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 로그인 필요 메시지 */
          <Card>
            <CardHeader>
              <CardTitle>연구실 평가하기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-600 mb-6">
                  평가를 작성하려면 로그인이 필요합니다.
                </p>
                <Button
                  onClick={() => router.push('/login')}
                  size="lg"
                  className="px-8 py-3"
                >
                  로그인하고 평가하기
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 평가 완료 후 확인 링크 */}
        <div className="text-center mt-8">
          <p className="text-gray-500 mb-2">
            평가를 완료하신 후 다른 연구실 평가도 확인해보세요
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push(`/labs/${labId}/view`)}
              className="hover:bg-gray-100"
            >
              이 연구실 평가 확인하기
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="hover:bg-gray-100"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 