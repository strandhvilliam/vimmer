import { LanguageSelectionPage } from "./client-page";

type Marathon = {
  id: number;
  domain: string;
  name: string;
  logoImageUrl: string;
  start: string;
  end: string;
  equipmentGroups: { id: number; name: string; icon: string }[];
  config: {
    defaultLocale: string;
    locales: string[];
    allowedFileTypes: string[];
    allowReOrderImages: boolean;
    allowMultipleDevices: boolean;
    strictTimestampOrdering: boolean;
  };
  competitionClasses: {
    id: number;
    name: string;
    maxImages: number;
    minImages: number;
    topicsStartIndex: number;
  }[];
  deviceGroups: {
    id: number;
    name: string;
    icon: string;
  };
  topics: {
    id: number;
    name: string;
    description?: string;
    startTimeStamp?: string;
    endTimeStamp?: string;
  }[];
};

const getMarathon = async (id: number): Promise<Marathon> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return {
    id,
    domain: "marathon",
    name: "Marathon",
    logoImageUrl: "https://example.com/logo.png",
    start: "2022-01-01T00:00:00Z",
    end: "2022-01-02T00:00:00Z",
    equipmentGroups: [
      { id: 1, name: "Group 1", icon: "https://example.com/icon1.png" },
      { id: 2, name: "Group 2", icon: "https://example.com/icon2.png" },
    ],
    config: {
      defaultLocale: "en",
      locales: ["en", "fr"],
      allowedFileTypes: ["jpg", "jpeg", "png"],
      allowReOrderImages: true,
      allowMultipleDevices: true,
      strictTimestampOrdering: true,
    },
    competitionClasses: [
      {
        id: 1,
        name: "Class 1",
        maxImages: 5,
        minImages: 3,
        topicsStartIndex: 0,
      },
      {
        id: 2,
        name: "Class 2",
        maxImages: 5,
        minImages: 3,
        topicsStartIndex: 5,
      },
    ],
    deviceGroups: {
      id: 1,
      name: "Group 1",
      icon: "https://example.com/icon1.png",
    },
    topics: [
      { id: 1, name: "Topic 1" },
      { id: 2, name: "Topic 2" },
    ],
  };
};

export default async function SetupPage() {
  const marathon = await getMarathon(1);
  return <LanguageSelectionPage marathon={marathon} />;
}
