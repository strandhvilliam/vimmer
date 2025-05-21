import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@vimmer/supabase/server";
import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import { EXPORT_KEYS } from "@/lib/constants";

const exportCallerUrl = process.env.EXPORT_CALLER_URL;

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      domain: string;
      type: (typeof EXPORT_KEYS)[keyof typeof EXPORT_KEYS];
    }>;
  }
) {
  if (!exportCallerUrl) {
    return new NextResponse("Export caller URL not defined", { status: 500 });
  }

  const { domain, type } = await params;
  const format = request.nextUrl.searchParams.get("format") || "json";
  const supabase = await createClient();
  const marathon = await getMarathonByDomain(domain);

  if (!marathon) {
    return new NextResponse("Marathon not found", { status: 404 });
  }

  try {
    switch (type) {
      case EXPORT_KEYS.ZIP_PREVIEWS:
      case EXPORT_KEYS.ZIP_SUBMISSIONS:
      case EXPORT_KEYS.ZIP_THUMBNAILS: {
        const { data: currentExport, error: currentExportError } =
          await supabase
            .from("zipped_submissions")
            .select("*")
            .eq("marathon_id", marathon.id)
            .eq("export_type", type.split("_")[1])
            .maybeSingle();

        if (currentExportError) {
          console.error("currentExportError", currentExportError);
          return new NextResponse("Failed to get current export", {
            status: 500,
          });
        }

        if (!!currentExport && currentExport.status !== "completed") {
          return new NextResponse("Export already in progress", {
            status: 400,
          });
        }

        const { data: zippedSubmission, error: zippedSubmissionError } =
          await supabase
            .from("zipped_submissions")
            .insert({
              marathon_id: marathon.id,
              export_type: "previews",
            })
            .select()
            .single();

        if (zippedSubmissionError) {
          return new NextResponse("Failed to get zipped submission", {
            status: 500,
          });
        }

        await fetch(
          `${exportCallerUrl}?domain=${domain}&exportType=${type}&id=${zippedSubmission.id}`
        );

        const body = JSON.stringify({
          zippedSubmissionId: zippedSubmission.id,
        });

        return new NextResponse(body, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      case EXPORT_KEYS.XLSX_PARTICIPANTS: {
        const { data: participants } = await supabase
          .from("participants")
          .select(
            `
            *,
            competition_class:competition_classes (
              name
            ),
            device_group:device_groups (
              name
            )
          `
          )
          .eq("marathon_id", marathon.id);

        if (!participants) {
          return new NextResponse("No participants found", { status: 404 });
        }

        const worksheet = XLSX.utils.json_to_sheet(
          participants.map((p) => ({
            Reference: p.reference,
            Firstname: p.firstname,
            Lastname: p.lastname,
            Email: p.email,
            CompetitionClass: p.competition_class?.name,
            DeviceGroup: p.device_group?.name,
            Status: p.status,
            UploadCount: p.upload_count,
          }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
        const buffer = XLSX.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });

        return new NextResponse(buffer, {
          headers: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="participants-export-${
              new Date().toISOString().split("T")[0]
            }.xlsx"`,
          },
        });
      }

      case EXPORT_KEYS.XLSX_SUBMISSIONS: {
        const { data: submissions } = await supabase
          .from("submissions")
          .select(
            `
            *,
            participant:participants (
              reference,
              firstname,
              lastname
            ),
            topic:topics (
              name,
              order_index
            )
          `
          )
          .eq("marathon_id", marathon.id);

        if (!submissions) {
          return new NextResponse("No submissions found", { status: 404 });
        }

        const worksheet = XLSX.utils.json_to_sheet(
          submissions.map((s) => ({
            ID: s.id,
            Participant: `${s.participant.firstname} ${s.participant.lastname}`,
            Reference: s.participant.reference,
            Topic: s.topic.name,
            TopicOrder: s.topic.order_index + 1,
            Status: s.status,
            UploadedAt: s.created_at,
            Size: s.size,
            MimeType: s.mime_type,
          }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
        const buffer = XLSX.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });

        return new NextResponse(buffer, {
          headers: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="submissions-export-${
              new Date().toISOString().split("T")[0]
            }.xlsx"`,
          },
        });
      }

      case EXPORT_KEYS.EXIF: {
        const { data: submissions } = await supabase
          .from("submissions")
          .select(
            `
            *,
            participant:participants (
              reference
            ),
            topic:topics (
              order_index
            )
          `
          )
          .eq("marathon_id", marathon.id)
          .eq("status", "uploaded");

        if (!submissions) {
          return new NextResponse("No submissions found", { status: 404 });
        }

        const zip = new JSZip();

        for (const submission of submissions) {
          if (!submission.exif) continue;

          const path = `exif/${domain}/${submission.participant.reference}/${String(
            submission.topic.order_index + 1
          ).padStart(2, "0")}/${submission.participant.reference}_${String(
            submission.topic.order_index + 1
          ).padStart(2, "0")}.${format}`;

          const content =
            format === "json"
              ? JSON.stringify(submission.exif, null, 2)
              : Object.entries(submission.exif)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join("\n");

          zip.file(path, content);
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        return new NextResponse(zipBlob, {
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="exif-export-${
              new Date().toISOString().split("T")[0]
            }.zip"`,
          },
        });
      }

      default:
        return new NextResponse("Invalid export type", { status: 400 });
    }
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Export failed", { status: 500 });
  }
}
