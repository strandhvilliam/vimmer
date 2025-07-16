import { Button } from "@vimmer/ui/components/button";
import { NavMenu } from "@vimmer/ui/components/nav-menu";
import { Sheet, SheetContent, SheetTrigger } from "@vimmer/ui/components/sheet";
import { Menu } from "lucide-react";

export function LandingNav() {
  return (
    <nav className="fixed top-6 inset-x-4 h-16 bg-background border dark:border-slate-700/70 max-w-screen-xl mx-auto rounded-full">
      <div className="h-full flex items-center justify-between mx-auto px-4">
        <NavLogo />

        <NavMenu className="hidden md:block" />

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="hidden sm:inline-flex rounded-full"
          >
            Sign In
          </Button>
          <Button className="rounded-full">Get Started</Button>

          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </nav>
  );
}

const NavLogo = () => {
  return <span className="font-rocgrotesk font-bold text-2xl">vimmer</span>;
};

const MobileNav = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <NavLogo />
        <NavMenu orientation="vertical" className="mt-12" />
      </SheetContent>
    </Sheet>
  );
};
