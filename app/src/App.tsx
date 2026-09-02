import { useState } from "react"
import { AnimatePresence, MotionConfig } from "framer-motion"
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { AppShell } from "./components/layout/AppShell"
import { PageTransition } from "./components/ui/PageTransition"
import { HomePage } from "./pages/HomePage"
import { TimeSelectorPage } from "./pages/TimeSelectorPage"
import { ActiveSessionPage } from "./pages/ActiveSessionPage"
import { SessionSummaryPage } from "./pages/SessionSummaryPage"
import { AmbientDemoPage } from "./pages/AmbientDemoPage"
import { routines, routineList } from "./lib/routines"
import { useBreathingSession } from "./hooks/useBreathingSession"

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [routineId, setRoutineId] = useState<string | null>(null)
  const [duration, setDuration] = useState(5)

  const selectedRoutine = routineList.find((r) => r.id === routineId) ?? null
  const session = useBreathingSession(selectedRoutine ?? undefined, duration)

  const goHome = () => navigate("/")
  const goDemo = () => navigate("/demo")
  const goSelectTime = (id: string) => {
    setRoutineId(id)
    navigate("/select-time")
  }
  const startSession = () => {
    session.start()
    navigate("/session")
  }
  const finishSession = () => {
    session.finish()
    navigate("/summary")
  }
  const exitSession = () => {
    session.finish()
    navigate("/")
  }
  const startSos = () => {
    setRoutineId("coherent")
    setDuration(5)
    void session.start({ routine: routines.coherent, durationMinutes: 5 })
    navigate("/session")
  }

  return (
    <AppShell>
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <HomePage onSelectRoutine={goSelectTime} onSos={startSos} onDemo={goDemo} />
                </PageTransition>
              }
            />
            <Route
              path="/select-time"
              element={
                selectedRoutine ? (
                  <PageTransition>
                    <TimeSelectorPage
                      duration={duration}
                      setDuration={setDuration}
                      onStart={startSession}
                    />
                  </PageTransition>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/session"
              element={
                selectedRoutine ? (
                  <PageTransition>
                    <ActiveSessionPage
                      routine={selectedRoutine}
                      phaseLabel={session.phase.label}
                      scale={session.scale}
                      activePhaseIndex={selectedRoutine.phases.indexOf(session.phase)}
                      remaining={session.secondsRemaining}
                      isPaused={session.status === "paused"}
                      onTogglePause={session.status === "paused" ? session.resume : session.pause}
                      onFinish={finishSession}
                      onExit={exitSession}
                    />
                  </PageTransition>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/summary"
              element={
                selectedRoutine ? (
                  <PageTransition>
                    <SessionSummaryPage
                      routine={selectedRoutine}
                      durationMinutes={duration}
                      onHome={goHome}
                    />
                  </PageTransition>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/demo"
              element={
                <PageTransition>
                  <AmbientDemoPage />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </MotionConfig>
    </AppShell>
  )
}