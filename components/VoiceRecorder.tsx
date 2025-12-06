'use client'

import { useState, useRef, useEffect } from 'react'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  disabled?: boolean
}

export default function VoiceRecorder({ onRecordingComplete, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        onRecordingComplete(audioBlob)
        stream.getTracks().forEach(track => track.stop())
        setRecordingTime(0)
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please grant permission.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const togglePauseResume = () => {
    if (!mediaRecorderRef.current) return

    if (isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      const stream = mediaRecorderRef.current.stream
      mediaRecorderRef.current.stop()
      stream.getTracks().forEach(track => track.stop())
      chunksRef.current = []
      setIsRecording(false)
      setIsPaused(false)
      setRecordingTime(0)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
        <div className="flex items-center gap-2 flex-1">
          <div className={`w-3 h-3 rounded-full bg-red-600 ${isPaused ? '' : 'animate-pulse'}`}></div>
          <span className="text-sm font-medium text-red-900">
            {isPaused ? 'Paused' : 'Recording'} {formatTime(recordingTime)}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={togglePauseResume}
            className="p-2 rounded-lg hover:bg-red-100 transition-colors"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? (
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            )}
          </button>
          <button
            onClick={cancelRecording}
            className="p-2 rounded-lg hover:bg-red-100 transition-colors"
            title="Cancel"
          >
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            Send
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={startRecording}
      disabled={disabled}
      className="p-3 rounded-lg border-2 border-gray-300 hover:border-primary-400 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed self-end"
      title="Record voice message"
    >
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  )
}
