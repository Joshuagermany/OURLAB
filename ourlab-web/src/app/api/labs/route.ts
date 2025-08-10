import { NextRequest } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const universityId = searchParams.get("university_id");
  const departmentId = searchParams.get("department_id");
  if (!q) return Response.json({ items: [] }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, private" } });

  const filters: string[] = ["l.name_ko ilike $1"];
  const params: (string | number)[] = [`%${q}%`];
  if (universityId) {
    filters.push("l.university_id = $2");
    params.push(Number(universityId));
  }
  if (departmentId) {
    filters.push(`l.department_id = $${params.length + 1}`);
    params.push(Number(departmentId));
  }

  const sql = `
    select l.id, l.name_ko as name, l.department_id, l.university_id, l.professor_name
    from lab l
    where ${filters.join(" and ")}
    order by l.name_ko asc
    limit 20
  `;
  const { rows } = await query(sql, params);
  return Response.json({ items: rows }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, private" } });
}

