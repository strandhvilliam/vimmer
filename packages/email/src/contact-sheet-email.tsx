import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Tailwind,
  Img,
  Button,
  Link,
} from "@react-email/components";

interface ContactSheetEmailProps {
  participantName: string;
  marathonName: string;
  participantReference: string;
  replyToEmail: string;
  marathonLogoUrl?: string;
}

export const ContactSheetEmail = ({
  participantName = "Participant",
  marathonName = "Photo Marathon",
  participantReference = "XXXX",
  replyToEmail = "support@blikka.app",
  marathonLogoUrl,
}: ContactSheetEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>Your contact sheet from {marathonName} is ready!</Preview>
        <Body
          className="font-sans py-[40px]"
          style={{ backgroundColor: "#ececec" }}
        >
          <Container
            className="rounded-[8px] shadow-lg max-w-[600px] mx-auto"
            style={{ backgroundColor: "#fcfcfc" }}
          >
            {/* Header with Two Logos */}
            <Section
              className="rounded-t-[8px] px-[40px] py-[32px] text-center"
              style={{ backgroundColor: "#fcfcfc" }}
            >
              {/* Logo Container */}
              <table
                width="100%"
                cellPadding="0"
                cellSpacing="0"
                style={{ marginBottom: "24px" }}
              >
                <tr>
                  <td align="right" valign="middle" style={{ width: "50%" }}>
                    {/* Marathon Logo */}
                    {marathonLogoUrl && (
                      <Img
                        src="https://vimmer-production-contactsheetsbucketbucket-sswnzfxo.s3.eu-north-1.amazonaws.com/blikka-logo.png"
                        alt="Blikka App Logo"
                        className="w-[120px] h-auto object-contain pr-[20px]"
                      />
                    )}
                  </td>
                  <td align="left" valign="middle" style={{ width: "50%" }}>
                    {/* Platform Logo (Blikka App) */}
                    <Img
                      src={marathonLogoUrl}
                      alt={marathonName + " Logo"}
                      className="w-[120px] h-auto object-contain pl-[20px]"
                    />
                  </td>
                </tr>
              </table>

              {/* Marathon Name */}
              <Heading
                className="text-[28px] font-bold m-0"
                style={{ color: "#1c1c1c" }}
              >
                {marathonName}
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="px-[40px] pb-[32px]">
              <Heading
                className="text-[16px] font-bold mb-[24px] mt-0"
                style={{ color: "#1c1c1c" }}
              >
                Hey{" "}
                <strong>
                  {participantName} ({String(Number(participantReference))})
                </strong>
                , your contact sheet is ready! 📸
              </Heading>

              {/* Prominent Attachment Notice */}
              <Section
                className="rounded-[8px] px-[24px] py-[20px] mb-[24px] text-center"
                style={{
                  backgroundColor: "#f0f9ff",
                  border: "2px solid #0ea5e9",
                }}
              >
                <Text
                  className="text-[18px] font-bold leading-[24px] mb-[8px]"
                  style={{ color: "#0c4a6e" }}
                >
                  📎 Your Contact Sheet is Attached!
                </Text>
                <Text
                  className="text-[16px] leading-[22px] mb-[0px]"
                  style={{ color: "#0c4a6e" }}
                >
                  Please check the attachment to view your contact sheet.
                </Text>
              </Section>

              <Text
                className="text-[16px] leading-[24px] mb-[20px]"
                style={{ color: "#1c1c1c" }}
              >
                Thank you for participating! We're excited to share that your
                contact sheet has been generated.
              </Text>

              {/* <Text
                className="text-[16px] leading-[24px] mb-[20px]"
                style={{ color: "#1c1c1c" }}
              >
                The contact sheet contains a comprehensive overview of all
                submitted photos, beautifully arranged in a professional layout.
                This serves as both a keepsake of your participation and a
                reference for the judging process.
              </Text> */}

              {/* <Text
                className="text-[16px] leading-[24px] mb-[32px]"
                style={{ color: "#1c1c1c" }}
              >
                <strong>What's included:</strong>
              </Text>

              <Text
                className="text-[16px] leading-[24px] mb-[8px] ml-[20px]"
                style={{ color: "#1c1c1c" }}
              >
                • All your submitted photographs in high quality
              </Text>
              <Text
                className="text-[16px] leading-[24px] mb-[8px] ml-[20px]"
                style={{ color: "#1c1c1c" }}
              >
                • Professional contact sheet layout
              </Text>
              <Text
                className="text-[16px] leading-[24px] mb-[8px] ml-[20px]"
                style={{ color: "#1c1c1c" }}
              >
                • Photo metadata and submission details
              </Text>
              <Text
                className="text-[16px] leading-[24px] mb-[32px] ml-[20px]"
                style={{ color: "#1c1c1c" }}
              >
                • Competition reference number
              </Text> */}

              {/* <Text
                className="text-[16px] leading-[24px] mb-[32px]"
                style={{ color: "#1c1c1c" }}
              >
                Winners will be announced within the next two weeks via email
                and on our website. Thank you for sharing your creative vision
                with us!
              </Text> */}

              {/* Contact Button - Smaller */}
              <Section className="text-center mb-[24px]">
                <Button
                  href={`mailto:${replyToEmail}`}
                  className="px-[20px] py-[10px] rounded-[6px] text-[14px] font-medium no-underline box-border"
                  style={{ backgroundColor: "#fe3923", color: "#fcfcfc" }}
                >
                  Questions? Contact Us
                </Button>
              </Section>

              <Text
                className="text-[14px] leading-[20px] text-center"
                style={{ color: "#1c1c1c", opacity: "0.7" }}
              >
                If you have any questions about your submission or the
                competition process, don't hesitate to reach out!
              </Text>
            </Section>

            {/* Footer */}
            <Section
              className="px-[40px] py-[24px] rounded-b-[8px] border-t border-solid border-opacity-10"
              style={{
                backgroundColor: "#ececec",
                borderColor: "#1c1c1c",
              }}
            >
              <Text
                className="text-[12px] leading-[16px] text-center m-0 mb-[8px]"
                style={{ color: "#1c1c1c", opacity: "0.7" }}
              >
                Blikka App - Stockholm Fotomaraton
              </Text>
              <Text
                className="text-[12px] leading-[16px] text-center m-0 mb-[8px]"
                style={{ color: "#1c1c1c", opacity: "0.7" }}
              >
                {replyToEmail}
              </Text>
              {/* <Text
                className="text-[12px] leading-[16px] text-center m-0"
                style={{ color: "#1c1c1c", opacity: "0.7" }}
              >
                <Link
                  href="#"
                  className="no-underline"
                  style={{ color: "#fe3923" }}
                >
                  Unsubscribe
                </Link>{" "}
                | © 2025 Blikka App
              </Text> */}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
