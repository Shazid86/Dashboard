import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  formatter: (n: number) => string;
  className?: string;
}

export default function AnimatedNumber({ value, formatter, className }: Props) {
  const [display, setDisplay] = useState(formatter(value));
  const fromRef = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    const duration = 650;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(formatter(from + (to - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, formatter]);

  return <span className={className}>{display}</span>;
}