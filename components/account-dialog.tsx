"use client"

import { useRef, type ReactNode } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

/** Keyboard-accessible account operations with scrollable content on small screens. */
export function AccountDialog({title,onClose,children,wide=false}:{title:string;onClose:()=>void;children:ReactNode;wide?:boolean}) {
  const restoreFocus = useRef<HTMLElement | null>(typeof document === "undefined" ? null : document.activeElement as HTMLElement)
  return <Dialog open onOpenChange={open=>{if(!open)onClose()}}><DialogContent showCloseButton={false} aria-describedby={undefined} onCloseAutoFocus={event=>{event.preventDefault();restoreFocus.current?.focus()}} className={`block max-h-[85dvh] overflow-y-auto rounded-2xl bg-white ${wide?"sm:max-w-2xl":"sm:max-w-lg"}`}><DialogTitle className="sr-only">{title}</DialogTitle>{children}</DialogContent></Dialog>
}
