import { NextRequest } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// 리뷰 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  const { id: labId, reviewId } = params;

  try {
    const body = await req.json();
    const {
      userEmail,
      userName,
      atmosphere,
      workLifeBalance,
      professorCommunication,
      researchEnvironment,
      overallSatisfaction,
      comment
    } = body;

    // 필수 필드 검증
    if (!userEmail || !userName) {
      return Response.json(
        { error: "사용자 정보가 필요합니다." },
        { status: 400 }
      );
    }

    // 점수 검증 (1-5점)
    const scores = [atmosphere, workLifeBalance, professorCommunication, researchEnvironment, overallSatisfaction];
    for (const score of scores) {
      if (score < 1 || score > 5) {
        return Response.json(
          { error: "모든 점수는 1-5점 사이여야 합니다." },
          { status: 400 }
        );
      }
    }

    // 리뷰 존재 여부 및 권한 확인
    const checkSql = `
      SELECT id FROM lab_review 
      WHERE id = $1 AND lab_id = $2 AND user_email = $3
    `;
    const checkResult = await query(checkSql, [reviewId, labId, userEmail]);
    
    if (checkResult.rows.length === 0) {
      return Response.json(
        { error: "리뷰를 찾을 수 없거나 수정 권한이 없습니다." },
        { status: 404 }
      );
    }

    // 리뷰 수정
    const updateSql = `
      UPDATE lab_review SET
        user_name = $1,
        atmosphere = $2,
        work_life_balance = $3,
        professor_communication = $4,
        research_environment = $5,
        overall_satisfaction = $6,
        comment = $7,
        updated_at = NOW()
      WHERE id = $8 AND lab_id = $9 AND user_email = $10
      RETURNING id, created_at, updated_at
    `;

    const result = await query(updateSql, [
      userName,
      atmosphere,
      workLifeBalance,
      professorCommunication,
      researchEnvironment,
      overallSatisfaction,
      comment,
      reviewId,
      labId,
      userEmail
    ]);

    if (result.rows.length === 0) {
      return Response.json(
        { error: "리뷰 수정에 실패했습니다." },
        { status: 500 }
      );
    }

    return Response.json({
      message: "리뷰가 성공적으로 수정되었습니다.",
      review: result.rows[0]
    });

  } catch (error) {
    console.error("리뷰 수정 오류:", error);
    return Response.json(
      { error: "리뷰 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 리뷰 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  const { id: labId, reviewId } = params;
  const { searchParams } = new URL(req.url);
  const userEmail = searchParams.get("userEmail");

  if (!userEmail) {
    return Response.json(
      { error: "사용자 이메일이 필요합니다." },
      { status: 400 }
    );
  }

  try {
    // 리뷰 존재 여부 및 권한 확인
    const checkSql = `
      SELECT id FROM lab_review 
      WHERE id = $1 AND lab_id = $2 AND user_email = $3
    `;
    const checkResult = await query(checkSql, [reviewId, labId, userEmail]);
    
    if (checkResult.rows.length === 0) {
      return Response.json(
        { error: "리뷰를 찾을 수 없거나 삭제 권한이 없습니다." },
        { status: 404 }
      );
    }

    // 리뷰 삭제
    const deleteSql = `
      DELETE FROM lab_review 
      WHERE id = $1 AND lab_id = $2 AND user_email = $3
    `;

    const result = await query(deleteSql, [reviewId, labId, userEmail]);

    return Response.json({
      message: "리뷰가 성공적으로 삭제되었습니다."
    });

  } catch (error) {
    console.error("리뷰 삭제 오류:", error);
    return Response.json(
      { error: "리뷰 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 