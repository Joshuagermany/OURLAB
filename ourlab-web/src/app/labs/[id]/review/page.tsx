"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, ArrowLeft, Save } from "lucide-react";

interface Lab {
  id: number;
  name: string;
  professor_name: string;
  university_name: string;
  department_name: string;
}

interface ReviewForm {
  atmosphere: number;
  workLifeBalance: number;
  professorCommunication: number;
  researchEnvironment: number;
  overallSatisfaction: number;
  comment: string;
}

const EVALUATION_CRITERIA = [
  {
    key: 'atmosphere',
    label: '연구실 분위기',
    description: '연구실의 전반적인 분위기와 팀워크'
  },
  {
    key: 'workLifeBalance',
    label: '워라밸',
    description: '업무와 개인생활의 균형'
  },
  {
    key: 'professorCommunication',
    label: '지도교수 커뮤니케이션',
    description: '지도교수와의 소통 및 지도 방식'
  },
  {
    key: 'researchEnvironment',
    label: '연구 환경',
    description: '연구 장비, 시설, 지원 등'
  },
  {
    key: 'overallSatisfaction',
    label: '전체 만족도',
    description: '전반적인 만족도'
  }
];

export default function ReviewWritePage() {
  const params = useParams();
  const router = useRouter();
  const labId = params.id as string;

  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ReviewForm>({
    atmosphere: 0,
    workLifeBalance: 0,
    professorCommunication: 0,
    researchEnvironment: 0,
    overallSatisfaction: 0,
    comment: ""
  });
  const [user, setUser] = useState<any>(null);

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

  const handleStarClick = (criteria: keyof ReviewForm, score: number) => {
    setForm(prev => ({
      ...prev,
      [criteria]: score
    }));
  };

  const renderStarRating = (criteria: keyof ReviewForm, currentScore: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(criteria, star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= currentScore 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-gray-300 hover:text-yellow-300"
              }`}
            />
          </button>
        ))}
        <span className="ml-3 text-sm font-medium">
          {currentScore > 0 ? `${currentScore}점` : "선택해주세요"}
        </span>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 모든 항목이 평가되었는지 확인
    const scores = [
      form.atmosphere,
      form.workLifeBalance,
      form.professorCommunication,
      form.researchEnvironment,
      form.overallSatisfaction
    ];
    
    if (scores.some(score => score === 0)) {
      alert("모든 평가 항목을 선택해주세요.");
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
          atmosphere: form.atmosphere,
          workLifeBalance: form.workLifeBalance,
          professorCommunication: form.professorCommunication,
          researchEnvironment: form.researchEnvironment,
          overallSatisfaction: form.overallSatisfaction,
          comment: form.comment.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "리뷰 작성에 실패했습니다.");
      }

      alert("리뷰가 성공적으로 작성되었습니다!");
      router.push(`/labs/${labId}`);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : "리뷰 작성 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (error || !lab) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="text-center text-red-600">
          {error || "연구실을 찾을 수 없습니다."}
        </div>
        <div className="text-center mt-4">
          <Button onClick={() => router.back()}>뒤로 가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* 뒤로 가기 버튼 */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        뒤로 가기
      </Button>

      {/* 연구실 정보 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">{lab.name}</CardTitle>
          <p className="text-gray-600">
            {lab.university_name} {lab.department_name}
          </p>
          {lab.professor_name && (
            <p className="text-gray-600">지도교수: {lab.professor_name}</p>
          )}
        </CardHeader>
      </Card>

      {/* 리뷰 작성 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>연구실 리뷰 작성</CardTitle>
        </CardHeader>
        <CardContent>
          {!user ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">리뷰를 작성하려면 로그인이 필요합니다.</p>
              <Button onClick={() => router.push('/login')}>
                로그인하기
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* 평가 항목들 */}
            {EVALUATION_CRITERIA.map((criteria) => (
              <div key={criteria.key} className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {criteria.label}
                  </label>
                  <p className="text-xs text-gray-500">{criteria.description}</p>
                </div>
                {renderStarRating(criteria.key as keyof ReviewForm, form[criteria.key as keyof ReviewForm])}
              </div>
            ))}

            {/* 코멘트 */}
            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium text-gray-700">
                추가 코멘트 (선택사항)
              </label>
              <Textarea
                id="comment"
                value={form.comment}
                onChange={(e) => setForm(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="연구실에 대한 추가적인 의견이나 경험을 자유롭게 작성해주세요."
                rows={4}
                className="resize-none"
              />
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
                {submitting ? "저장 중..." : "리뷰 저장"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
              >
                취소
              </Button>
            </div>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 