import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Hr,
  Tailwind,
} from "@react-email/components";

export const StaffInviteEmail = ({
  staffName,
  contestName,
  inviterName,
  loginUrl,
  supportEmail,
}: {
  staffName: string;
  contestName: string;
  inviterName: string;
  loginUrl: string;
  supportEmail: string;
}) => {
  return (
    <Html>
      <Head />
      <Preview>
        You've been added as staff to {contestName} - Access your dashboard now
      </Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[40px]">
            {/* Header */}
            <Section className="text-center mb-[32px]">
              <Heading className="text-[28px] font-bold text-gray-900 m-0 mb-[8px]">
                Welcome to the Team!
              </Heading>
              <Text className="text-[16px] text-gray-600 m-0">
                You've been added as staff to manage contest submissions
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-[32px]">
              <Text className="text-[16px] text-gray-800 mb-[16px]">
                Hi {staffName},
              </Text>

              <Text className="text-[16px] text-gray-800 mb-[16px] leading-[24px]">
                Great news! {inviterName} has added you as a staff member for
                the photography contest <strong>"{contestName}"</strong>. You
                now have access to review and verify participant submissions.
              </Text>

              <Text className="text-[16px] text-gray-800 mb-[24px] leading-[24px]">
                As a staff member, you'll be able to:
              </Text>

              <Section className="bg-gray-50 rounded-[8px] p-[20px] mb-[24px]">
                <Text className="text-[14px] text-gray-700 m-0 mb-[8px]">
                  ✓ Review and verify photo submissions
                </Text>
                <Text className="text-[14px] text-gray-700 m-0 mb-[8px]">
                  ✓ Check submission compliance with contest rules
                </Text>
                <Text className="text-[14px] text-gray-700 m-0 mb-[8px]">
                  ✓ Approve or reject entries with feedback
                </Text>
                <Text className="text-[14px] text-gray-700 m-0">
                  ✓ Access detailed submission analytics
                </Text>
              </Section>

              <Text className="text-[16px] text-gray-800 mb-[24px]">
                Click the button below to access your staff dashboard and start
                reviewing submissions:
              </Text>

              <Section className="text-center mb-[24px]">
                <Button
                  href={loginUrl}
                  className="text-white px-[32px] py-[12px] rounded-[6px] text-[16px] font-medium no-underline box-border"
                  style={{ backgroundColor: "#fe3923" }}
                >
                  Access Staff Dashboard
                </Button>
              </Section>

              <Text className="text-[14px] text-gray-600 mb-[16px]">
                If the button doesn't work, copy and paste this link into your
                browser:
              </Text>
              <Text className="text-[14px] text-blue-600 break-all mb-[24px]">
                {loginUrl}
              </Text>
            </Section>

            <Hr className="border-gray-200 my-[24px]" />

            {/* Support Section */}
            <Section className="mb-[32px]">
              <Text className="text-[14px] text-gray-600 mb-[8px]">
                Need help getting started? Our support team is here to assist
                you.
              </Text>
              <Text className="text-[14px] text-gray-600">
                Contact us at{" "}
                <Link
                  href={`mailto:${supportEmail}`}
                  className="text-blue-600 underline"
                >
                  {supportEmail}
                </Link>
              </Text>
            </Section>

            {/* Footer */}
            <Hr className="border-gray-200 my-[24px]" />
            <Section className="text-center">
              <Text className="text-[12px] text-gray-500 mb-[8px]">
                PhotoContest Platform
              </Text>
              <Text className="text-[12px] text-gray-500 m-0 mb-[8px]">
                123 Photography Lane, Creative District, Stockholm, Sweden
              </Text>
              <Text className="text-[12px] text-gray-500 m-0">
                © 2025 PhotoContest Platform. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
