import { createClient } from "@vimmer/supabase/server";
import { LanguageSelectionPage } from "./client-page";
import { getMarathonWithConfigByDomain } from "@vimmer/supabase/queries";

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

export default async function SetupPage() {
  return <LanguageSelectionPage />;
}
