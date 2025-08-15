import { NextRequest } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// 리뷰 목록 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const labId = params.id;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  try {
    const sql = `
      SELECT 
        id,
        user_name,
        atmosphere_level,
        phd_salary,
        master_salary,
        undergraduate_salary,
        work_intensity,
        commute_importance,
        weekend_work,
        overtime_frequency,
        career_corporate,
        career_professor,
        career_others,
        idea_acceptance,
        mentoring_style,
        research_guidance,
        pros_cons,
        rating,
        created_at
      FROM lab_review
      WHERE lab_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const { rows } = await query(sql, [labId, limit, offset]);

    // 전체 리뷰 수 조회
    const countSql = `
      SELECT COUNT(*) as total FROM lab_review WHERE lab_id = $1
    `;
    const countResult = await query(countSql, [labId]);
    const total = parseInt(countResult.rows[0].total);

    return Response.json({
      reviews: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, private" }
    });

  } catch (error) {
    console.error("리뷰 목록 조회 오류:", error);
    return Response.json(
      { error: "리뷰 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 리뷰 작성
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const labId = params.id;

  try {
    const body = await req.json();
    const {
      userEmail,
      userName,
      atmosphereLevel,
      phdSalary,
      masterSalary,
      undergraduateSalary,
      workIntensity,
      commuteImportance,
      weekendWork,
      overtimeFrequency,
      careerCorporate,
      careerProfessor,
      careerOthers,
      ideaAcceptance,
      mentoringStyle,
      researchGuidance,
      prosCons,
      rating
    } = body;

    // 필수 필드 검증
    if (!userEmail || !userName) {
      return Response.json(
        { error: "사용자 정보가 필요합니다." },
        { status: 400 }
      );
    }

    // 필수 필드 검증
    if (!atmosphereLevel || !workIntensity || !commuteImportance || 
        !weekendWork || !overtimeFrequency ||
        careerCorporate === undefined || careerProfessor === undefined || careerOthers === undefined ||
        !ideaAcceptance || !mentoringStyle || !researchGuidance || !rating) {
      return Response.json(
        { error: "필수 항목을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    // 진로 합계 검증 (10명)
    if (careerCorporate + careerProfessor + careerOthers !== 10) {
      return Response.json(
        { error: "선배 진로 합계는 10명이어야 합니다." },
        { status: 400 }
      );
    }

    // 연구실 존재 여부 확인
    const labCheckSql = "SELECT id FROM lab WHERE id = $1";
    const labCheckResult = await query(labCheckSql, [labId]);
    
    if (labCheckResult.rows.length === 0) {
      return Response.json(
        { error: "연구실을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 리뷰 작성 (UPSERT - 기존 리뷰가 있으면 업데이트)
    const upsertSql = `
      INSERT INTO lab_review (
        lab_id, user_email, user_name, atmosphere_level, phd_salary, master_salary, 
        undergraduate_salary, work_intensity, commute_importance,
        weekend_work, overtime_frequency,
        career_corporate, career_professor, career_others, idea_acceptance,
        mentoring_style, research_guidance, pros_cons, rating
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      ON CONFLICT (lab_id, user_email) 
      DO UPDATE SET
        user_name = EXCLUDED.user_name,
        atmosphere_level = EXCLUDED.atmosphere_level,
        phd_salary = EXCLUDED.phd_salary,
        master_salary = EXCLUDED.master_salary,
        undergraduate_salary = EXCLUDED.undergraduate_salary,
        work_intensity = EXCLUDED.work_intensity,
        commute_importance = EXCLUDED.commute_importance,
        weekend_work = EXCLUDED.weekend_work,
        overtime_frequency = EXCLUDED.overtime_frequency,
        career_corporate = EXCLUDED.career_corporate,
        career_professor = EXCLUDED.career_professor,
        career_others = EXCLUDED.career_others,
        idea_acceptance = EXCLUDED.idea_acceptance,
        mentoring_style = EXCLUDED.mentoring_style,
        research_guidance = EXCLUDED.research_guidance,
        pros_cons = EXCLUDED.pros_cons,
        rating = EXCLUDED.rating,
        updated_at = NOW()
      RETURNING id, created_at, updated_at
    `;

    const result = await query(upsertSql, [
      labId,
      userEmail,
      userName,
      atmosphereLevel,
      phdSalary,
      masterSalary,
      undergraduateSalary,
      workIntensity,
      commuteImportance,
      weekendWork,
      overtimeFrequency,
      careerCorporate,
      careerProfessor,
      careerOthers,
      ideaAcceptance,
      mentoringStyle,
      researchGuidance,
      prosCons,
      rating
    ]);

    return Response.json({
      message: "리뷰가 성공적으로 저장되었습니다.",
      review: result.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error("리뷰 작성 오류:", error);
    return Response.json(
      { error: "리뷰 작성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 