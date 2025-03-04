"use client";

import { CompetitionClassForm } from "@/components/forms/competition-class-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { CompetitionClass } from "@/lib/types/competition-class";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@vimmer/ui/components/dialog";
import { Camera, Users2, Plus } from "lucide-react";
import { DeviceGroup } from "@/lib/types/device-group";
import { DeviceGroupForm } from "@/components/forms/device-group-form";
import { Icons } from "@/components/icons";
import { type Icon } from "@/components/icons";
import { useState } from "react";

export default function CompetitionClassesPage() {
  const [competitionClasses, setCompetitionClasses] = useState<
    CompetitionClass[]
  >([]);
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>([]);

  const handleCompetitionClassSubmit = async (data: CompetitionClass) => {
    setCompetitionClasses([...competitionClasses, data]);
  };

  const handleDeviceGroupSubmit = async (data: DeviceGroup) => {
    setDeviceGroups([...deviceGroups, data]);
  };

  return (
    <div className="container mx-auto py-8 space-y-12">
      <section>
        <div className="flex items-center gap-4 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Camera className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Competition Classes</h2>
            <p className="text-muted-foreground">
              Define different classes for your photo competitions
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {competitionClasses.map((classItem) => {
            const Icon = Icons[classItem.icon as Icon];
            return (
              <Card key={classItem.name}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-5 w-5" />}
                    <CardTitle className="text-lg">{classItem.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {classItem.numberOfPhotos} photos required
                  </p>
                </CardContent>
              </Card>
            );
          })}
          <Dialog>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:bg-accent/50 transition-colors flex flex-col items-center justify-center min-h-[140px]">
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Add New Class</p>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Competition Class</DialogTitle>
              </DialogHeader>
              <CompetitionClassForm onSubmit={handleCompetitionClassSubmit} />
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Device Groups Section */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Device Groups</h2>
            <p className="text-muted-foreground">
              Manage equipment categories for participants
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {deviceGroups.map((group) => {
            const Icon = Icons[group.icon as Icon];
            return (
              <Card key={group.name}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-5 w-5" />}
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {group.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {group.allowedDevices.slice(0, 3).map((device) => (
                      <span
                        key={device}
                        className="text-xs bg-secondary px-2 py-0.5 rounded"
                      >
                        {device}
                      </span>
                    ))}
                    {group.allowedDevices.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{group.allowedDevices.length - 3} more
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <Dialog>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:bg-accent/50 transition-colors flex flex-col items-center justify-center min-h-[140px]">
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Add New Group</p>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Device Group</DialogTitle>
              </DialogHeader>
              <DeviceGroupForm onSubmit={handleDeviceGroupSubmit} />
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </div>
  );
}
