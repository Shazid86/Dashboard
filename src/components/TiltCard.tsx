import { motion, useMotionTemplate, useSpring } from "framer-motion";
import { type MouseEvent, type ReactNode, useRef } from "react";
import { cn } from "../utils/cn";

interface Props {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export default function TiltCard({ children, className, intensity = 10 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 200, damping: 20 });
  const ry = useSpring(0, { stiffness: 200, damping: 20 });
  const mx = useSpring(50, { stiffness: 150, damping: 20 });
  const my = useSpring(50, { stiffness: 150, damping: 20 });

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * intensity);
    rx.set((0.5 - py) * intensity);
    mx.set(px * 100);
    my.set(py * 100);
  }

  function handleLeave() {
    rx.set(0);
    ry.set(0);
    mx.set(50);
    my.set(50);
  }

  const bg = useMotionTemplate`radial-gradient(280px circle at ${mx}% ${my}%, rgba(227,172,55,0.14), transparent 70%)`;

  return (
    <div className="perspective-1000">
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className={cn("glass-panel glass-panel-hover relative overflow-hidden rounded-3xl", className)}
      >
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: bg }} />
        <div style={{ transform: "translateZ(30px)" }}>{children}</div>
      </motion.div>
    </div>
  );
}