export interface EmotionDimensions {
  calma: number
  ansiedad: number
  energia: number
  tristeza: number
  estres: number
  apertura: number
}

export type DimensionKey = keyof EmotionDimensions

export const DIMENSION_KEYS: DimensionKey[] = [
  "calma",
  "energia",
  "apertura",
  "estres",
  "tristeza",
  "ansiedad",
]

export const DIMENSION_LABELS = ["Calma", "Energía", "Apertura", "Estrés", "Tristeza", "Ansiedad"]

export const DIMENSION_COLORS: Record<DimensionKey, string> = {
  calma: "#14b8a6",
  ansiedad: "#f43f5e",
  energia: "#f59e0b",
  tristeza: "#64748b",
  estres: "#ef4444",
  apertura: "#a855f7",
}

export const DIMENSION_STATE_LABELS = ["No percibido", "Ligero", "Notable"]

export const EMOTION_DIMENSIONS_DEFAULT: EmotionDimensions = {
  calma: 0,
  ansiedad: 0,
  energia: 0,
  tristeza: 0,
  estres: 0,
  apertura: 0,
}

export const EMOTION_MAX = 2
