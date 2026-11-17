export async function onRequest(context) {
  const { request, env } = context;

  try {
    // GET /api/transactions
    if (request.method === "GET") {
      const { results } = await env.vatflow_db
        .prepare(
          "SELECT * FROM transactions ORDER BY uploaded_at DESC"
        )
        .all();

      return Response.json(results);
    }

    // POST /api/transactions
    if (request.method === "POST") {
      const body = await request.json();

      const {
        bookingDate,
        details,
        transactionType,
        amount,
        systemSuggestion,
        userDecision,
      } = body;

      await env.vatflow_db
        .prepare(
          `
          INSERT INTO transactions (
            booking_date,
            details,
            transaction_type,
            amount,
            system_suggestion,
            user_decision
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `
        )
        .bind(
          bookingDate,
          details,
          transactionType,
          amount,
          systemSuggestion,
          userDecision
        )
        .run();

      return Response.json({
        success: true,
      });
    }

    // DELETE /api/transactions?id=1
    if (request.method === "DELETE") {
      const url = new URL(
        request.url
      );

      const id =
        url.searchParams.get("id");

      await env.vatflow_db
        .prepare(
          "DELETE FROM transactions WHERE id = ?"
        )
        .bind(id)
        .run();

      return Response.json({
        success: true,
      });
    }

    return Response.json(
      {
        error:
          "Method not allowed",
      },
      {
        status: 405,
      }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}