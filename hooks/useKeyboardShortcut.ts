import { useEffect } from 'react'

type ShortcutHandler = (e: KeyboardEvent) => void

interface ShortcutDef {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  handler: ShortcutHandler
}

export function useKeyboardShortcut(shortcuts: ShortcutDef[], enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const matchKey = e.key.toLowerCase() === shortcut.key.toLowerCase()
        const matchCtrl = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true
        const matchMeta = shortcut.meta ? e.metaKey : true
        const matchShift = shortcut.shift ? e.shiftKey : true

        if (matchKey && matchCtrl && matchMeta && matchShift) {
          e.preventDefault()
          e.stopPropagation()
          shortcut.handler(e)
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, enabled])
}
