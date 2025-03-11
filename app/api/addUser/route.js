import { prisma } from "../../../utils/prisma";

export async function POST(request) {
  try {
    const userData = await request.json();
    
    const {
      unique_id,
      name,
      email,
      mobile,
      fest_name,
      event_name,
      certification_type,
      achievement_level,
      date_of_issue,
      validation_status,
      date_of_validation,
    } = userData || {};
    
    // Prepare data object for either update or create
    const userData_to_process = {};
    
    if (name) userData_to_process.name = name;
    if (email) userData_to_process.email = email;
    if (achievement_level) userData_to_process.achievement_level = achievement_level;
    if (certification_type) userData_to_process.certification_type = certification_type;
    if (date_of_issue) userData_to_process.date_of_issue = new Date(date_of_issue);
    if (event_name) userData_to_process.event_name = event_name;
    if (fest_name) userData_to_process.fest_name = fest_name;
    if (mobile) userData_to_process.mobile = mobile;
    if (validation_status) userData_to_process.validation_status = validation_status;
    if (date_of_validation) userData_to_process.date_of_validation = new Date(date_of_validation);
    
    if (Object.keys(userData_to_process).length === 0) {
      return new Response(JSON.stringify({ message: "No valid fields provided" }), { status: 400 });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { unique_id },
    });
    
    let result;
    
    if (!existingUser) {
      userData_to_process.unique_id = unique_id;
      
      result = await prisma.user.create({
        data: userData_to_process,
      });
    } else {
      // Update existing user
      result = await prisma.user.update({
        where: { unique_id },
        data: userData_to_process,
      });
    }
    
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };
    
    return new Response(JSON.stringify(result), { 
      status: 200, 
      headers 
    });
    
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ 
      message: `Failed to process user data: ${error.message}` 
    }), {
      status: 500,
    });
  }
}