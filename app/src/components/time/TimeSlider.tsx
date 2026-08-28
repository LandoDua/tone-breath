interface TimeSliderProps {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}

export function TimeSlider({
  value,
  onChange,
  min = 1,
  max = 30,
  step = 0.5,
}: TimeSliderProps) {
  return (
    <div className="w-full">
      <input
        type="range"
        className="tb-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label="Duración de la sesión en minutos"
      />
      <div className="mt-2 flex justify-between text-xs font-medium text-text-muted">
        <span>{min} min</span>
        <span>{max} min</span>
      </div>
    </div>
  )
}
