import { ConfirmationClient } from "./client-page";

const mockImages = [
  {
    id: "1",
    url: "https://picsum.photos/200?random=1",
    name: "Img1",
  },
  {
    id: "2",
    url: "https://picsum.photos/200?random=2",
    name: "Img1",
  },
  {
    id: "3",
    url: "https://picsum.photos/200?random=3",
    name: "Img1",
  },
  {
    id: "4",
    url: "https://picsum.photos/200?random=4",
    name: "Img1",
  },
  {
    id: "5",
    url: "https://picsum.photos/200?random=5",
    name: "Img1",
  },
];

export default function ConfirmationPage() {
  // In your page component
  return <ConfirmationClient images={mockImages} />;
}
