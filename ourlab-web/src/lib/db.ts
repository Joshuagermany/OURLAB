import { Pool, QueryResult, QueryResultRow } from "pg";

const connectionString = process.env.PG_DSN || "postgresql://neondb_owner:npg_skJBF3H6WZqG@ep-billowing-frost-a1wz2pt5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export const pgPool = new Pool({ connectionString });

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  const client = await pgPool.connect();
  try {
    const res = await client.query<T>(text, params);
    return res;
  } finally {
    client.release();
  }
}

