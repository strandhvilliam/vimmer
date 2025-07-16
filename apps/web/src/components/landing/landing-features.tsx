"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  BarChart3,
  ChevronRight,
  Trophy,
  Target,
  Upload,
  Eye,
} from "lucide-react";
import { features } from "node:process";

type Feature = {
  title: string;
  description: string;
  expandedDescription: string;
  icon: React.ElementType;
};

export function LandingFeatures() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features: Feature[] = [
    {
      title: "Real-time Submissions",
      description:
        "Track photo submissions as they happen with live updates and instant validation feedback.",
      expandedDescription:
        "Monitor participant submissions in real-time with live dashboards. Get instant notifications when photos are uploaded, validated, or require attention. Track submission rates by topic, time, and participant group to ensure smooth marathon flow.",
      icon: Upload,
    },
    {
      title: "Automated Validation",
      description:
        "Ensure photo quality and compliance with customizable validation rules and EXIF data analysis.",
      expandedDescription:
        "Set up custom validation rules for file size, format, EXIF data, and shooting time. Automatically check for compliance with marathon rules and flag potential issues. Reduce manual review time while maintaining competition integrity.",
      icon: Shield,
    },
    {
      title: "Smart Judging Tools",
      description:
        "Streamline the judging process with intuitive interfaces and collaborative review features.",
      expandedDescription:
        "Enable multiple judges to review submissions efficiently with side-by-side comparisons, scoring systems, and collaborative commenting. Track judging progress and ensure fair evaluation across all participants and categories.",
      icon: Eye,
    },
    {
      title: "Topic Management",
      description:
        "Create and schedule photo topics with precise timing and automatic participant notifications.",
      expandedDescription:
        "Design your marathon flow with timed topic releases, custom descriptions, and automatic notifications. Set up sequential or parallel topics, manage difficulty progression, and ensure participants stay engaged throughout the event.",
      icon: Target,
    },
    {
      title: "Competition Classes",
      description:
        "Organize participants into different skill levels and equipment categories for fair competition.",
      expandedDescription:
        "Create multiple competition classes based on skill level, equipment type, or age groups. Set different requirements and photo counts for each class. Ensure fair competition and encourage participation across all skill levels.",
      icon: Trophy,
    },
    {
      title: "Analytics & Insights",
      description:
        "Gain deep insights into participant behavior and marathon performance with comprehensive analytics.",
      expandedDescription:
        "Track submission patterns, completion rates, and participant engagement. Analyze topic difficulty, time usage, and quality metrics. Use data-driven insights to improve future marathons and enhance participant experience.",
      icon: BarChart3,
    },
  ];

  return (
    <section id="features" className="w-full py-12 md:py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-rocgrotesk font-medium tracking-tighter">
            Everything you need for photo marathons
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive tools to organize, manage, and judge photography
            competitions of any size, from local clubs to international events
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Feature List */}
          <div className="space-y-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-full text-left p-6 rounded-xl border transition-all duration-300 ${
                    activeFeature === index
                      ? "border-vimmer-primary/40 bg-vimmer-primary/5"
                      : "border-border/20 hover:border-border/40"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      className={"p-3 rounded-lg bg-vimmer-primary/10"}
                      animate={{
                        scale: activeFeature === index ? 1.1 : 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <IconComponent
                        size={24}
                        className="text-vimmer-primary"
                      />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-rocgrotesk font-medium tracking-tight">
                          {feature.title}
                        </h3>
                        <motion.div
                          animate={{
                            rotate: activeFeature === index ? 90 : 0,
                            color:
                              activeFeature === index
                                ? "hsl(var(--vimmer-primary))"
                                : "hsl(var(--muted-foreground))",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                        >
                          <ChevronRight size={20} />
                        </motion.div>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <FeatureDetails feature={features[activeFeature]} />
        </div>
      </div>
    </section>
  );
}

function FeatureDetails({ feature }: { feature: Feature | undefined }) {
  if (!feature) return null;

  return (
    <div className="lg:sticky lg:top-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="bg-card/50 backdrop-blur-sm border border-border/20 rounded-2xl p-8"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <motion.div
                className={"p-4 rounded-xl bg-vimmer-primary/10"}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.1,
                }}
              >
                <feature.icon size={32} className="text-vimmer-primary" />
              </motion.div>
              <motion.h3
                className="text-2xl font-rocgrotesk font-medium tracking-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {feature.title}
              </motion.h3>
            </div>

            <motion.p
              className="text-muted-foreground leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {feature.expandedDescription}
            </motion.p>

            <motion.div
              className="pt-4 border-t border-border/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                className="inline-flex items-center gap-2 text-vimmer-primary hover:text-vimmer-primary/80 font-medium"
                whileHover={{ x: 5 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
              >
                Learn more about {feature.title.toLowerCase()}
                <ChevronRight size={16} />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
