import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface JuryReviewEmailProps {
  juryName: string;
  competitionName: string;
  reviewDeadline: string;
  reviewUrl: string;
  description: string;
  specificTopic: string;
  competitionGroup: string;
}

export const JuryReviewEmail = (props: JuryReviewEmailProps) => {
  const {
    juryName,
    competitionName,
    reviewDeadline,
    reviewUrl,
    description,
    specificTopic,
    competitionGroup,
  } = props;

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Review submissions for {competitionName}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[32px]">
            <Section>
              <Heading className="text-[28px] font-bold text-gray-900 mb-[24px] text-center">
                Review Submissions for {competitionName}
              </Heading>

              <Text className="text-[16px] text-gray-700 mb-[16px]">
                Dear {juryName},
              </Text>

              <Text className="text-[16px] text-gray-700 mb-[16px] leading-[24px]">
                Thank you for serving as a jury member for{" "}
                <strong>{competitionName}</strong>.
              </Text>

              {description && (
                <Section className="bg-blue-50 p-[20px] rounded-[8px] mb-[24px] border-l-[4px] border-blue-500">
                  <Text className="text-[16px] text-gray-800 mb-[0px] leading-[24px]">
                    {description}
                  </Text>
                </Section>
              )}
              {(specificTopic || competitionGroup) && (
                <Section className="bg-yellow-50 p-[20px] rounded-[8px] mb-[24px]">
                  <Heading className="text-[18px] font-semibold text-gray-900 mb-[12px]">
                    Your Review Assignment
                  </Heading>
                  {specificTopic && (
                    <Text className="text-[14px] text-gray-700 mb-[8px] m-0">
                      <strong>Focus Topic:</strong> {specificTopic}
                    </Text>
                  )}
                  {competitionGroup && (
                    <Text className="text-[14px] text-gray-700 m-0">
                      <strong>Competition Group:</strong> {competitionGroup}
                    </Text>
                  )}
                </Section>
              )}

              <Section className="text-center mb-[32px]">
                <Button
                  href={reviewUrl}
                  className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border inline-block"
                >
                  Start Reviewing Submissions
                </Button>
              </Section>

              <Section className="bg-gray-50 p-[24px] rounded-[8px] mb-[24px]">
                <Heading className="text-[18px] font-semibold text-gray-900 mb-[16px]">
                  Review Guidelines
                </Heading>
                <Text className="text-[14px] text-gray-700 mb-[8px] m-0">
                  • Rate each submission on technical excellence, creativity,
                  and composition
                </Text>
                <Text className="text-[14px] text-gray-700 mb-[8px] m-0">
                  • Complete your review by <strong>{reviewDeadline}</strong>
                </Text>
                <Text className="text-[14px] text-gray-700 m-0">
                  • Contact support if you encounter any technical issues
                </Text>
              </Section>

              <Text className="text-[16px] text-gray-700 mb-[16px] leading-[24px]">
                Your expertise and time are invaluable to making this
                competition a success. If you have any questions about the
                review process or need technical assistance, please don't
                hesitate to reach out to our support team.
              </Text>

              <Text className="text-[16px] text-gray-700 mb-[32px]">
                Best regards,
                <br />
                The {competitionName} Team
              </Text>
            </Section>

            <Section className="border-t border-gray-200 pt-[24px]">
              <Text className="text-[12px] text-gray-500 text-center mb-[8px] m-0">
                Vimmer
              </Text>
              <Text className="text-[12px] text-gray-500 text-center m-0">
                © {new Date().getFullYear()} Vimmer
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

// JuryReviewEmail.PreviewProps = {
//   juryName: "Sarah Johnson",
//   competitionName: "Nordic Nature Photography Awards 2025",
//   submissionCount: "247",
//   reviewDeadline: "June 15, 2025",
//   reviewUrl: "https://photocompetition.com/jury/review",
//   description:
//     "This round focuses on evaluating the artistic vision and storytelling elements in wildlife photography. Please pay special attention to how photographers capture emotion and narrative in their subjects.",
//   specificTopic: "Wildlife Photography - Emotional Storytelling",
//   competitionGroup: "Professional Category - Advanced Level",
// };
