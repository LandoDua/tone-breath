export interface EmotionDimensions {
  calma: number
  ansiedad: number
  energia: number
  tristeza: number
  enfoque: number
  apertura: number
}

export type DimensionKey = keyof EmotionDimensions

export const DIMENSION_KEYS: DimensionKey[] = [
  "calma",
  "ansiedad",
  "energia",
  "tristeza",
  "enfoque",
  "apertura",
]

export const DIMENSION_LABELS = ["Calma", "Ansiedad", "Energía", "Tristeza", "Enfoque", "Apertura"]

export const DIMENSION_COLORS: Record<DimensionKey, string> = {
  calma: "#14b8a6",
  ansiedad: "#f43f5e",
  energia: "#f59e0b",
  tristeza: "#64748b",
  enfoque: "#3b82f6",
  apertura: "#a855f7",
}

export const EMOTION_DIMENSIONS_DEFAULT: EmotionDimensions = {
  calma: 5,
  ansiedad: 5,
  energia: 5,
  tristeza: 5,
  enfoque: 5,
  apertura: 5,
}
