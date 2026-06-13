"use client";

import { motion } from "framer-motion";
import { HeroMotion } from "@/components/ui/motion";

export { HeroMotion as HeroAnimation };

export function StaggerFade({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export { FadeUp } from "@/components/ui/motion";
