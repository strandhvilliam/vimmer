"use client";

import { useState } from "react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@vimmer/ui/components/toggle-group";
import { cn } from "@vimmer/ui/lib/utils";
import { CircleDot, LayoutDashboard, DollarSign, X, Menu } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import { Logo } from "./logo";

export function LandingHeader() {
  const [activePage, setActivePage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActivePage(page);
    const element = document.getElementById(page);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="sticky top-0 z-50 pt-0 mt-6 px-4">
      <header className="w-full max-w-7xl mx-auto py-3 px-6 md:px-8 flex items-center justify-between">
        <div className="p-3">
          <Logo />
        </div>

        <button
          className="md:hidden p-3 rounded-2xl text-muted-foreground hover:text-foreground"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
          <div className="rounded-full px-1 py-1 backdrop-blur-md bg-background/80 border border-border shadow-lg">
            <ToggleGroup
              type="single"
              value={activePage}
              onValueChange={(value) => value && setActivePage(value)}
            >
              <ToggleGroupItem
                value="home"
                className={cn(
                  "px-4 py-2 rounded-full transition-colors relative",
                  activePage === "home"
                    ? "text-accent-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
                onClick={handleNavClick("home")}
              >
                <LayoutDashboard size={16} className="inline-block mr-1.5" />{" "}
                Home
              </ToggleGroupItem>
              <ToggleGroupItem
                value="features"
                className={cn(
                  "px-4 py-2 rounded-full transition-colors relative",
                  activePage === "features"
                    ? "text-accent-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
                onClick={handleNavClick("features")}
              >
                <CircleDot size={16} className="inline-block mr-1.5" /> Features
              </ToggleGroupItem>
              <ToggleGroupItem
                value="pricing"
                className={cn(
                  "px-4 py-2 rounded-full transition-colors relative",
                  activePage === "pricing"
                    ? "text-accent-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
                onClick={handleNavClick("pricing")}
              >
                <DollarSign size={16} className="inline-block mr-1.5" /> Pricing
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </nav>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-4 right-4 bg-background/95 backdrop-blur-md py-4 px-6 border border-border rounded-2xl shadow-lg z-50">
            <div className="flex flex-col gap-4">
              <a
                href="#home"
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  activePage === "home"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={handleNavClick("home")}
              >
                <LayoutDashboard size={16} className="inline-block mr-1.5" />{" "}
                Home
              </a>
              <a
                href="#features"
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  activePage === "features"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={handleNavClick("features")}
              >
                <CircleDot size={16} className="inline-block mr-1.5" /> Features
              </a>
              <a
                href="#pricing"
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  activePage === "pricing"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={handleNavClick("pricing")}
              >
                <DollarSign size={16} className="inline-block mr-1.5" /> Pricing
              </a>
            </div>
          </div>
        )}

        <div className="hidden md:flex items-center gap-4">
          <div className="rounded-2xl">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Log in
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
}
