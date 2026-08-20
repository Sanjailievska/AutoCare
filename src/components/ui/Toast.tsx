import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'

type ToastKind = 'success' | 'error' | 'info'
interface ToastItem { id: number; kind: ToastKind; message: string }

interface ToastContextValue { push: (message: string, kind?: ToastKind) => void }
const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const push = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = ++counter.current
    setToasts((t) => [...t, { id, kind, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={clsx(
              'min-w-[260px] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-pop animate-in',
              t.kind === 'success' && 'border-success/20 bg-success-50 text-success',
              t.kind === 'error' && 'border-danger/20 bg-danger-50 text-danger',
              t.kind === 'info' && 'border-diag/20 bg-diag-50 text-diag'
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
