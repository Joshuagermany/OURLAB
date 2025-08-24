import { NextRequest } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: labId } = await params;

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

    // 연구실 리뷰 요약 정보 조회
    const reviewSummarySql = `
      SELECT * FROM lab_review_summary WHERE lab_id = $1
    `;
    
    const reviewSummaryResult = await query(reviewSummarySql, [labId]);
    
    const reviewSummary = reviewSummaryResult.rows[0] || {
      review_count: 0,
      most_common_atmosphere: null,
      most_common_phd_salary: null,
      most_common_master_salary: null,
      most_common_undergraduate_salary: null,
      avg_daily_work_hours: null,
      most_common_weekend_work: null,
      most_common_overtime_frequency: null,
      avg_career_corporate: null,
      avg_career_professor: null,
      avg_career_others: null,
      most_common_idea_acceptance: null,
      most_common_mentoring_style: null,
      most_common_research_guidance: null,
      most_common_communication_style: null
    };

    return Response.json({
      lab,
      reviewSummary: reviewSummary
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