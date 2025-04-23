import { subDays, addDays } from "date-fns";

export interface ValidationResult {
  id: number;
  participantId: number;
  ruleKey: string;
  severity: string;
  message: string;
  outcome: string;
  fileName?: string | null;
  createdAt: string;
}

export interface Marathon {
  id: number;
  name: string;
  description: string | null;
  domain: string;
  start_date: string | null;
  end_date: string | null;
  languages: string;
  logo_url: string | null;
}

export interface DeviceGroup {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  marathon_id: number;
}

export interface CompetitionClass {
  id: number;
  name: string;
  description: string | null;
  marathon_id: number;
  number_of_photos: number;
}

export interface Participant {
  id: number;
  marathon_id: number;
  firstname: string;
  lastname: string;
  email: string | null;
  domain: string;
  reference: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  competition_class_id: number | null;
  device_group_id: number | null;
  upload_count: number;
  validationResults: ValidationResult[];
  competitionClass?: {
    id: number;
    name: string;
  } | null;
  deviceGroup?: {
    id: number;
    name: string;
  } | null;
}

// Generate mock data
export function generateMockData(domain: string) {
  // Create marathon
  const marathon: Marathon = {
    id: 1,
    name: "Photo Marathon 2023",
    description: "Annual photo competition",
    domain,
    start_date: new Date().toISOString(),
    end_date: addDays(new Date(), 7).toISOString(),
    languages: "en",
    logo_url: null,
  };

  // Create device groups
  const deviceGroups: DeviceGroup[] = [
    {
      id: 1,
      name: "DSLR",
      description: "Digital SLR cameras",
      icon: "camera",
      marathon_id: 1,
    },
    {
      id: 2,
      name: "Mirrorless",
      description: "Mirrorless cameras",
      icon: "camera",
      marathon_id: 1,
    },
    {
      id: 3,
      name: "Smartphone",
      description: "Mobile phones",
      icon: "smartphone",
      marathon_id: 1,
    },
    {
      id: 4,
      name: "Film",
      description: "Analog film cameras",
      icon: "film",
      marathon_id: 1,
    },
  ];

  // Create competition classes
  const competitionClasses: CompetitionClass[] = [
    {
      id: 1,
      name: "Amateur",
      description: "For beginners",
      marathon_id: 1,
      number_of_photos: 6,
    },
    {
      id: 2,
      name: "Professional",
      description: "For professionals",
      marathon_id: 1,
      number_of_photos: 12,
    },
    {
      id: 3,
      name: "Junior",
      description: "Under 18",
      marathon_id: 1,
      number_of_photos: 4,
    },
  ];

  // Create participants with mixed statuses and devices
  const statuses = ["active", "pending", "completed", "registered"];
  const participants: Participant[] = [];

  for (let i = 1; i <= 120; i++) {
    const deviceGroupId = Math.floor(Math.random() * 4) + 1;
    const classId = Math.floor(Math.random() * 3) + 1;
    const status = statuses[
      Math.floor(Math.random() * statuses.length)
    ] as string;
    const uploadCount = Math.floor(Math.random() * 10);

    // Create random date within the last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = subDays(new Date(), daysAgo).toISOString();

    // Validation results - some with errors, some with warnings, some with both
    const validationResults: ValidationResult[] = [];

    // 30% chance to have validation errors
    if (Math.random() < 0.3) {
      const errorCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < errorCount; j++) {
        validationResults.push({
          id: i * 100 + j,
          participantId: i,
          ruleKey:
            ["file_size", "image_dimension", "exif_date"][j % 3] || "file_size",
          severity: "error",
          message:
            ["File too large", "Image too small", "Invalid capture date"][
              j % 3
            ] || "Error",
          outcome: "failed",
          createdAt: createdAt,
        });
      }
    }

    // 40% chance to have validation warnings
    if (Math.random() < 0.4) {
      const warningCount = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < warningCount; j++) {
        validationResults.push({
          id: i * 100 + j + 50,
          participantId: i,
          ruleKey:
            ["low_resolution", "color_profile"][j % 2] || "low_resolution",
          severity: "warning",
          message:
            ["Low resolution", "Missing color profile"][j % 2] || "Warning",
          outcome: "failed",
          createdAt: createdAt,
        });
      }
    }

    participants.push({
      id: i,
      marathon_id: 1,
      firstname: `User${i}`,
      lastname: `Test${i}`,
      email: `user${i}@example.com`,
      domain,
      reference: `REF${i.toString().padStart(5, "0")}`,
      status,
      created_at: createdAt,
      updated_at: null,
      competition_class_id: classId,
      device_group_id: deviceGroupId,
      upload_count: uploadCount,
      validationResults,
      competitionClass: {
        id: classId,
        name: competitionClasses[classId - 1]?.name || "Unknown Class",
      },
      deviceGroup: {
        id: deviceGroupId,
        name: deviceGroups[deviceGroupId - 1]?.name || "Unknown Device",
      },
    });
  }

  return {
    marathon,
    deviceGroups,
    competitionClasses,
    participants,
  };
}
