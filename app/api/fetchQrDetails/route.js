import { prisma } from "../../../utils/prisma";

export async function GET(request) {
  try {
    // Extract unique_id from the query parameters
    const url = new URL(request.url);
    const unique_id = url.searchParams.get("unique_id");

    if (!unique_id) {
      return new Response(
        JSON.stringify({ error: "unique_id is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

      const user_update = await prisma.user.findUnique({
        where: {
          unique_id: unique_id,
        },
      });
      

   
    if (!user_update) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(user_update), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    
    return new Response(
      JSON.stringify({ error: `Failed to fetch user ${error instanceof Error ? error.message : error}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
