import { motion, type MotionValue } from "framer-motion"

interface BreathingCircleProps {
  label: string
  scale: MotionValue<number>
  className?: string
}

export function BreathingCircle({ label, scale, className }: BreathingCircleProps) {
  return (
    <div
      className={
        "relative h-[300px] w-[300px] md:h-[340px] md:w-[340px] " + (className ?? "")
      }
    >
      <div className="absolute inset-0 rounded-full border-2 border-accent/10" />
      <div className="absolute inset-0 rounded-full bg-accent/5" />
      <motion.div
        style={{ scale }}
        className="absolute inset-0 rounded-full bg-accent shadow-soft"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-light tracking-wide text-white">{label}</span>
      </div>
    </div>
  )
}
