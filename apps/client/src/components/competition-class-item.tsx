import { CompetitionClass } from "@vimmer/supabase/types";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  competitionClass: CompetitionClass;
  isSelected: boolean;
  onSelect: () => void;
}

export function CompetitionClassItem({
  competitionClass,
  isSelected,
  onSelect,
}: Props) {
  return (
    <motion.div
      key={competitionClass.id}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-[300px]"
    >
      <Card
        className={`cursor-pointer transition-colors h-full ${
          isSelected ? "border-2 border-primary" : "hover:border-primary/50"
        }`}
        onClick={onSelect}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {competitionClass.name}
            {isSelected && <CheckCircle2 className="h-6 w-6 text-primary" />}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {competitionClass.numberOfPhotos} photos
          </p>
        </CardHeader>
        <CardFooter className="mt-auto">
          <span className="text-xs text-muted-foreground ml-auto">
            ID: {competitionClass.id}
          </span>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
