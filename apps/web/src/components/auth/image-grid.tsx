"use client";

import { BlurFade } from "@vimmer/ui/components/blur-fade";
import { motion } from "framer-motion";
import React from "react";

export function ImageGrid() {
  const createColumnImages = (columnIndex: number, count: number) => {
    return Array.from({ length: count }, (_, i) => {
      const isLandscape = (i + columnIndex) % 2 === 0;
      const width = isLandscape ? 800 : 600;
      const height = isLandscape ? 600 : 800;
      const seed = i + 1 + columnIndex * count;
      return `https://picsum.photos/seed/${seed}/${width}/${height}?grayscale`;
    });
  };

  const columns = [
    { images: createColumnImages(0, 8), duration: 990, reverse: false },
    { images: createColumnImages(1, 8), duration: 940, reverse: true },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/50 to-transparent h-[5vh] z-10" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/50 to-transparent h-[5vh] z-10" />
      <div className="relative z-0 h-full w-full overflow-hidden grid grid-cols-2 gap-2 px-0">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="overflow-hidden h-full">
            <motion.div
              className="flex flex-col gap-2"
              animate={{
                y: column.reverse ? ["0%", "-33.333%"] : ["-33.333%", "0%"],
              }}
              transition={{
                y: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: column.duration,
                  ease: "linear",
                },
              }}
            >
              {[...column.images, ...column.images, ...column.images].map(
                (imageUrl, idx) => (
                  <BlurFade
                    key={`${imageUrl}-${idx}`}
                    delay={0.15 + idx * 0.02}
                    inView
                  >
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <img
                        className="w-full rounded-2xl object-cover shadow-md"
                        src={imageUrl}
                        alt={`Column ${columnIndex + 1} image ${(idx % 8) + 1}`}
                        loading={idx < 8 ? "eager" : "lazy"}
                        style={{
                          height:
                            (idx + columnIndex) % 2 === 0 ? "200px" : "300px",
                        }}
                      />
                    </motion.div>
                  </BlurFade>
                ),
              )}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
