"use client";

import { motion } from "motion/react";
import { cn } from "../lib/utils";

export function PrimaryButton({
  className,
  children,
  disabled,
  onClick,
  type = "button",
}: {
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}) {
  const primaryColor = "#FE3923";
  const secondaryColor = "#FF5A47";
  const hoverPrimaryColor = "#E32D18";
  const shadowColor = "rgba(254, 57, 35, 0.2)";

  return (
    <motion.button
      className={cn(
        "relative px-4 py-2 text-white text-sm font-semibold rounded-lg flex justify-center items-center gap-2 flex-row",
        className
      )}
      style={{
        textShadow: "0px 2px 3px rgba(0, 0, 0, 0.2)",
        boxShadow: `0px 2px 8px ${shadowColor}`,
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
      }}
      whileHover={{
        background: `linear-gradient(135deg, ${hoverPrimaryColor} 0%, ${primaryColor} 100%)`,
        boxShadow: `0px 6px 8px ${shadowColor}`,
      }}
      whileTap={{
        boxShadow: `0px 5px 10px ${shadowColor}`,
      }}
      transition={{
        duration: 0.1,
        ease: "easeIn",
      }}
      disabled={disabled}
      type={type}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
