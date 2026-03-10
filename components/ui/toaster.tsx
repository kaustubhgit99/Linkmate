"use client"
import { useToast } from "./use-toast"
import { X, CheckCircle, AlertCircle } from "lucide-react"
export function Toaster() {
  const { toasts, dismiss } = useToast()
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.filter(t=>t.open).map(t => (
        <div key={t.id} className={`flex items-start gap-3 rounded-2xl p-4 shadow-xl border text-sm animate-in slide-in-from-right-full ${t.variant==='destructive' ? 'bg-destructive text-destructive-foreground border-destructive/50' : 'bg-card text-card-foreground border-border'}`}>
          {t.variant==='destructive' ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5"/> : <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500"/>}
          <div className="flex-1 min-w-0">
            {t.title && <p className="font-semibold">{t.title}</p>}
            {t.description && <p className="text-xs opacity-80 mt-0.5">{t.description}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100 transition-opacity shrink-0"><X className="w-4 h-4"/></button>
        </div>
      ))}
    </div>
  )
}
