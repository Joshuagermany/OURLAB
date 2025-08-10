import { NextRequest } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const universityId = searchParams.get("university_id");
  if (!q) {
    return Response.json({ items: [] }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, private" } });
  }
  const params: (string | number)[] = [];
  let where = "name_ko ilike $1";
  params.push(`%${q}%`);
  if (universityId) {
    where += ` and university_id = $2`;
    params.push(Number(universityId));
  }
  const sql = `
    select id, name_ko as name, university_id
    from department
    where ${where}
    order by name_ko asc
    limit 20
  `;
  const { rows } = await query(sql, params);
  return Response.json({ items: rows }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, private" } });
}

