import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <div className="relative mx-auto flex min-h-[max(884px,100dvh)] w-full max-w-[480px] flex-col">
        {children}
      </div>
    </div>
  )
}