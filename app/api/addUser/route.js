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

    const existingUser = await prisma.user.findUnique({
      where: { unique_id },
    });

    if (!existingUser) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    const dataToUpdate = {};

    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (achievement_level) dataToUpdate.achievement_level = achievement_level;
    if (certification_type) dataToUpdate.certification_type = certification_type;
    if (date_of_issue) dataToUpdate.date_of_issue = new Date(date_of_issue);
    if (event_name) dataToUpdate.event_name = event_name;
    if (fest_name) dataToUpdate.fest_name = fest_name;
    if (mobile) dataToUpdate.mobile = mobile;
    if (validation_status) dataToUpdate.validation_status = validation_status;
    if (date_of_validation) dataToUpdate.date_of_validation = new Date(date_of_validation);

    if (Object.keys(dataToUpdate).length === 0) {
      return new Response(JSON.stringify({ message: "No valid fields to update" }), { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { unique_id },
      data: dataToUpdate,
    });

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    return new Response(JSON.stringify(updatedUser), { status: 200, headers });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: `Failed to update user data: ${error.message}` }), {
      status: 500,
    });
  }
}
