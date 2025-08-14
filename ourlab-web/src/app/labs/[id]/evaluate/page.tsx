"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Plus } from "lucide-react";

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
  avg_daily_work_hours: number | null;
  most_common_phd_salary: string | null;
  most_common_master_salary: string | null;
}

interface ReviewForm {
  atmosphereLevel: string;
  phdSalary: string;
  masterSalary: string;
  undergraduateSalary: string;
  dailyWorkHours: number;
  weekendWork: string;
  overtimeFrequency: string;
  careerCorporate: number;
  careerProfessor: number;
  careerOthers: number;
  ideaAcceptance: string;
  mentoringStyle: string;
  researchGuidance: string;
  communicationStyle: string;
  prosCons: string;
}

const ATMOSPHERE_OPTIONS = ['매우 엄격함', '엄격한 편', '무난함', '프리함', '매우 프리함'];
const SALARY_OPTIONS = ['학비만 지급', '학비+생활비 지급', '학비+생활비+용돈 지급'];
const UNDERGRADUATE_SALARY_OPTIONS = ['미지급', '소정의 연구비 지급'];
const FREQUENCY_OPTIONS = ['자주 있음', '종종 있음', '거의 없음'];
const IDEA_ACCEPTANCE_OPTIONS = ['학생 아이디어 적극 수용', '일부만 수용', '거의 수용하지 않음'];
const MENTORING_STYLE_OPTIONS = ['매우 친절하고 배려심 많음', '중립적', '까다로운 편', '비협조적'];
const RESEARCH_GUIDANCE_OPTIONS = ['큰 방향만 제시', '자율 진행 후 필요 시 보고', '세부 업무까지 직접 관여'];
const COMMUNICATION_STYLE_OPTIONS = ['이메일/메신저 위주', '직접 대면 위주', '수시 연락 가능'];

export default function LabEvaluatePage() {
  const params = useParams();
  const router = useRouter();
  const labId = params.id as string;

  const [lab, setLab] = useState<Lab | null>(null);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<ReviewForm>({
    atmosphereLevel: '',
    phdSalary: '',
    masterSalary: '',
    undergraduateSalary: '',
    dailyWorkHours: 0,
    weekendWork: '',
    overtimeFrequency: '',
    careerCorporate: 0,
    careerProfessor: 0,
    careerOthers: 0,
    ideaAcceptance: '',
    mentoringStyle: '',
    researchGuidance: '',
    communicationStyle: '',
    prosCons: ''
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
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option} className="flex items-center space-x-2">
            <input
              type="radio"
              name={title}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value)}
              className="text-blue-600"
            />
            <span className="text-sm">{option}</span>
          </label>
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
    if (!form.atmosphereLevel || !form.phdSalary || !form.masterSalary || !form.undergraduateSalary ||
        form.dailyWorkHours === 0 || !form.weekendWork || !form.overtimeFrequency ||
        form.careerCorporate === 0 || form.careerProfessor === 0 || form.careerOthers === 0 ||
        !form.ideaAcceptance || !form.mentoringStyle || !form.researchGuidance || !form.communicationStyle) {
      alert("모든 필수 항목을 입력해주세요.");
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
                  홈페이지
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {!showForm ? (
          <>
            {/* 현재 평가 현황 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>현재 평가 현황</CardTitle>
              </CardHeader>
              <CardContent>
                {reviewSummary && reviewSummary.review_count > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">총 리뷰 수</span>
                      <div className="mt-1 text-lg font-semibold">{reviewSummary.review_count}개</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">연구실 분위기</span>
                      <div className="mt-1">{renderValue(reviewSummary.most_common_atmosphere)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">평균 근무시간</span>
                      <div className="mt-1">{renderValue(reviewSummary.avg_daily_work_hours)}시간</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">박사생 인건비</span>
                      <div className="mt-1">{renderValue(reviewSummary.most_common_phd_salary)}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">아직 평가가 없습니다. 첫 번째 평가를 작성해보세요!</p>
                )}
              </CardContent>
            </Card>

            {/* 평가 작성 섹션 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>연구실 평가하기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  {user ? (
                    <div>
                      <p className="text-gray-600 mb-6">
                        이 연구실에 대한 경험이나 의견을 공유해주세요.<br />
                        다른 학생들이 더 나은 선택을 할 수 있도록 도와주세요.
                      </p>
                      <p className="text-sm text-gray-500 mb-6">
                        *평가자와 평가인원에 대한 정보는 모두 비공개 처리됩니다.
                      </p>
                      <Button
                        onClick={() => setShowForm(true)}
                        size="lg"
                        className="px-8 py-3"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        평가 작성하기
                      </Button>
                    </div>
                  ) : (
                    <div>
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
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 평가 완료 후 확인 링크 */}
            <div className="text-center">
              <p className="text-gray-500 mb-2">
                평가를 완료하신 후 다른 연구실 평가도 확인해보세요
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/labs/${labId}/view`)}
                >
                  이 연구실 평가 확인하기
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                >
                  홈으로 돌아가기
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* 평가 폼 */
          <Card>
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
                  <h3 className="text-lg font-semibold mb-4">2. 인건비 지급</h3>
                  <div className="space-y-4">
                    {renderRadioGroup(
                      "박사생",
                      SALARY_OPTIONS,
                      form.phdSalary,
                      (value) => setForm(prev => ({ ...prev, phdSalary: value }))
                    )}
                    {renderRadioGroup(
                      "석사생",
                      SALARY_OPTIONS,
                      form.masterSalary,
                      (value) => setForm(prev => ({ ...prev, masterSalary: value }))
                    )}
                    {renderRadioGroup(
                      "학부생",
                      UNDERGRADUATE_SALARY_OPTIONS,
                      form.undergraduateSalary,
                      (value) => setForm(prev => ({ ...prev, undergraduateSalary: value }))
                    )}
                  </div>
                </div>

                {/* 3. 업무 강도 / 워라밸 */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">3. 업무 강도 / 워라밸</h3>
                  <div className="space-y-4">
                    {renderNumberInput(
                      "하루 평균 근무 시간 (시간)",
                      form.dailyWorkHours,
                      (value) => setForm(prev => ({ ...prev, dailyWorkHours: value }))
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

                {/* 5. 교수님 평가 */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">5. 교수님 평가</h3>
                  <div className="space-y-4">
                    {renderRadioGroup(
                      "연구 아이디어 수용도",
                      IDEA_ACCEPTANCE_OPTIONS,
                      form.ideaAcceptance,
                      (value) => setForm(prev => ({ ...prev, ideaAcceptance: value }))
                    )}
                    {renderRadioGroup(
                      "멘토링/인성",
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
                    {renderRadioGroup(
                      "소통 방식",
                      COMMUNICATION_STYLE_OPTIONS,
                      form.communicationStyle,
                      (value) => setForm(prev => ({ ...prev, communicationStyle: value }))
                    )}
                  </div>
                </div>

                {/* 6. 연구실의 장점 및 단점 */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">6. 연구실의 장점 및 단점</h3>
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
                    onClick={() => setShowForm(false)}
                    disabled={submitting}
                  >
                    취소
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 