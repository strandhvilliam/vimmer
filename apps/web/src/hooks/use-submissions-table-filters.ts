"use client";

import { useState, useMemo } from "react";
import {
  CompetitionClass,
  DeviceGroup,
  Participant,
  ValidationResult,
} from "@vimmer/api/db/types";

type TableRowParticipant = Participant & {
  validationResults: ValidationResult[];
  competitionClass?: CompetitionClass | null;
  deviceGroup?: DeviceGroup | null;
};

interface UseSubmissionsTableFiltersProps {
  participants: TableRowParticipant[];
}

export function useSubmissionsTableFilters({
  participants,
}: UseSubmissionsTableFiltersProps) {
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [classFilters, setClassFilters] = useState<string[]>([]);
  const [deviceFilters, setDeviceFilters] = useState<string[]>([]);
  const [issueFilters, setIssueFilters] = useState<string[]>([]);

  // Get unique values for filters
  const uniqueStatuses = useMemo(
    () =>
      Array.from(new Set(participants.map((p) => p.status).filter(Boolean))),
    [participants],
  );

  const uniqueClasses = useMemo(
    () =>
      Array.from(
        new Set(
          participants.map((p) => p.competitionClass?.name).filter(Boolean),
        ),
      ),
    [participants],
  );

  const uniqueDevices = useMemo(
    () =>
      Array.from(
        new Set(participants.map((p) => p.deviceGroup?.name).filter(Boolean)),
      ),
    [participants],
  );

  const issueTypes = ["Has Errors", "Has Warnings", "No Issues"];

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return participants.filter((participant) => {
      // Status filter
      if (
        statusFilters.length > 0 &&
        !statusFilters.includes(participant.status)
      ) {
        return false;
      }

      // Class filter
      if (
        classFilters.length > 0 &&
        !classFilters.includes(participant.competitionClass?.name || "")
      ) {
        return false;
      }

      // Device filter
      if (
        deviceFilters.length > 0 &&
        !deviceFilters.includes(participant.deviceGroup?.name || "")
      ) {
        return false;
      }

      // Issue filter
      if (issueFilters.length > 0) {
        const failedResults =
          participant.validationResults?.filter(
            (r) => r.outcome === "failed",
          ) || [];
        const hasErrors = failedResults.some((r) => r.severity === "error");
        const hasWarnings = failedResults.some((r) => r.severity === "warning");
        const hasNoIssues = failedResults.length === 0;

        const matchesFilter = issueFilters.some((filter) => {
          if (filter === "Has Errors" && hasErrors) return true;
          if (filter === "Has Warnings" && hasWarnings && !hasErrors)
            return true;
          if (filter === "No Issues" && hasNoIssues) return true;
          return false;
        });

        if (!matchesFilter) return false;
      }

      return true;
    });
  }, [participants, statusFilters, classFilters, deviceFilters, issueFilters]);

  const activeFilterCount =
    statusFilters.length +
    classFilters.length +
    deviceFilters.length +
    issueFilters.length;

  const clearAllFilters = () => {
    setStatusFilters([]);
    setClassFilters([]);
    setDeviceFilters([]);
    setIssueFilters([]);
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const toggleClassFilter = (className: string) => {
    setClassFilters((prev) =>
      prev.includes(className)
        ? prev.filter((c) => c !== className)
        : [...prev, className],
    );
  };

  const toggleDeviceFilter = (deviceName: string) => {
    setDeviceFilters((prev) =>
      prev.includes(deviceName)
        ? prev.filter((d) => d !== deviceName)
        : [...prev, deviceName],
    );
  };

  const toggleIssueFilter = (issueType: string) => {
    setIssueFilters((prev) =>
      prev.includes(issueType)
        ? prev.filter((i) => i !== issueType)
        : [...prev, issueType],
    );
  };

  return {
    // Filtered data
    filteredData,

    // Filter states
    statusFilters,
    classFilters,
    deviceFilters,
    issueFilters,

    // Unique values for dropdowns
    uniqueStatuses,
    uniqueClasses,
    uniqueDevices,
    issueTypes,

    // Helper values
    activeFilterCount,

    // Actions
    toggleStatusFilter,
    toggleClassFilter,
    toggleDeviceFilter,
    toggleIssueFilter,
    clearAllFilters,
  };
}
