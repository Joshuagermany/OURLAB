import { NextRequest } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const universityId = searchParams.get("university_id");
  const departmentId = searchParams.get("department_id");

  // 대학교와 학과가 모두 선택된 경우에만 연구실 검색
  if (!universityId || !departmentId) {
    return Response.json({ items: [] }, { 
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, private" } 
    });
  }

  const params: (string | number)[] = [];
  let where = "l.university_id = $1 and l.department_id = $2";
  params.push(Number(universityId), Number(departmentId));

  if (q) {
    where += " and (l.name_ko ilike $3 or l.professor_name ilike $3)";
    params.push(`%${q}%`);
  }

  const sql = `
    select 
      l.id, 
      l.name_ko as name, 
      l.professor_name,
      l.homepage_url,
      l.department_id,
      l.university_id
    from lab l
    where ${where}
    order by l.name_ko asc
    limit 50
  `;

  const { rows } = await query(sql, params);
  
  return Response.json({ items: rows }, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate, private" }
  });
}

