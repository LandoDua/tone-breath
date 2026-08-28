import type { ReactNode } from "react"

interface ScreenHeaderProps {
  title: string
  left?: ReactNode
  right?: ReactNode
  titleClassName?: string
}

export function ScreenHeader({ title, left, right, titleClassName }: ScreenHeaderProps) {
  return (
    <header className="relative flex h-16 w-full max-w-[480px] items-center justify-between px-6">
      <div className="flex h-12 w-12 items-center justify-center">{left}</div>
      <h1
        className={
          "absolute left-1/2 -translate-x-1/2 text-center text-lg font-medium text-text " +
          (titleClassName ?? "")
        }
      >
        {title}
      </h1>
      <div className="flex h-12 w-12 items-center justify-center">{right}</div>
    </header>
  )
}
