import { useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import {
  DIMENSION_KEYS,
  DIMENSION_LABELS,
  DIMENSION_COLORS,
  type EmotionDimensions,
  type DimensionKey,
} from "./types"

interface EmotionRadarProps {
  dimensions: EmotionDimensions
  onChange?: (dims: EmotionDimensions) => void
  size?: "full" | "card" | "mini"
  interactive?: boolean
}

const SIZE_MAP = { full: 280, card: 120, mini: 64 }

function getHexagonPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 })
    .map((_, i) => {
      const angle = (i * Math.PI * 2) / 6 - Math.PI / 2
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
    })
    .join(" ")
}

function getPolygonColor(dims: EmotionDimensions): string {
  const { calma, ansiedad, energia, tristeza, enfoque } = dims
  if (calma >= 7 || enfoque >= 7) return "#14b8a6"
  if (ansiedad >= 7 || tristeza >= 7) return "#f97316"
  if (energia >= 7) return "#2dd4bf"
  return "#14b8a6"
}

export function EmotionRadar({
  dimensions,
  onChange,
  size = "full",
  interactive = true,
}: EmotionRadarProps) {
  const svgSize = SIZE_MAP[size]
  const center = svgSize / 2
  const radius = svgSize / 2 - (size === "full" ? 28 : size === "card" ? 16 : 8)
  const angleStep = (Math.PI * 2) / 6

  const points = useMemo(() => {
    return DIMENSION_KEYS.map((key, i) => {
      const angle = i * angleStep - Math.PI / 2
      const r = (dimensions[key] / 10) * radius
      return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) }
    })
  }, [dimensions, center, radius, angleStep])

  const polygonPoints = useMemo(() => points.map((p) => `${p.x},${p.y}`).join(" "), [points])
  const fillColor = useMemo(() => getPolygonColor(dimensions), [dimensions])

  const handleAxisTap = useCallback(
    (axis: DimensionKey) => {
      if (!interactive || !onChange) return
      onChange({ ...dimensions, [axis]: Math.min(10, dimensions[axis] + 1) })
    },
    [interactive, onChange, dimensions],
  )

  const handleAxisLongPress = useCallback(
    (axis: DimensionKey) => {
      if (!interactive || !onChange) return
      onChange({ ...dimensions, [axis]: Math.max(0, dimensions[axis] - 1) })
    },
    [interactive, onChange, dimensions],
  )

  return (
    <motion.svg
      width={svgSize}
      height={svgSize}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      aria-roledescription="emotion radar chart"
      role="img"
    >
      {/* Grid rings */}
      {[0.33, 0.66, 1].map((scale, i) => (
        <polygon
          key={i}
          points={getHexagonPoints(center, center, radius * scale)}
          fill="none"
          stroke="currentColor"
          className="text-text-muted/20"
          strokeWidth={1}
        />
      ))}

      {/* Axes */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = i * angleStep - Math.PI / 2
        const x2 = center + radius * Math.cos(angle)
        const y2 = center + radius * Math.sin(angle)
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            className="text-text-muted/20"
            strokeWidth={1}
          />
        )
      })}

      {/* Polygon */}
      <motion.polygon
        points={polygonPoints}
        fill={fillColor}
        fillOpacity={0.2}
        stroke={fillColor}
        strokeOpacity={0.8}
        strokeWidth={2}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      />

      {/* Vertices */}
      {points.map((point, i) => (
        <motion.circle
          key={i}
          cx={point.x}
          cy={point.y}
          r={size === "full" ? 6 : size === "card" ? 4 : 3}
          fill={DIMENSION_COLORS[DIMENSION_KEYS[i]]}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.05, type: "spring" }}
        />
      ))}

      {/* Labels (solo en tamaño full) */}
      {size === "full" &&
        DIMENSION_LABELS.map((label, i) => {
          const angle = i * angleStep - Math.PI / 2
          const labelRadius = radius + 20
          const x = center + labelRadius * Math.cos(angle)
          const y = center + labelRadius * Math.sin(angle)
          const key = DIMENSION_KEYS[i]

          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-text-muted text-xs select-none"
              style={{ cursor: interactive ? "pointer" : "default" }}
              onClick={() => handleAxisTap(key)}
              onPointerDown={() => {
                if (!interactive) return
                const timer = setTimeout(() => handleAxisLongPress(key), 500)
                const clear = () => {
                  clearTimeout(timer)
                  window.removeEventListener("pointerup", clear)
                  window.removeEventListener("pointercancel", clear)
                }
                window.addEventListener("pointerup", clear)
                window.addEventListener("pointercancel", clear)
              }}
              role={interactive ? "button" : undefined}
              aria-label={`${label}: ${dimensions[key]} de 10. Toca para aumentar, mantén para disminuir.`}
            >
              {label}
            </text>
          )
        })}
    </motion.svg>
  )
}
