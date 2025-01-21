// For update the details using given unique id
import {  NextResponse } from "next/server";
import { prisma } from "../../../utils/prisma";

export async function POST(req) {
  try {
    const { adminId, newPassword } = await req.json();
    if (!adminId || !newPassword) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }
    const passwordUpdated = await prisma.admin.update({
      where: {
        adminId: adminId, 
      },
      data: {
        password: newPassword, 
      },
    });

    if (passwordUpdated) {
      return NextResponse.json({ message: "Password Updated" }, { status: 200 });
    }
    return NextResponse.json({ message: "Password update failed" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ message: `Server Error ${error instanceof Error ? error.message : error}` }, { status: 500 });
  }
}
