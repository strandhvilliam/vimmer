import { GitGraph, UserIcon } from "lucide-react";
import ImageViewer from "./_components/image-viewer";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@vimmer/ui/components/avatar";

const submissions = [
  {
    id: "1",
    title: "Serene Landscape",
    artist: "Emma Johnson",
    imageUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop",
    categories: ["Nature", "Landscape"],
    description:
      "A tranquil landscape capturing the essence of nature's beauty. The composition balances light and shadow to create a sense of depth and serenity.",
    submissionDate: "May 15, 2024",
  },
  {
    id: "2",
    title: "Urban Reflections",
    artist: "Michael Chen",
    imageUrl:
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2024&auto=format&fit=crop",
    categories: ["Urban", "Architecture"],
    description:
      "This photograph explores the interplay between modern architecture and natural light, creating a dynamic visual narrative through reflections on glass surfaces.",
    submissionDate: "May 16, 2024",
  },
  {
    id: "3",
    title: "Portrait of Resilience",
    artist: "Sophia Rodriguez",
    imageUrl:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1964&auto=format&fit=crop",
    categories: ["Portrait", "Documentary"],
    description:
      "A powerful portrait that captures human emotion and tells a story of perseverance through challenging circumstances. The subject's gaze conveys both vulnerability and strength.",
    submissionDate: "May 17, 2024",
  },
  {
    id: "4",
    title: "Abstract Harmony",
    artist: "David Williams",
    imageUrl:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2070&auto=format&fit=crop",
    categories: ["Abstract", "Experimental"],
    description:
      "An experimental piece that plays with color, form, and texture to create a harmonious abstract composition that invites multiple interpretations.",
    submissionDate: "May 18, 2024",
  },
  {
    id: "5",
    title: "Wildlife Encounter",
    artist: "Olivia Thompson",
    imageUrl:
      "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=2059&auto=format&fit=crop",
    categories: ["Wildlife", "Nature"],
    description:
      "A rare moment captured in the wild, showcasing the beauty and behavior of animals in their natural habitat. The photographer demonstrated exceptional patience and timing.",
    submissionDate: "May 19, 2024",
  },
  {
    id: "6",
    title: "Cultural Celebration",
    artist: "Raj Patel",
    imageUrl:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=2070&auto=format&fit=crop",
    categories: ["Cultural", "Event"],
    description:
      "This vibrant image documents a traditional cultural celebration, preserving a moment of joy and community. The composition balances movement and color to convey the energy of the event.",
    submissionDate: "May 20, 2024",
  },
  {
    id: "7",
    title: "Minimalist Study",
    artist: "Grace Lee",
    imageUrl:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2067&auto=format&fit=crop",
    categories: ["Minimalist", "Still Life"],
    description:
      "A study in minimalism that demonstrates how simplicity can create powerful visual impact. The careful arrangement of elements and negative space creates a sense of calm and focus.",
    submissionDate: "May 21, 2024",
  },
];

export default function Jury() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="flex w-full border-b items-center h-16 px-4 justify-between">
        <div className="flex items-center gap-4">
          <GitGraph className=" w-6 h-6 text-neutral-50" />
          <h1 className="text-xl text-neutral-50 font-semibold text-center font-rocgrotesk">
            Competition Submissions
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 bg-neutral-900/50 px-3 py-1.5 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm text-end font-medium text-neutral-50">
                John Doe
              </span>
              <span className="text-xs text-neutral-400">
                john.doe@example.com
              </span>
            </div>
            <Avatar className="h-8 w-8 backdrop-blur-md">
              <AvatarFallback>
                <UserIcon className=" h-4 w-4 text-neutral-800" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
      <ImageViewer submissions={submissions} />
    </main>
  );
}
