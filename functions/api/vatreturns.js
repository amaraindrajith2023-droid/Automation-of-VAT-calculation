export async function onRequest(context) {
  const { request, env } = context;

  try {
    // POST /api/vatreturns
    if (request.method === "POST") {
      const body = await request.json();

      const {
        vatPeriod,
        vatRate,
        inputVAT,
        outputVAT,
        vatPayable,
      } = body;

      if (
        !vatPeriod ||
        vatRate === undefined ||
        inputVAT === undefined ||
        outputVAT === undefined ||
        vatPayable === undefined
      ) {
        return Response.json(
          {
            error: "Missing required fields",
          },
          {
            status: 400,
          }
        );
      }

      await env.vatflow_db
        .prepare(
          `
          INSERT INTO vat_returns
          (
            vat_period,
            vat_rate,
            input_vat,
            output_vat,
            vat_payable,
            confirmed_at
          )
          VALUES (?, ?, ?, ?, ?, datetime('now'))
        `
        )
        .bind(
          vatPeriod,
          vatRate,
          inputVAT,
          outputVAT,
          vatPayable
        )
        .run();

      return Response.json({
        success: true,
      });
    }

    // GET /api/vatreturns
    if (request.method === "GET") {
      const { results } = await env.vatflow_db
        .prepare(
          `
          SELECT *
          FROM vat_returns
          ORDER BY id DESC
        `
        )
        .all();

      return Response.json(results);
    }

    return Response.json(
      {
        error: "Method not allowed",
      },
      {
        status: 405,
      }
    );

  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Server error",
        details: error.message,
      },
      {
        status: 500,
      }
    );
  }
}