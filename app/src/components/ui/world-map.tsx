"use client";

import { useRef, useMemo } from "react";
import { motion } from "motion/react";
import DottedMap from "dotted-map";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
}

export function WorldMap({ dots = [], lineColor = "#0ea5e9" }: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Memoize the map creation to prevent recreation on every render
  const svgMap = useMemo(() => {
    const map = new DottedMap({ height: 100, grid: "diagonal" });
    const theme = "dark";

    return map.getSVG({
      radius: 0.22,
      color: theme === "dark" ? "#FFFFFF40" : "#00000040",
      shape: "circle",
      backgroundColor: theme === "dark" ? "black" : "white",
    });
  }, []);

  // Memoize projection function
  const projectPoint = useMemo(
    () => (lat: number, lng: number) => {
      const x = (lng + 180) * (800 / 360);
      const y = (90 - lat) * (400 / 180);
      return { x, y };
    },
    []
  );

  // Memoize curved path creation
  const createCurvedPath = useMemo(
    () => (start: { x: number; y: number }, end: { x: number; y: number }) => {
      const midX = (start.x + end.x) / 2;
      const midY = Math.min(start.y, end.y) - 50;
      return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
    },
    []
  );

  // Pre-calculate all points and paths to avoid repeated calculations
  const pathData = useMemo(
    () =>
      dots.map((dot, i) => {
        const startPoint = projectPoint(dot.start.lat, dot.start.lng);
        const endPoint = projectPoint(dot.end.lat, dot.end.lng);
        return {
          id: i,
          startPoint,
          endPoint,
          path: createCurvedPath(startPoint, endPoint),
        };
      }),
    [dots, projectPoint, createCurvedPath]
  );

  return (
    <div className="w-full z-100 aspect-[2/1] dark:bg-black bg-white rounded-lg relative font-sans">
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
        alt="world map"
        height="495"
        width="1056"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none select-none"
      >
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Render paths */}
        {pathData.map((data) => (
          <motion.path
            key={`path-${data.id}`}
            d={data.path}
            fill="none"
            stroke="url(#path-gradient)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              delay: 0.3 * data.id,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        ))}

        {/* Render points */}
        {pathData.map((data) => (
          <g key={`points-${data.id}`}>
            {/* Start point */}
            <circle
              cx={data.startPoint.x}
              cy={data.startPoint.y}
              r="2"
              fill={lineColor}
            />
            <circle
              cx={data.startPoint.x}
              cy={data.startPoint.y}
              r="2"
              fill={lineColor}
              opacity="0.5"
            >
              <animate
                attributeName="r"
                values="2;8;2"
                dur="4s"
                repeatCount="indefinite"
                begin={`${data.id * 0.5}s`}
              />
              <animate
                attributeName="opacity"
                values="0.5;0;0.5"
                dur="4s"
                repeatCount="indefinite"
                begin={`${data.id * 0.5}s`}
              />
            </circle>

            {/* End point */}
            <circle
              cx={data.endPoint.x}
              cy={data.endPoint.y}
              r="2"
              fill={lineColor}
            />
            <circle
              cx={data.endPoint.x}
              cy={data.endPoint.y}
              r="2"
              fill={lineColor}
              opacity="0.5"
            >
              <animate
                attributeName="r"
                values="2;8;2"
                dur="4s"
                repeatCount="indefinite"
                begin={`${data.id * 0.5 + 1}s`}
              />
              <animate
                attributeName="opacity"
                values="0.5;0;0.5"
                dur="4s"
                repeatCount="indefinite"
                begin={`${data.id * 0.5 + 1}s`}
              />
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
}
