import { NextResponse } from "next/server";
import { competitionClassSchema } from "@/lib/types/competition-class";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = competitionClassSchema.parse(json);

    // TODO: Save competition class to database
    // For now, we'll just return the validated data
    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid competition class data" },
      { status: 400 }
    );
  }
}
