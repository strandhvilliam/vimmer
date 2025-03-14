import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "edge";

const validContentTypes = ["topics", "submissions"] as const;

const RevalidateSchema = z.object({
  type: z.enum(validContentTypes, {
    required_error: "Content type is required",
    invalid_type_error: "Invalid content type",
  }),
  domains: z.array(z.string().min(1, "Domain cannot be empty")),
});

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const domains = searchParams.get("domains")?.split(",");
    const secret = searchParams.get("secret");

    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    const validationResult = RevalidateSchema.safeParse({ type, domains });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid parameters",
          errors: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { type: validatedType, domains: validatedDomains } =
      validationResult.data;

    validatedDomains.forEach((domain) => {
      revalidateTag(`${validatedType}-${domain}`);
    });

    return NextResponse.json(
      {
        revalidated: true,
        type: validatedType,
        domains: validatedDomains,
        timestamp: Date.now(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error during revalidation",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
