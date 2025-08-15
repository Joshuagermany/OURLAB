import { NextRequest } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const labId = params.id;

  try {
    // 연구실 기본 정보 조회
    const labSql = `
      SELECT 
        l.id,
        l.name_ko as name,
        l.professor_name,
        l.homepage_url,
        l.department_id,
        l.university_id,
        u.name_ko as university_name,
        d.name_ko as department_name
      FROM lab l
      JOIN university u ON l.university_id = u.id
      JOIN department d ON l.department_id = d.id
      WHERE l.id = $1
    `;

    const labResult = await query(labSql, [labId]);
    
    if (labResult.rows.length === 0) {
      return Response.json(
        { error: "연구실을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const lab = labResult.rows[0];

    // 연구실 리뷰 요약 정보 조회 (평균 점수)
    const reviewSummarySql = `
      SELECT * FROM lab_review_summary WHERE lab_id = $1
    `;
    
    // 연구실 상세 통계 정보 조회 (진행바용)
    const detailedStatsSql = `
      SELECT * FROM lab_review_detailed_stats WHERE lab_id = $1
    `;
    
    const reviewSummaryResult = await query(reviewSummarySql, [labId]);
    const detailedStatsResult = await query(detailedStatsSql, [labId]);
    
    const reviewSummary = reviewSummaryResult.rows[0] || {
      review_count: 0,
      avg_atmosphere: null,
      avg_work_life_balance: null,
      avg_professor_communication: null,
      avg_research_environment: null,
      avg_overall_satisfaction: null,
      avg_total_score: null
    };
    
    const detailedStats = detailedStatsResult.rows[0] || {
      review_count: 0,
      rating_stats: {},
      atmosphere_stats: {},
      work_intensity_stats: {},
      commute_importance_stats: {},
      weekend_work_stats: {},
      overtime_frequency_stats: {},
      idea_acceptance_stats: {},
      mentoring_style_stats: {},
      research_guidance_stats: {}
    };
    
    // 두 결과를 합침
    const combinedReviewSummary = {
      ...reviewSummary,
      ...detailedStats
    };

    return Response.json({
      lab,
      reviewSummary: combinedReviewSummary
    }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, private" }
    });

  } catch (error) {
    console.error("연구실 상세 정보 조회 오류:", error);
    return Response.json(
      { error: "연구실 정보를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 