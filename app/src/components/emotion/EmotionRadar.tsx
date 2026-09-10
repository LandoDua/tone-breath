import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  DIMENSION_KEYS,
  DIMENSION_LABELS,
  DIMENSION_COLORS,
  DIMENSION_STATE_LABELS,
  EMOTION_MAX,
  type EmotionDimensions,
  type DimensionKey,
} from "./types"

interface EmotionRadarProps {
  dimensions: EmotionDimensions
  onChange?: (dims: EmotionDimensions) => void
  size?: "full" | "card" | "mini"
  interactive?: boolean
  pulse?: boolean
}

const SIZE_MAP = { full: 320, card: 120, mini: 64 }
const MIN_RADIUS_RATIO = 0.12

function getHexagonPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 })
    .map((_, i) => {
      const angle = (i * Math.PI * 2) / 6 - Math.PI / 2
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
    })
    .join(" ")
}

function getPolygonColor(dims: EmotionDimensions): string {
  const { calma, ansiedad, energia, tristeza, estres } = dims
  if (calma >= 2) return "#14b8a6"
  if (estres >= 2 || ansiedad >= 2 || tristeza >= 2) return "#f97316"
  if (energia >= 2) return "#2dd4bf"
  return "#14b8a6"
}

function getButtonBg(value: number): string {
  if (value === 0) return "fill-surface-2 stroke-outline/40"
  if (value === 1) return "fill-accent/20 stroke-accent/60"
  return "fill-accent/40 stroke-accent"
}

function getButtonText(value: number): string {
  if (value === 0) return "fill-text-muted"
  return "fill-text"
}

function AnimatedPolygon({
  points,
  fillColor,
  pulse,
}: {
  points: string
  fillColor: string
  pulse: boolean
}) {
  const [pulseScale, setPulseScale] = useState(1)

  useEffect(() => {
    if (!pulse) return
    let frame: number
    let start: number | null = null
    const cycleMs = 4000

    const animate = (ts: number) => {
      if (start === null) start = ts
      const elapsed = ts - start
      const progress = (elapsed % cycleMs) / cycleMs
      const s = 1 + 0.03 * Math.sin(progress * Math.PI * 2)
      setPulseScale(s)
      frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [pulse])

  return (
    <motion.polygon
      points={points}
      fill={fillColor}
      fillOpacity={0.2}
      stroke={fillColor}
      strokeOpacity={0.8}
      strokeWidth={2}
      style={{ transformOrigin: "center", transform: `scale(${pulseScale})` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  )
}

function VertexGlow({
  cx,
  cy,
  color,
  value,
}: {
  cx: number
  cy: number
  color: string
  value: number
}) {
  if (value === 0) return null

  const glowRadius = 18 + value * 6
  const opacity = 0.15 + value * 0.1

  return (
    <circle
      cx={cx}
      cy={cy}
      r={glowRadius}
      fill={color}
      opacity={opacity}
      style={{ filter: "blur(4px)" }}
    />
  )
}

export function EmotionRadar({
  dimensions,
  onChange,
  size = "full",
  interactive = true,
  pulse = false,
}: EmotionRadarProps) {
  const svgSize = SIZE_MAP[size]
  const center = svgSize / 2
  const radius = svgSize / 2 - (size === "full" ? 52 : size === "card" ? 16 : 8)
  const angleStep = (Math.PI * 2) / 6
  const minRadius = radius * MIN_RADIUS_RATIO

  const prevPointsRef = useRef<{ x: number; y: number }[]>([])
  const [displayPoints, setDisplayPoints] = useState<{ x: number; y: number }[]>(() =>
    DIMENSION_KEYS.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2
      return { x: center + minRadius * Math.cos(angle), y: center + minRadius * Math.sin(angle) }
    }),
  )

  const targetPoints = useMemo(() => {
    return DIMENSION_KEYS.map((key, i) => {
      const angle = i * angleStep - Math.PI / 2
      const rawR = (dimensions[key] / EMOTION_MAX) * radius
      const r = Math.max(rawR, minRadius)
      return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) }
    })
  }, [dimensions, center, radius, angleStep, minRadius])

  useEffect(() => {
    const prev = prevPointsRef.current
    if (prev.length === 0) {
      prevPointsRef.current = targetPoints
      setDisplayPoints(targetPoints)
      return
    }

    let frame: number
    let start: number | null = null
    const duration = 300

    const animate = (ts: number) => {
      if (start === null) start = ts
      const elapsed = ts - start
      const t = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)

      const interpolated = targetPoints.map((target, i) => ({
        x: prev[i].x + (target.x - prev[i].x) * ease,
        y: prev[i].y + (target.y - prev[i].y) * ease,
      }))

      setDisplayPoints(interpolated)

      if (t < 1) {
        frame = requestAnimationFrame(animate)
      } else {
        prevPointsRef.current = targetPoints
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [targetPoints])

  const polygonPoints = useMemo(() => displayPoints.map((p) => `${p.x},${p.y}`).join(" "), [displayPoints])
  const fillColor = useMemo(() => getPolygonColor(dimensions), [dimensions])

  const handleAxisTap = useCallback(
    (axis: DimensionKey) => {
      if (!interactive || !onChange) return
      const current = dimensions[axis]
      const next = current >= EMOTION_MAX ? 0 : current + 1
      onChange({ ...dimensions, [axis]: next })
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
      {[1 / 3, 2 / 3, 1].map((scale, i) => (
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

      {/* Vertex glows */}
      {size === "full" && displayPoints.map((point, i) => (
        <VertexGlow
          key={`glow-${i}`}
          cx={point.x}
          cy={point.y}
          color={DIMENSION_COLORS[DIMENSION_KEYS[i]]}
          value={dimensions[DIMENSION_KEYS[i]]}
        />
      ))}

      {/* Polygon */}
      <AnimatedPolygon points={polygonPoints} fillColor={fillColor} pulse={pulse} />

      {/* Vertices */}
      {displayPoints.map((point, i) => (
        <motion.circle
          key={i}
          cx={point.x}
          cy={point.y}
          r={size === "full" ? 6 : size === "card" ? 4 : 3}
          fill={DIMENSION_COLORS[DIMENSION_KEYS[i]]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      ))}

      {/* Labels (solo en tamaño full) */}
      {size === "full" &&
        DIMENSION_LABELS.map((label, i) => {
          const angle = i * angleStep - Math.PI / 2
          const labelRadius = radius + 48
          const x = center + labelRadius * Math.cos(angle)
          const y = center + labelRadius * Math.sin(angle)
          const key = DIMENSION_KEYS[i]
          const value = dimensions[key]
          const stateLabel = value > 0 ? DIMENSION_STATE_LABELS[value] : ""
          const displayText = stateLabel ? `${label} ${stateLabel}` : label
          const textWidth = displayText.length * 5 + 18

          return (
            <g key={i} onClick={() => handleAxisTap(key)} style={{ cursor: interactive ? "pointer" : "default" }}>
              <rect
                x={x - textWidth / 2}
                y={y - 11}
                width={textWidth}
                height={22}
                rx={11}
                className={getButtonBg(value)}
                strokeWidth={1.5}
              />
              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-[10px] font-medium select-none ${getButtonText(value)}`}
                style={{ pointerEvents: "none" }}
              >
                {displayText}
              </text>
            </g>
          )
        })}
    </motion.svg>
  )
}
