"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Button } from "@vimmer/ui/components/button";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

interface SponsorsClientPageProps {
  baseUrl: string;
  domain: string;
}

type SponsorType =
  | "contact-sheets"
  | "participant-initial"
  | "participant-success";
type SponsorPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

export function SponsorsClientPage({
  domain,
  baseUrl,
}: SponsorsClientPageProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: marathon } = useSuspenseQuery(
    trpc.marathons.getByDomain.queryOptions({ domain }),
  );

  const { data: sponsors } = useSuspenseQuery(
    trpc.sponsors.getByMarathon.queryOptions({ marathonId: marathon.id }),
  );

  const { mutateAsync: generateUploadUrl } = useMutation(
    trpc.sponsors.generateUploadUrl.mutationOptions(),
  );

  const { mutate: createSponsor } = useMutation(
    trpc.sponsors.create.mutationOptions({
      onSuccess: () => {
        toast.success("Sponsor image uploaded successfully");
        queryClient.invalidateQueries({
          queryKey: trpc.sponsors.pathKey(),
        });
      },
    }),
  );

  const handleFileUpload = async (file: File, type: SponsorType) => {
    try {
      setUploading(`${type}`);

      const { url, key } = await generateUploadUrl({
        marathonId: marathon.id,
        domain,
        type,
        position: "bottom-right",
      });

      try {
        // Upload file to S3
        const response = await fetch(url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to upload file");
        }

        // Create sponsor record
        createSponsor({
          marathonId: marathon.id,
          type,
          key,
          position: "bottom-right",
        });
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload file to S3");
        setUploading(null);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload sponsor image");
      setUploading(null);
    } finally {
      setUploading(null);
    }
  };

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: SponsorType,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file, type);
    }
  };

  const getSponsorImage = (type: string) => {
    return sponsors
      .filter((s) => s.type === type)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .at(-1);
  };

  const SponsorCard = ({
    title,
    description,
    type,
    disabled = false,
    baseUrl,
  }: {
    title: string;
    description: string;
    type: SponsorType;
    disabled?: boolean;
    baseUrl: string;
  }) => {
    const sponsor = getSponsorImage(type);
    const isUploading = uploading === type;

    return (
      <Card className={disabled ? "opacity-50" : ""}>
        <CardHeader className="space-y-0">
          <CardTitle className="flex items-center gap-2 text-lg font-rocgrotesk">
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sponsor ? (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <img
                src={`${baseUrl}/${sponsor.key}`}
                alt="Sponsor"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                <p>No image selected</p>
              </div>
            </div>
          )}

          {disabled ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Coming Soon...</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                variant="outline"
                disabled={isUploading}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e) => handleFileSelect(e as any, type);
                  input.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading
                  ? "Uploading..."
                  : sponsor
                    ? "Replace Image"
                    : "Upload Image"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container max-w-[1400px] mx-auto py-8">
      <div className="flex flex-col mb-8 gap-1">
        <h1 className="text-2xl font-semibold font-rocgrotesk">Sponsors</h1>
        <p className="text-muted-foreground text-sm">
          Upload and manage sponsor images to be placed in the submission flow
          for the partiicipants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SponsorCard
          title="Contact Sheets"
          description="Sponsor image displayed on contact sheets"
          type="contact-sheets"
          baseUrl={baseUrl}
        />

        <SponsorCard
          title="Participant Initial Page"
          description="Sponsor image shown on the app initial page"
          type="participant-initial"
          disabled
          baseUrl={baseUrl}
        />

        <SponsorCard
          title="Participant Success Page"
          description="Sponsor image shown on the app success page"
          type="participant-success"
          disabled
          baseUrl={baseUrl}
        />
      </div>
    </div>
  );
}
