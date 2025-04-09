import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Switch } from "@vimmer/ui/components/switch";
import { Label } from "@vimmer/ui/components/label";
import { Separator } from "@vimmer/ui/components/separator";
import { Input } from "@vimmer/ui/components/input";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";

interface RuleToggleProps {
  title: string;
  description: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function RuleToggle({
  title,
  description,
  checked,
  onCheckedChange,
}: RuleToggleProps) {
  return (
    <div className="flex items-center justify-between space-x-4 pt-4 pb-2">
      <div className="flex-1 space-y-1">
        <Label htmlFor={title} className="text-sm">
          {title}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={title} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function RulesPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight font-rocgrotesk">
            Photo Submission Rules
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure validation rules for photo submissions
          </p>
        </div>
        <PrimaryButton>Save Changes</PrimaryButton>
      </div>

      <div className="grid gap-6">
        {/* Camera Equipment Rules */}
        <Card>
          <CardHeader className="space-y-0 border-b border-border">
            <CardTitle className="font-rocgrotesk text-lg">
              Camera Equipment
            </CardTitle>
            <CardDescription>
              Define which types of cameras and equipment are allowed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RuleToggle
              title="Allow Smartphone Cameras"
              description="Permit participants to use smartphone cameras for photo submissions"
            />
            <Separator />
            <RuleToggle
              title="Allow DSLR/Mirrorless Cameras"
              description="Permit participants to use professional cameras for submissions"
            />
            <Separator />
            <RuleToggle
              title="Allow Film Cameras"
              description="Permit participants to use analog film cameras (will require scanning)"
            />
          </CardContent>
        </Card>

        {/* File Format Rules */}
        <Card>
          <CardHeader className="space-y-0 border-b border-border">
            <CardTitle className="font-rocgrotesk text-lg">
              File Format Requirements
            </CardTitle>
            <CardDescription>
              Set acceptable file formats and specifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RuleToggle
              title="Allow RAW Files"
              description="Accept RAW format files (CR2, NEF, ARW, etc.)"
            />
            <Separator />
            <RuleToggle
              title="Allow JPEG Files"
              description="Accept JPEG/JPG format files"
            />
            <div className="space-y-4 pt-4">
              <Label>Maximum File Size (MB)</Label>
              <Input type="number" placeholder="25" className="max-w-[200px]" />
            </div>
          </CardContent>
        </Card>

        {/* Image Editing Rules */}
        <Card>
          <CardHeader className="space-y-0 border-b border-border">
            <CardTitle className="font-rocgrotesk text-lg">
              Image Editing
            </CardTitle>
            <CardDescription>
              Configure allowed post-processing and editing rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RuleToggle
              title="Allow Basic Adjustments"
              description="Permit exposure, contrast, and color balance adjustments"
            />
            <Separator />
            <RuleToggle
              title="Allow Cropping"
              description="Permit image cropping and straightening"
            />
            <Separator />
            <RuleToggle
              title="Allow Advanced Editing"
              description="Permit advanced editing like local adjustments and filters"
            />
          </CardContent>
        </Card>

        {/* Metadata Requirements */}
        <Card>
          <CardHeader className="space-y-0 border-b border-border">
            <CardTitle className="font-rocgrotesk text-lg">
              Metadata Requirements
            </CardTitle>
            <CardDescription>
              Set requirements for image metadata validation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RuleToggle
              title="Require Original Metadata"
              description="Images must contain original camera metadata (EXIF)"
            />
            <Separator />
            <RuleToggle
              title="Validate Capture Time"
              description="Verify that photos were taken during the competition timeframe"
            />
            <Separator />
            <RuleToggle
              title="Require GPS Data"
              description="Images must contain location information"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
