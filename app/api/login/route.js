// for validation of login and protected route using cookies - for that we use middle ware
import { NextResponse } from "next/server";
import { serialize } from "cookie";
import { prisma } from "../../../utils/prisma";
export async function POST(request) {
  const { adminId, password } = await request.json();
  const user = await prisma.admin.findUnique({
    where: {
      adminId: adminId,
    },
  });
  if (!user) {
    return NextResponse.json(
      { message: "Invalid Admin ID" },
      { status: 401 }
    );
  }

  if (user.password === password) {
    const token = "ctf_admin_token"; 

    
    const response = NextResponse.json({ message: "Login successful" });
    response.headers.set(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        maxAge: 60 * 60 * 24 * 7, 
        path: "/", 
      })
    );

    return response;
  }

  return NextResponse.json({ message: "Invalid password" }, { status: 401 });
}
