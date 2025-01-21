import {  NextResponse } from "next/server";
import { prisma } from "../../../utils/prisma";



export async function POST(req) {
  try {
    const { generatedIDs } = await req.json(); 

    if (!generatedIDs || !Array.isArray(generatedIDs) || generatedIDs.length === 0) {
      return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
    }

    
    await Promise.all(
      generatedIDs.map((genId) =>
        prisma.user.create({
          data: {
            unique_id: genId.unique_id, 
            name: null, 
            email: null, 
            mobile: null, 
            fest_name: null, 
            event_name: null, 
            certification_type: null, 
            achievement_level: null, 
            date_of_issue: null, 
            date_of_validation: null, 
          },
        })
      )
    );

    return NextResponse.json({ message: "Users created successfully" }, { status: 201 });
  } catch (error) {
    
    return NextResponse.json({ message: `Server Error ${error instanceof Error ? error.message : error}` }, { status: 500 });
  }
}







