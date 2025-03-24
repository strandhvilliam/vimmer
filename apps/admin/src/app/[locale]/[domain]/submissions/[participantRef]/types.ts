export interface PhotoSubmission {
  id: number;
  topicName: string;
  imageUrl: string;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected";
  warnings?: string[];
  errors?: string[];
  order: number;
}

export interface ParticipantData {
  id: number;
  participantNumber: string;
  name: string;
  uploadStatus: "complete" | "incomplete" | "not_started";
  competitionClass: string;
  device: "smartphone" | "camera";
  warnings: string[];
  errors: string[];
  submissions: PhotoSubmission[];
}

export const MOCK_DATA: Record<number, ParticipantData> = {
  1: {
    id: 1,
    participantNumber: "P001",
    name: "Alice Smith",
    uploadStatus: "complete" as const,
    competitionClass: "Marathon",
    device: "smartphone" as const,
    warnings: ["Image size too small"],
    errors: [],
    submissions: [
      {
        id: 1,
        order: 1,
        topicName: "Urban Life",
        imageUrl: `https://picsum.photos/seed/1/600/800?grayscale`,
        uploadedAt: "2024-03-15T10:00:00Z",
        status: "approved",
      },
      {
        id: 2,
        order: 2,
        topicName: "Nature",
        imageUrl: `https://picsum.photos/seed/6/600/800?grayscale`,
        uploadedAt: "2024-03-15T10:15:00Z",
        status: "pending",
        warnings: ["Image size too small"],
      },
      {
        id: 3,
        order: 3,
        topicName: "People",
        imageUrl: `https://picsum.photos/seed/5/600/800?grayscale`,
        uploadedAt: "2024-03-15T10:30:00Z",
        status: "approved",
      },
      {
        id: 4,
        order: 4,
        topicName: "Architecture",
        imageUrl: `https://picsum.photos/seed/4/600/800?grayscale`,
        uploadedAt: "2024-03-15T10:45:00Z",
        status: "pending",
      },
      {
        id: 7,
        order: 5,
        topicName: "Motion",
        imageUrl: `https://picsum.photos/seed/7/600/800?grayscale`,
        uploadedAt: "2024-03-15T11:00:00Z",
        status: "approved",
      },
      {
        id: 8,
        order: 6,
        topicName: "Colors",
        imageUrl: `https://picsum.photos/seed/8/600/800?grayscale`,
        uploadedAt: "2024-03-15T11:15:00Z",
        status: "approved",
      },
      {
        id: 9,
        order: 7,
        topicName: "Shadows",
        imageUrl: `https://picsum.photos/seed/9/600/800?grayscale`,
        uploadedAt: "2024-03-15T11:30:00Z",
        status: "pending",
      },
      {
        id: 10,
        order: 8,
        topicName: "Reflection",
        imageUrl: `https://picsum.photos/seed/10/600/800?grayscale`,
        uploadedAt: "2024-03-15T11:45:00Z",
        status: "approved",
      },
    ],
  },
  2: {
    id: 2,
    participantNumber: "P002",
    name: "Bob Johnson",
    uploadStatus: "incomplete" as const,
    competitionClass: "Sprint",
    device: "camera" as const,
    warnings: [],
    errors: ["Missing EXIF data"],
    submissions: [
      {
        id: 5,
        order: 1,
        topicName: "Street",
        imageUrl: `https://picsum.photos/seed/2/600/800?grayscale`,
        uploadedAt: "2024-03-15T11:00:00Z",
        status: "rejected",
        errors: ["Missing EXIF data"],
      },
      {
        id: 6,
        order: 2,
        topicName: "Food",
        imageUrl: `https://picsum.photos/seed/3/600/800?grayscale`,
        uploadedAt: "2024-03-15T11:15:00Z",
        status: "approved",
      },
    ],
  },
};
