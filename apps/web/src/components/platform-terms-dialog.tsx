import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@vimmer/ui/components/dialog"
import { X } from "lucide-react"
import React from "react"
import { PrimaryButton } from "@vimmer/ui/components/primary-button"
import { useI18n } from "@/locales/client"

export default function PlatformTermsDialog({
  termsOpen,
  setTermsOpen,
  termsAccepted: _termsAccepted,
  setTermsAccepted,
}: {
  termsOpen: boolean
  setTermsOpen: (open: boolean) => void
  termsAccepted: boolean
  setTermsAccepted: (accepted: boolean) => void
}) {
  const t = useI18n()
  return (
    <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
      <DialogContent className="max-w-none w-full h-[100dvh] p-0 rounded-none flex flex-col overflow-hidden">
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setTermsOpen(false)}
            className="h-10 w-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl">
                {t("platformTerms.title")}
              </DialogTitle>
              <DialogDescription className="text-lg">
                {t("platformTerms.description")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 pb-24">
              <p>
                Dessa villkor gäller mellan deltagaren vars uppgifter läggs in i
                detta system och Fotomaraton Sverige AB (559209-9732)
                (hädanefter benämnd Arrangören).
              </p>
              <p>
                Dessa villkor är förtydligande och tillägg till arrangörens
                övriga villkor som gäller för deltagandet.
              </p>
              <p>
                Dessa finns tillgängliga att läsa på{" "}
                <a
                  className="text-blue-500 underline"
                  href="https://stockholmfotomaraton.se/allmanna-villkor"
                >
                  stockholmfotomaraton.se/allmanna-villkor
                </a>
                .
              </p>
              <p className="font-medium pt-4">1. Personuppgifter</p>
              <p>
                Personuppgifter kan innebära, men är inte begränsat till, för-
                och efternamn, mailadress, eventuell platsinformation i
                metadatan, personuppgifter som finns i bilderna inklusive dess
                metadata.
              </p>
              <ul className="list-disc pl-6">
                <li>
                  Genom anmälan godkänner deltagaren att Arrangören hanterar de
                  personuppgifter som deltagaren eller representant för
                  deltagaren (den som lämnar in i detta system) har lagt in.
                </li>
                <li>
                  Den som fyller i åt annan person är skyldig att informera och
                  inhämta godkännande att uppgifterna används enligt dessa
                  villkor av denna person.
                </li>
                <li>
                  Deltagaren godkänner att ta emot information från Arrangören
                  om de evenemang som genomförs av Arrangören.
                </li>
                <li>
                  Deltagaren godkänner att bilder och filmer på hen får användas
                  i Arrangörens och partners marknadsföring kring arrangemang
                  arrangerade av eller i partnerskap med Arrangören.
                </li>
              </ul>

              <p className="font-medium pt-4">2. Om deltagarens bilder</p>
              <ul className="list-disc pl-6">
                <li>
                  Deltagande i tävlingen ger arrangören tillstånd att lagra,
                  använda och publicera deltagarens bilder i samband med dess
                  utställningar (i alla medier, tryckta, digitala etc), på sin
                  hemsida, sociala medier och marknadsföring.
                </li>
                <li>
                  Deltagande i tävlingen ger arrangören tillstånd att dela
                  bilder med Arrangörens partners, vilka i sina kanaler (både
                  fysiska och digitala) får möjlighet att visa upp deltagande
                  bilder i sammanhang där det framgår att det handlar om bidrag
                  till tävlingen Stockholm Fotomaraton. Bilderna får ej användas
                  i Arrangörens partners marknadsföring, utom när det handlar om
                  att visa upp Stockholm Fotomaraton eller deras samarbete med
                  Stockholm Fotomaraton.
                </li>
                <li>
                  Deltagaren ansvarar för att säkerställa godkännande för
                  användning av bilderna enligt tävlingens regler, av personer
                  som är identifierbara på bild samt att hen äger rättigheterna
                  till bilderna.
                </li>
                <li>
                  Deltagare under 18 år ska ha målsmans underskrift för
                  deltagande. Underskriften ska på begäran kunna visas i samband
                  med start.
                </li>
              </ul>

              <p className="font-medium pt-4">3. Vinst och jury</p>
              <ul className="list-disc pl-6">
                <li>Juryns beslut kan ej överklagas.</li>
                <li>Eventuell vinstskatt betalas av vinnaren.</li>
              </ul>

              <p className="font-medium pt-4">
                4. Regler och villkor, inkl ändring av dessa
              </p>
              <ul className="list-disc pl-6">
                <li>
                  Alla deltagare måste ta del av och följa tävlingens, vid var
                  tid gällande, regler. Arrangören har alltid tolkningsföreträde
                  gällande hur tävlingens regler och villkor bedöms vid
                  diskussioner om exempelvis vilka funktioner på en kamera eller
                  telefon som är godkända att tävla med.
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t">
          <div className="max-w-4xl mx-auto">
            <PrimaryButton
              onClick={() => {
                setTermsAccepted(true)
                setTermsOpen(false)
              }}
              className="w-full py-2.5 rounded-full text-lg font-medium"
              disabled={_termsAccepted}
            >
              {t("platformTerms.accept")}
            </PrimaryButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
