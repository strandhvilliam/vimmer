"use client";

import {
  CompetitionClass,
  DeviceGroup,
  Participant,
  Submission,
  ValidationResult,
} from "@vimmer/supabase/types";
import { ReactNode, useContext } from "react";
import { createContext } from "react";

type DashboardContextType = {
  competitionClassesPromise: Promise<CompetitionClass[]>;
  deviceGroupsPromise: Promise<DeviceGroup[]>;
  participantsPromise: Promise<
    (Participant & {
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
      validationResults: ValidationResult[];
    })[]
  >;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboardData(): DashboardContextType {
  let context = useContext(DashboardContext);
  if (context === null) {
    throw new Error("useDashboardData must be used within a UserProvider");
  }
  return context;
}

export function DashboardProvider({
  competitionClassesPromise,
  deviceGroupsPromise,
  participantsPromise,
  children,
}: {
  competitionClassesPromise: Promise<CompetitionClass[]>;
  deviceGroupsPromise: Promise<DeviceGroup[]>;
  participantsPromise: Promise<
    (Participant & {
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
      validationResults: ValidationResult[];
    })[]
  >;
  children: ReactNode;
}) {
  const value = {
    competitionClassesPromise,
    deviceGroupsPromise,
    participantsPromise,
  };
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
