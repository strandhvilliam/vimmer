import { Button } from "@vimmer/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@vimmer/ui/components/drawer";
import { XIcon } from "lucide-react";
import { ReactNode } from "react";

interface DrawerLayoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
}

export function DrawerLayout({
  open,
  onOpenChange,
  title,
  children,
}: DrawerLayoutProps) {
  return (
    <Drawer modal={true} onOpenChange={onOpenChange} open={open}>
      <DrawerContent
        showHandle={false}
        className="h-[95dvh] p-0 rounded-t-3xl bg-gradient-to-b from-background to-muted/20"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="absolute top-2 right-2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background"
        >
          <XIcon className="h-5 w-5" />
        </Button>
        {title && <DrawerTitle className="sr-only">{title}</DrawerTitle>}
        {children}
      </DrawerContent>
    </Drawer>
  );
}
