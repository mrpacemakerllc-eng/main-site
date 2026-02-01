"use client"

import { useEffect } from "react"

export default function ScreenshotProtection() {
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Disable keyboard shortcuts for screenshots and dev tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen
      if (e.key === "PrintScreen") {
        e.preventDefault()
        alert("Screenshots are disabled to protect course content.")
        return false
      }

      // Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5 (Mac screenshots)
      if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) {
        e.preventDefault()
        alert("Screenshots are disabled to protect course content.")
        return false
      }

      // Windows Snipping Tool (Win+Shift+S)
      if (e.metaKey && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault()
        alert("Screenshots are disabled to protect course content.")
        return false
      }

      // Disable F12 (dev tools)
      if (e.key === "F12") {
        e.preventDefault()
        return false
      }

      // Disable Ctrl+Shift+I (dev tools)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault()
        return false
      }

      // Disable Ctrl+Shift+C (inspect element)
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault()
        return false
      }

      // Disable Ctrl+U (view source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault()
        return false
      }
    }

    // Blur content when window loses focus (user might be using external tool)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.style.filter = "blur(10px)"
      } else {
        document.body.style.filter = "none"
      }
    }

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.body.style.filter = "none"
    }
  }, [])

  return null
}
