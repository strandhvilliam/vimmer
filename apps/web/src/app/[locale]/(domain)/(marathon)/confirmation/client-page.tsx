"use client"

import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card"
import dynamic from "next/dynamic"
import { ConfirmationDetailsDialog } from "@/components/participate/confirmation-details-dialog"
import { ConfirmationData } from "@/lib/types"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { useDomain } from "@/contexts/domain-context"
import { Icon } from "@iconify/react"
import {
  CheckCircle2,
  Trophy,
  ArrowRight,
  MoreVertical,
  Recycle,
  Clock,
} from "lucide-react"
import { useCurrentLocale, useI18n } from "@/locales/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PrimaryButton } from "@vimmer/ui/components/primary-button"
import { Button } from "@vimmer/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@vimmer/ui/components/dropdown-menu"
import { useDesktopCountdownRedirect } from "@/hooks/use-desktop-countdown-redirect"

interface ConfirmationClientProps {
  participantRef: string
  thumbnailsBaseUrl: string
  previewsBaseUrl: string
}

const Confetti = dynamic(
  () => import("react-confetti").then((mod) => mod.default),
  {
    ssr: false,
  }
)

export function ConfirmationClient({
  participantRef,
  thumbnailsBaseUrl,
  previewsBaseUrl,
}: ConfirmationClientProps) {
  const { domain } = useDomain()
  const trpc = useTRPC()
  const t = useI18n()
  const locale = useCurrentLocale()
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState<ConfirmationData | null>(
    null
  )
  const { remainingSeconds, addSeconds } = useDesktopCountdownRedirect({
    initialSeconds: 15,
    onRedirect: () => router.push(`/${locale}/participate`),
  })

  const { data: participant } = useSuspenseQuery(
    trpc.participants.getByReference.queryOptions({
      reference: participantRef,
      domain,
    })
  )

  const { data: topics } = useSuspenseQuery(
    trpc.topics.getPublicByDomain.queryOptions({
      domain,
    })
  )

  const submissionsWithTopic =
    participant?.submissions.map((submission) => ({
      ...submission,
      topic: topics.find((topic) => topic.id === submission.topicId),
    })) ?? []

  const uploadedSubmissions = submissionsWithTopic.filter(
    (submission) => submission.status === "uploaded"
  )

  const images: ConfirmationData[] = uploadedSubmissions
    .sort((a, b) => (a.topic?.orderIndex ?? 0) - (b.topic?.orderIndex ?? 0))
    .map((submission) => ({
      id: submission.id.toString(),
      thumbnailUrl: submission.thumbnailKey
        ? `${thumbnailsBaseUrl}/${submission.thumbnailKey}`
        : undefined,
      previewUrl: submission.previewKey
        ? `${previewsBaseUrl}/${submission.previewKey}`
        : undefined,
      name:
        submission.topic?.name ||
        t("confirmation.photoPlaceholder", { id: submission.id }),
      orderIndex: submission.topic?.orderIndex ?? 0,
      exif: submission.exif as Record<string, unknown>,
    }))

  if (!participant) {
    return null
  }

  return (
    <>
      <Confetti recycle={false} numberOfPieces={300} />
      <div className="min-h-[100dvh] px-4 py-6 space-y-6 max-w-[800px] mx-auto">
        <div className="md:hidden absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">{t("confirmation.menu")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/participate`}>
                  <Recycle className="w-4 h-4" />
                  {t("confirmation.startAgain")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <AnimatePresence mode="sync">
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.6 }}
            className="text-center space-y-6 pt-8"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 relative"
              >
                <CheckCircle2 className="h-14 w-14 text-white" />
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <Trophy className="h-4 w-4 text-yellow-800" />
                </motion.div>
              </motion.div>
            </div>

            <div className="space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-rocgrotesk font-bold text-foreground"
              >
                {t("confirmation.congratulations")}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground text-lg leading-relaxed"
              >
                {t("confirmation.photosUploaded", {
                  count: uploadedSubmissions.length,
                })}
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            key="participant"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="h-full"
          >
            <Card className="h-full bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-2xl text-green-600 dark:text-green-400 font-mono font-bold">
                        #{participant.reference}
                      </p>
                      <p className=" font-medium text-green-800 dark:text-green-200">
                        {participant.firstname} {participant.lastname}
                      </p>
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="solar:bookmark-broken"
                          className="w-4 h-4 text-green-800"
                          style={{
                            transform: "rotate(-5deg)",
                          }}
                        />
                        <p className="text-sm text-green-800 dark:text-green-200">
                          {participant.deviceGroup?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="solar:camera-minimalistic-broken"
                          className="w-4 h-4 text-green-800"
                          style={{
                            transform: "rotate(-5deg)",
                          }}
                        />
                        <p className="text-sm text-green-800 dark:text-green-200">
                          {participant.competitionClass?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            key="restart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="hidden md:block h-full"
          >
            <Card className="h-full border-primary/20 flex items-center justify-center w-full bg-transparent border-none shadow-none">
              <CardContent className="items-center justify-center flex gap-8 p-0 w-full px-4">
                <PrimaryButton
                  onClick={() => router.push(`/${locale}/participate`)}
                  className="w-full py-5 text-base md:text-lg rounded-full m-0"
                >
                  {t("confirmation.newParticipant")}
                  <span className="text-white/80">
                    {t("confirmation.secondsSuffix", {
                      seconds: remainingSeconds,
                    })}
                  </span>
                </PrimaryButton>
                <Button
                  variant="outline"
                  className="rounded-full text-lg w-fit py-5 h-full"
                  onClick={() => addSeconds(30)}
                >
                  <Clock className="w-5 h-5" />
                  {t("confirmation.waitSeconds", { seconds: 30 })}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            key="photos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <CardHeader className="pb-4 px-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                {t("confirmation.yourPhotos")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 },
                  },
                }}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {images.map((image) => (
                  <motion.div
                    key={image.id}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 },
                    }}
                    className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={image.thumbnailUrl}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs bg-primary"> */}
                      {/*   {index + 1} */}
                      {/* </Badge> */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-lg text-muted-foreground">
                        #{image.orderIndex + 1}
                      </span>
                      <p className="font-medium truncate">{image.name}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            key="next-steps"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5 text-primary" />
                  {t("confirmation.whatsNext")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:px-4 px-2">
                <div className="space-y-4">
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        {t("confirmation.1")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        {t("confirmation.2")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        {t("confirmation.3", {
                          juryDate: "31/8",
                          resultsDate: "1/9",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">4</span>
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        {t("confirmation.4", {
                          prizeDate: "20/8",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
        <ConfirmationDetailsDialog
          image={selectedImage}
          open={!!selectedImage}
          onOpenChange={(open) => !open && setSelectedImage(null)}
        />
      </div>
    </>
  )
}
