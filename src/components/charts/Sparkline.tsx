import { useId, useMemo } from "react";

interface Props {
  data: number[];
  color?: string; // stroke color
  height?: number;
  className?: string;
}

/** Minimal SVG sparkline with a soft area fade — no charting lib, ultra light. */
export default function Sparkline({ data, color = "#e3ac37", height = 36, className }: Props) {
  const gradientId = useId();
  const { linePath, areaPath } = useMemo(() => {
    if (data.length < 2) return { linePath: "", areaPath: "" };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const w = 100;
    const h = 100;
    const stepX = w / (data.length - 1);
    const pts = data.map((v, i) => {
      const x = i * stepX;
      const y = h - ((v - min) / span) * h;
      return [x, y] as const;
    });
    const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
    const area = `${line} L${w},${h} L0,${h} Z`;
    return { linePath: line, areaPath: area };
  }, [data]);

  if (!linePath) {
    return <div className={className} style={{ height }} aria-hidden />;
  }

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={className}
      style={{ width: "100%", height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
