"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  Marathon,
  CompetitionClass,
  DeviceGroup,
  RuleConfig,
} from "@vimmer/supabase/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { completeOnboardingAction } from "../_actions/complete-onboarding-action";

interface OnboardingData {
  marathonConfig: Partial<Marathon>;
  competitionClasses: CompetitionClass[];
  deviceGroups: DeviceGroup[];
  validationRules: RuleConfig[];
}

interface OnboardingContextType {
  marathon: Marathon;
  data: OnboardingData;
  isCompleting: boolean;
  updateMarathonConfig: (config: Partial<Marathon>) => void;
  addCompetitionClass: (competitionClass: CompetitionClass) => void;
  removeCompetitionClass: (id: number) => void;
  addDeviceGroup: (deviceGroup: DeviceGroup) => void;
  removeDeviceGroup: (id: number) => void;
  updateValidationRules: (rules: RuleConfig[]) => void;
  completeOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

interface OnboardingProviderProps {
  marathon: Marathon;
  children: ReactNode;
}

export function OnboardingProvider({
  marathon,
  children,
}: OnboardingProviderProps) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    marathonConfig: {
      name: marathon.name,
      description: marathon.description,
      logoUrl: marathon.logoUrl,
      startDate: marathon.startDate,
      endDate: marathon.endDate,
    },
    competitionClasses: [],
    deviceGroups: [],
    validationRules: [],
  });

  const updateMarathonConfig = (config: Partial<Marathon>) => {
    setData((prev) => ({
      ...prev,
      marathonConfig: { ...prev.marathonConfig, ...config },
    }));
  };

  const addCompetitionClass = (competitionClass: CompetitionClass) => {
    setData((prev) => ({
      ...prev,
      competitionClasses: [...prev.competitionClasses, competitionClass],
    }));
  };

  const removeCompetitionClass = (id: number) => {
    setData((prev) => ({
      ...prev,
      competitionClasses: prev.competitionClasses.filter((cc) => cc.id !== id),
    }));
  };

  const addDeviceGroup = (deviceGroup: DeviceGroup) => {
    setData((prev) => ({
      ...prev,
      deviceGroups: [...prev.deviceGroups, deviceGroup],
    }));
  };

  const removeDeviceGroup = (id: number) => {
    setData((prev) => ({
      ...prev,
      deviceGroups: prev.deviceGroups.filter((dg) => dg.id !== id),
    }));
  };

  const updateValidationRules = (rules: RuleConfig[]) => {
    setData((prev) => ({
      ...prev,
      validationRules: rules,
    }));
  };

  const completeOnboarding = async () => {
    setIsCompleting(true);

    try {
      const transformedData = {
        marathonConfig: {
          name: data.marathonConfig.name || undefined,
          description: data.marathonConfig.description || undefined,
          logoUrl: data.marathonConfig.logoUrl || undefined,
          startDate: data.marathonConfig.startDate || undefined,
          endDate: data.marathonConfig.endDate || undefined,
        },
        competitionClasses: data.competitionClasses.map((cc) => ({
          name: cc.name,
          description: cc.description || undefined,
          numberOfPhotos: cc.numberOfPhotos,
          topicStartIndex: cc.topicStartIndex || 0,
        })),
        deviceGroups: data.deviceGroups.map((dg) => ({
          name: dg.name,
          description: dg.description || undefined,
          icon: dg.icon || "camera",
        })),
        validationRules: data.validationRules.map((rule) => ({
          ruleKey: rule.ruleKey,
          severity: rule.severity as "warning" | "error",
          params: rule.params,
        })),
      };

      const result = await completeOnboardingAction(transformedData);

      if (result?.data?.success) {
        toast.success("Marathon setup completed successfully!");
        router.push(`/${marathon.domain}/dashboard`);
      } else {
        throw new Error("Failed to complete setup");
      }
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      toast.error("Failed to complete setup. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  const value: OnboardingContextType = {
    marathon,
    data,
    isCompleting,
    updateMarathonConfig,
    addCompetitionClass,
    removeCompetitionClass,
    addDeviceGroup,
    removeDeviceGroup,
    updateValidationRules,
    completeOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
