import { Pool, QueryResult, QueryResultRow } from "pg";

const connectionString = process.env.PG_DSN || "postgresql://ourlab:ourlab@localhost:5432/ourlab";

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

