"use client";

import { Button } from "@vimmer/ui/components/button";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Calendar, ChevronRight, Loader } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function LandingHeroSection() {
  return (
    <section
      id="home"
      className="relative w-full py-12 md:py-20 px-6 md:px-12 flex flex-col items-center justify-center overflow-hidden bg-background"
    >
      <div className="absolute inset-0 cosmic-grid opacity-30"></div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full">
        <div
          className="w-full h-full opacity-10 bg-vimmer-primary blur-[120px]"
          style={{ backgroundColor: "hsl(var(--vimmer-primary))" }}
        ></div>
      </div>

      <motion.div
        className="relative z-10 max-w-4xl text-center space-y-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <Link
          href="https://sthlm2025.blikka.app/participate"
          className="flex justify-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span
            className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-muted text-vimmer-primary"
            style={{ color: "hsl(var(--vimmer-primary))" }}
          >
            <span
              className="flex h-2 w-2 rounded-full bg-vimmer-primary"
              style={{ backgroundColor: "hsl(var(--vimmer-primary))" }}
            ></span>
            Upcoming competition: Stockholm Fotomaraton
            <ChevronRight
              className="h-3 w-3 text-vimmer-primary"
              style={{ color: "hsl(var(--vimmer-primary))" }}
            />{" "}
          </span>
        </Link>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-rocgrotesk font-medium tracking-tighter text-balance text-foreground">
          The photo marathon platform for{" "}
          <span
            className="text-vimmer-primary"
            style={{ color: "hsl(var(--vimmer-primary))" }}
          >
            people
          </span>{" "}
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          Create, manage, and judge photo marathon competitions with real-time
          submissions, automated validation, and comprehensive analytics. Built
          for photographers, organizers, and communities.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 items-center">
          <PrimaryButton className="text-base h-12 px-8 transition-all duration-200 min-h-[48px]">
            Start your marathon
          </PrimaryButton>
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground text-base h-12 px-8 transition-all duration-200 min-h-[48px]"
          >
            View demo
          </Button>
        </div>

        <div className="pt-6 text-sm text-muted-foreground">
          Free to start • No setup fees • Cancel anytime
        </div>
      </motion.div>

      {/* Centered Preview Layout */}
      <motion.div
        className="w-full max-w-6xl mt-12 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        <div className="relative h-[500px] flex items-center justify-center">
          {/* Main Dashboard Preview - Center */}
          <motion.div
            className="relative w-[500px] h-80 z-20"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full h-full rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="h-10 bg-muted border-b border-border flex items-center px-4 gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                </div>
                <span className="text-sm text-muted-foreground ml-2">
                  Marathon Dashboard
                </span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-muted rounded w-32"></div>
                  <div
                    className="h-8 bg-vimmer-primary/20 rounded px-3 text-sm flex items-center"
                    style={{
                      backgroundColor: "hsl(var(--vimmer-primary) / 0.2)",
                    }}
                  >
                    Live Submissions
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div
                    className="h-20 bg-gradient-to-br from-vimmer-primary/20 to-vimmer-primary/5 rounded-lg flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(to bottom right, hsl(var(--vimmer-primary) / 0.2), hsl(var(--vimmer-primary) / 0.05))",
                    }}
                  >
                    <div
                      className="text-2xl font-bold text-vimmer-primary"
                      style={{ color: "hsl(var(--vimmer-primary))" }}
                    >
                      247
                    </div>
                  </div>
                  <div className="h-20 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-lg flex items-center justify-center">
                    <div className="text-2xl font-bold text-green-500">89%</div>
                  </div>
                  <div className="h-20 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-lg flex items-center justify-center">
                    <div className="text-2xl font-bold text-blue-500">12h</div>
                  </div>
                </div>
                <div
                  className="h-32 bg-gradient-to-r from-vimmer-primary/10 to-vimmer-primary/5 rounded-lg relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(to right, hsl(var(--vimmer-primary) / 0.1), hsl(var(--vimmer-primary) / 0.05))",
                  }}
                >
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 400 100"
                  >
                    <polyline
                      fill="none"
                      stroke="hsl(var(--vimmer-primary))"
                      strokeWidth="3"
                      points="0,80 50,60 100,40 150,30 200,35 250,20 300,25 350,15 400,20"
                      className="opacity-80"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Background Images - Left Side */}
          <motion.div className="absolute left-0 top-8 w-48 h-32 z-10">
            <div className="w-full h-full rounded-lg overflow-hidden shadow-xl relative">
              <img
                src="/feets-n-camera.jpg"
                alt="Feets and camera"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-background/30" />
            </div>
          </motion.div>

          <motion.div className="absolute left-12 bottom-0 w-32 z-10">
            <div className="w-full h-full rounded-lg overflow-hidden shadow-xl relative">
              <img
                src="/camera-man.jpg"
                alt="Camera man"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-background/30" />
            </div>
          </motion.div>

          {/* Background Images - Right Side */}
          <motion.div className="absolute right-0 top-12 w-52 h-36 z-10">
            <div className="w-full h-full rounded-lg overflow-hidden shadow-xl relative">
              <img
                src="/smiling.jpg"
                alt="Smiling"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-background/30" />
            </div>
          </motion.div>

          <motion.div className="absolute right-8 bottom-8 w-48 h-32 z-10">
            <div className="w-full h-full rounded-lg overflow-hidden shadow-xl relative">
              <img
                src="/backflip.jpg"
                alt="Backflip"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-background/30" />
            </div>
          </motion.div>

          {/* Mobile App Preview - Left of Dashboard */}
          <motion.div className="absolute left-32 top-1/2 -translate-y-1/2 w-36 h-72 z-15">
            <div className="w-full h-full rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
              <div className="h-8 bg-muted border-b border-border flex items-center justify-center">
                <div className="w-12 h-1 bg-muted-foreground/30 rounded-full"></div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full bg-vimmer-primary/20"
                    style={{
                      backgroundColor: "hsl(var(--vimmer-primary) / 0.2)",
                    }}
                  ></div>
                  <div className="h-4 bg-muted rounded flex-1"></div>
                </div>
                <div
                  className="h-24 bg-gradient-to-br from-vimmer-primary/20 to-vimmer-primary/5 rounded-lg"
                  style={{
                    background:
                      "linear-gradient(to bottom right, hsl(var(--vimmer-primary) / 0.2), hsl(var(--vimmer-primary) / 0.05))",
                  }}
                ></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-12 bg-muted/50 rounded"></div>
                  <div className="h-12 bg-muted/50 rounded"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Analytics Chart - Right of Dashboard */}
          <motion.div className="absolute right-32 top-1/2 -translate-y-1/2 w-72 h-48 z-15">
            <div className="w-full h-full rounded-xl border border-border bg-card shadow-xl overflow-hidden">
              <div className="h-10 bg-muted border-b border-border flex items-center px-4">
                <span className="text-sm text-muted-foreground">
                  Submission Analytics
                </span>
              </div>
              <div className="p-4">
                <div className="h-24 relative">
                  <svg className="w-full h-full" viewBox="0 0 200 60">
                    <polyline
                      fill="none"
                      stroke="hsl(var(--vimmer-primary))"
                      strokeWidth="2"
                      points="0,45 25,35 50,25 75,15 100,20 125,10 150,15 175,5 200,10"
                      className="opacity-80"
                    />
                    <polyline
                      fill="none"
                      stroke="hsl(var(--vimmer-primary))"
                      strokeWidth="1"
                      strokeOpacity="0.3"
                      points="0,50 25,45 50,40 75,35 100,40 125,30 150,35 175,25 200,30"
                    />
                  </svg>
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>9AM</span>
                  <span>6PM</span>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total Submissions
                  </span>
                  <span
                    className="font-semibold text-vimmer-primary"
                    style={{ color: "hsl(var(--vimmer-primary))" }}
                  >
                    1,247
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
