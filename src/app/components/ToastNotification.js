"use client"

import { useEffect, useState, useRef } from "react"
import { X, AlertCircle } from "lucide-react"

export default function ToastNotification({ message, isVisible, onClose, type = "info" }) {
  const [progress, setProgress] = useState(100)
  const [isAnimating, setIsAnimating] = useState(false)
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)
  const startTimeRef = useRef(null)
  const onCloseRef = useRef(onClose)

  // Keep onClose ref updated
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isVisible) {
      setIsAnimating(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      startTimeRef.current = null
      setProgress(100)
      return
    }

    // If already running, don't restart
    if (intervalRef.current) {
      return
    }

    // Trigger animation
    setIsAnimating(true)

    // Record start time
    startTimeRef.current = Date.now()

    // Reset progress when notification appears
    setProgress(100)

    // Update progress based on elapsed time
    intervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return
      
      const elapsed = Date.now() - startTimeRef.current
      const duration = 4000 // 4 seconds
      const newProgress = Math.max(0, 100 - (elapsed / duration) * 100)
      
      setProgress(newProgress)

      if (newProgress <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setIsAnimating(false)
        setTimeout(() => onCloseRef.current(), 300) // Wait for fade out animation
      }
    }, 50)

    // Auto close after 4 seconds
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setIsAnimating(false)
      setTimeout(() => onCloseRef.current(), 300) // Wait for fade out animation
    }, 4000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isVisible])

  if (!isVisible && !isAnimating) return null

  const textColor = type === "error" ? "text-red-800" : "text-yellow-800"
  const progressColor = type === "error" ? "bg-red-500" : "bg-yellow-500"

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-500 ease-out ${
        isVisible && isAnimating ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
      style={{
        transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out",
      }}
    >
      <div
        className="bg-white border-2 border-yellow-400 rounded-lg shadow-xl min-w-[320px] max-w-md px-4 py-3 relative overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={() => {
            setIsAnimating(false)
            setTimeout(() => onClose(), 300)
          }}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3 pr-6">
          <AlertCircle className={`w-5 h-5 ${textColor} flex-shrink-0 mt-0.5`} />
          <p className={`${textColor} font-medium text-sm flex-1`}>{message}</p>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-50 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

