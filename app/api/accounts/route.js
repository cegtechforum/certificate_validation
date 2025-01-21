import { prisma } from "../../../utils/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({});
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    
    return new Response(JSON.stringify({ error: `Failed to fetch users ${error instanceof Error ? error.message : error}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } 
}
