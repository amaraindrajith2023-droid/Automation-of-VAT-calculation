export async function onRequest(context) {
  const { request, env } = context;

  try {

    if (request.method !== "POST") {
      return Response.json(
        {
          error: "Method not allowed",
        },
        {
          status: 405,
        }
      );
    }

    const body = await request.json();

    const {
      transactions,
      vatPeriod
    } = body;

    console.log(
      "VAT Period:",
      vatPeriod
    );

    console.log(
      "Transaction Count:",
      transactions?.length
    );

    if (
      !transactions ||
      !Array.isArray(transactions)
    ) {
      return Response.json(
        {
          error:
            "Transactions array is required",
        },
        {
          status: 400,
        }
      );
    }

    for (const transaction of transactions) {

      console.log(
        "Archiving:",
        transaction
      );

      await env.vatflow_db
        .prepare(
          `
          INSERT INTO historical_transactions
          (
            booking_date,
            details,
            transaction_type,
            amount,
            system_suggestion,
            user_decision,
            archived_at
          )
          VALUES
          (
            ?, ?, ?, ?, ?, ?, datetime('now')
          )
          `
        )
        .bind(
          transaction.bookingDate,
          transaction.details,
          transaction.transactionType,
          transaction.amount,
          transaction.systemSuggestion,
          transaction.userDecision
        )
        .run();

    }

    await env.vatflow_db
      .prepare(
        `
        DELETE FROM transactions
        `
      )
      .run();

    return Response.json(
      {
        success: true,
        archivedCount:
          transactions.length,
      }
    );

  } catch (error) {

    console.error(
      "ARCHIVE ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        error: error.message,
        stack: String(error)
      },
      {
        status: 500
      }
    );

  }
}