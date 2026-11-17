export async function onRequest(context) {
  const { request, env } = context;

  try {
    const { results } = await env.vatflow_db
      .prepare(`
        SELECT *
        FROM historical_transactions
        ORDER BY archived_at DESC
      `)
      .all();

    return Response.json(results);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}