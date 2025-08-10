import { NextRequest } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) {
    return Response.json({ items: [] }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, private" } });
  }
  const sql = `
    select distinct on (lower(name_ko)) id, name_ko as name, region, type
    from university
    where name_ko ilike $1
    order by lower(name_ko), (name_ko like '%(%)') asc, id asc
    limit 20
  `;
  const { rows } = await query(sql, [`%${q}%`]);
  return Response.json({ items: rows }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, private" } });
}

