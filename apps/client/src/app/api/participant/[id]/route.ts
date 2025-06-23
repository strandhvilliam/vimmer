import { createClient } from "@vimmer/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const participantId = parseInt(id, 10);

    if (isNaN(participantId)) {
      return Response.json(
        { error: "Invalid participant ID" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: participant, error } = await supabase
      .from("participants")
      .select("*")
      .eq("id", participantId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching participant:", error);
      return Response.json(
        { error: "Failed to fetch participant" },
        { status: 500 }
      );
    }

    if (!participant) {
      return Response.json({ error: "Participant not found" }, { status: 404 });
    }

    return Response.json(participant);
  } catch (error) {
    console.error("Participant fetch error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
