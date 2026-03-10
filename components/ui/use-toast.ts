import * as React from "react"
const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000
type ToasterToast = { id: string; title?: string; description?: string; variant?: 'default'|'destructive'; open?: boolean; onOpenChange?: (o:boolean)=>void }
const listeners: Array<(s: ToasterToast[]) => void> = []
let toasts: ToasterToast[] = []
let count = 0
function dispatch(t: ToasterToast[]) { toasts = t; listeners.forEach(l => l(t)) }
export function toast(props: Omit<ToasterToast,'id'>) {
  const id = String(++count)
  const newToast = { ...props, id, open: true, onOpenChange: (open: boolean) => { if (!open) dismiss(id) } }
  dispatch([newToast, ...toasts].slice(0, TOAST_LIMIT))
  setTimeout(() => dismiss(id), TOAST_REMOVE_DELAY)
  return { id, dismiss: () => dismiss(id) }
}
function dismiss(id: string) { dispatch(toasts.map(t => t.id===id ? {...t,open:false} : t)) }
export function useToast() {
  const [state, setState] = React.useState<ToasterToast[]>(toasts)
  React.useEffect(() => { listeners.push(setState); return () => { const i=listeners.indexOf(setState); if(i>-1)listeners.splice(i,1) } }, [state])
  return { toasts: state, toast, dismiss }
}
