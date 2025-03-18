import { Button } from "@vimmer/ui/components/button";
import { Card } from "@vimmer/ui/components/card";
import { XIcon } from "lucide-react";
import { AddCompetitionClassDialog } from "./components/add-competition-class-dialog";

interface CompetitionClass {
  id: number;
  name: string;
  description: string;
  numberOfPhotos: number;
  icon: string;
}

async function getCompetitionClasses(): Promise<CompetitionClass[]> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return [
    {
      id: 1,
      name: "Marathon",
      description: "Full day challenge with 24 photos",
      numberOfPhotos: 24,
      icon: "camera",
    },
    {
      id: 2,
      name: "Sprint",
      description: "Quick challenge with 12 photos",
      numberOfPhotos: 12,
      icon: "camera",
    },
  ];
}

export async function CompetitionClassesSection() {
  const classes = await getCompetitionClasses();

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Competition Classes</h2>
        <AddCompetitionClassDialog
          onAddClass={async (data) => {
            "use server";
            // Here you would make an API call to create the class
            // and then revalidate the page data
            console.log("Adding class:", data);
          }}
        />
      </div>
      <p className="text-sm text-muted-foreground pb-4">
        Here you can manage the classes that are available for the marathon.
        This will decide how many photos the participants need to take for each
        class.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="relative">
            <div className="flex flex-col gap-2 p-4">
              <Button
                variant="ghost"
                className="absolute top-2 right-2 p-0 hover:bg-transparent"
                size="icon"
              >
                <XIcon className="w-4 h-4" />
              </Button>
              <div className="flex h-fit items-center w-fit justify-center bg-muted rounded-lg shadow-sm border p-2">
                <span className="w-6 h-6 text-center text-lg font-medium font-mono">
                  {classItem.numberOfPhotos}
                </span>
              </div>
              <div className="flex flex-col tems-center justify-between">
                <h3 className="text-lg font-semibold">{classItem.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {classItem.numberOfPhotos} photos
                </p>
                <p className="text-sm text-muted-foreground">
                  {classItem.description}
                </p>
              </div>
            </div>
            <div className="flex items-center px-4 pb-4 gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                Edit
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                View Submissions
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
