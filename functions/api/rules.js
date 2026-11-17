export async function onRequest(context) {
  const { request, env } = context;

  try {
    // GET /api/rules
    if (request.method === "GET") {
      const { results } = await env.vatflow_db
        .prepare(
          "SELECT * FROM vat_rules ORDER BY keyword"
        )
        .all();

      return Response.json(results);
    }

    // POST /api/rules
    if (request.method === "POST") {
      const body = await request.json();

      const {
        keyword,
        transactionType,
        vatApplicable,
      } = body;

      if (
        !keyword ||
        !transactionType ||
        !vatApplicable
      ) {
        return Response.json(
          {
            error:
              "Missing required fields",
          },
          {
            status: 400,
          }
        );
      }

      await env.vatflow_db
        .prepare(
          `
          INSERT INTO vat_rules
          (
            keyword,
            transaction_type,
            vat_applicable
          )
          VALUES (?, ?, ?)
        `
        )
        .bind(
          keyword,
          transactionType,
          vatApplicable
        )
        .run();

      return Response.json({
        success: true,
      });
    }

    // DELETE /api/rules?id=1
    if (request.method === "DELETE") {
      const url = new URL(
        request.url
      );

      const id =
        url.searchParams.get("id");

      if (!id) {
        return Response.json(
          {
            error:
              "Rule id is required",
          },
          {
            status: 400,
          }
        );
      }

      await env.vatflow_db
        .prepare(
          "DELETE FROM vat_rules WHERE id = ?"
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
        error:
          "Server error",
        details:
          error.message,
      },
      {
        status: 500,
      }
    );
  }
}