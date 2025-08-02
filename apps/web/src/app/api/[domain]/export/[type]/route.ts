import { createServerApiClient } from "@/trpc/server";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

const EXPORT_KEYS = {
  EXIF: "exif",
  XLSX_PARTICIPANTS: "xlsx_participants",
  XLSX_SUBMISSIONS: "xlsx_submissions",
  ZIP_CONTACT_SHEETS: "zip_contact_sheets",
} as const;

const api = createServerApiClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string; type: string }> },
) {
  try {
    const { domain, type } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";

    const marathon = await api.marathons.getByDomain.query({ domain });

    if (!marathon) {
      return NextResponse.json(
        { error: "Marathon not found" },
        { status: 404 },
      );
    }

    switch (type) {
      case EXPORT_KEYS.XLSX_SUBMISSIONS:
        return await handleSubmissionsExport(domain);

      case EXPORT_KEYS.XLSX_PARTICIPANTS:
        return await handleParticipantsExport(domain);

      case EXPORT_KEYS.EXIF:
        return await handleExifExport(domain, format);
      default:
        return NextResponse.json(
          { error: "Invalid export type" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

async function handleSubmissionsExport(domain: string) {
  const participants = await api.participants.getByDomain.query({ domain });
  const topics = await api.topics.getByDomain.query({ domain });

  const submissionsData = [];

  for (const participant of participants) {
    const submissions = await api.submissions.getByParticipantId.query({
      participantId: participant.id,
    });

    for (const submission of submissions) {
      const topic = topics.find((topic) => topic.id === submission.topicId);
      submissionsData.push({
        "Participant Reference": participant.reference,
        "Participant Name": `${participant.firstname} ${participant.lastname}`,
        Email: participant.email,
        "Competition Class": participant.competitionClass?.name || "",
        "Device Group": participant.deviceGroup?.name || "",
        Topic: topic?.name || "",
        "Submission Status": submission.status,
        "Upload Date": submission.createdAt
          ? new Date(submission.createdAt).toLocaleDateString()
          : "N/A",
        "File Size (bytes)": submission.size || 0,
        "MIME Type": submission.mimeType || "",
        "Original Key": submission.key || "",
        "Thumbnail Key": submission.thumbnailKey || "",
        "Preview Key": submission.previewKey || "",
      });
    }
  }

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(submissionsData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  // Return as downloadable file
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="submissions-export-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}

async function handleParticipantsExport(domain: string) {
  // Get all participants for this domain
  const participants = await api.participants.getByDomain.query({ domain });

  const participantsData = participants.map((participant) => ({
    Reference: participant.reference,
    "First Name": participant.firstname,
    "Last Name": participant.lastname,
    Email: participant.email,
    "Competition Class": participant.competitionClass?.name || "",
    "Device Group": participant.deviceGroup?.name || "",
    "Registration Date": participant.createdAt
      ? new Date(participant.createdAt).toLocaleDateString()
      : "",
    Status: participant.status ?? "",
    "Upload Counter": participant.uploadCount || 0,
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(participantsData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  // Return as downloadable file
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="participants-export-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}

async function handleExifExport(domain: string, format: string) {
  // Get all submission keys for the marathon
  const participants = await api.participants.getByDomain.query({ domain });
  const topics = await api.topics.getByDomain.query({ domain });

  const exifData = [];

  const submissions = participants.flatMap(
    (participant) => participant.submissions,
  );

  for (const submission of submissions) {
    if (submission.key && submission.exif) {
      const topic = topics.find((topic) => topic.id === submission.topicId);
      const participant = participants.find(
        (participant) => participant.id === submission.participantId,
      );
      exifData.push({
        submissionId: submission.id,
        participantReference: participant?.reference ?? "",
        topicName: topic?.name ?? "",
        originalKey: submission.key,
        exifData: submission.exif,
        uploadDate: submission.createdAt,
      });
    }
  }

  const responseData = {
    exportDate: new Date().toISOString(),
    totalSubmissions: exifData.length,
    submissions: exifData,
  };

  if (format === "txt") {
    // Convert to text format
    let textContent = `EXIF Data Export - ${new Date().toLocaleDateString()}\n`;
    textContent += `Total Submissions: ${exifData.length}\n\n`;

    exifData.forEach((item, index) => {
      textContent += `--- Submission ${index + 1} ---\n`;
      textContent += `Participant: ${item.participantReference}\n`;
      textContent += `Topic: ${item.topicName}\n`;
      textContent += `File: ${item.originalKey}\n`;
      textContent += `Upload Date: ${item.uploadDate}\n`;
      textContent += `EXIF Data: ${JSON.stringify(item.exifData, null, 2)}\n\n`;
    });

    return new NextResponse(textContent, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="exif-export-${new Date().toISOString().split("T")[0]}.txt"`,
      },
    });
  }

  // Default to JSON format
  return new NextResponse(JSON.stringify(responseData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="exif-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
