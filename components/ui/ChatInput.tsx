/**
 * ChatInput Component
 *
 * Shared chat input component with auto-resize textarea, file upload, voice recording, and send button.
 * Consolidates duplicate chat input implementations from:
 * - app/page.tsx (lines 374-406)
 * - components/CreateModal.tsx (lines 519-595)
 * - components/QuotlaChat.tsx
 *
 * Usage:
 * <ChatInput
 *   value={input}
 *   onChange={setInput}
 *   onSend={handleSend}
 *   onFileSelect={handleFile}
 *   onVoiceRecord={handleVoice}
 *   placeholder="Type a message..."
 *   disabled={loading}
 * />
 */

import React, { useRef, KeyboardEvent } from 'react'
import { COLORS, BORDERS, LIMITS, ERROR_MESSAGES, PLACEHOLDER_TEXT, FILE_TYPES } from '@/lib/constants'

export interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onFileSelect?: (file: File) => void
  onVoiceRecord?: () => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  selectedFile?: File | null
  showFileUpload?: boolean
  showVoiceRecord?: boolean
  maxRows?: number
  className?: string
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onFileSelect,
  onVoiceRecord,
  placeholder = PLACEHOLDER_TEXT.CHAT_DEFAULT,
  disabled = false,
  loading = false,
  selectedFile,
  showFileUpload = true,
  showVoiceRecord = true,
  maxRows = 5,
  className = '',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    target.style.height = 'auto'
    target.style.height = `${target.scrollHeight}px`
  }

  // Handle Enter key to send
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() || selectedFile) {
        onSend()
      }
    }
  }

  // Handle file selection with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > LIMITS.MAX_FILE_SIZE) {
        alert(ERROR_MESSAGES.FILE_TOO_LARGE)
        e.target.value = ''
        return
      }
      onFileSelect?.(file)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Hidden file input */}
      {showFileUpload && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={FILE_TYPES.ALL_UPLOADS}
          className="hidden"
        />
      )}

      {/* Input container */}
      <div
        className={`
          relative flex items-end gap-2
          px-4 py-3 ${BORDERS.ROUNDED_MD}
          border-2 border-${COLORS.PRIMARY[500]}
          focus-within:border-${COLORS.PRIMARY[500]}
          focus-within:ring-2 focus-within:ring-${COLORS.PRIMARY[200]}
          bg-white transition-all
        `.trim().replace(/\s+/g, ' ')}
      >
        {/* Auto-resizing textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          disabled={disabled || loading}
          rows={1}
          className={`
            flex-1 outline-none resize-none bg-transparent
            text-sm sm:text-base
            disabled:opacity-50
            min-h-[24px] max-h-[200px]
          `.trim().replace(/\s+/g, ' ')}
          style={{
            height: 'auto',
            overflowY: value.split('\n').length > maxRows ? 'auto' : 'hidden',
          }}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* File upload button */}
          {showFileUpload && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || loading}
              className={`
                p-2 ${BORDERS.ROUNDED_SM}
                hover:bg-${COLORS.BG.TERTIARY}
                transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
              `.trim().replace(/\s+/g, ' ')}
              title={`Upload file (max ${LIMITS.MAX_FILE_SIZE_LABEL})`}
              aria-label="Upload file"
            >
              <svg
                className={`w-5 h-5 text-${COLORS.TEXT.SECONDARY}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>
          )}

          {/* Voice record button */}
          {showVoiceRecord && (
            <button
              type="button"
              onClick={onVoiceRecord}
              disabled={disabled || loading}
              className={`
                p-2 ${BORDERS.ROUNDED_SM}
                hover:bg-${COLORS.BG.TERTIARY}
                transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
              `.trim().replace(/\s+/g, ' ')}
              title="Record voice message"
              aria-label="Record voice message"
            >
              <svg
                className={`w-5 h-5 text-${COLORS.TEXT.SECONDARY}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
          )}

          {/* Send button */}
          <button
            type="button"
            onClick={onSend}
            disabled={(!value.trim() && !selectedFile) || disabled || loading}
            className={`
              p-2 ${BORDERS.ROUNDED_SM}
              bg-${COLORS.BG.TERTIARY} text-white
              hover:bg-${COLORS.BG.SECONDARY}
              transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
            `.trim().replace(/\s+/g, ' ')}
            title="Send message"
            aria-label="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Selected file preview (optional) */}
      {selectedFile && (
        <div className={`mt-2 flex items-center gap-2 text-sm text-${COLORS.TEXT.SECONDARY}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="truncate">{selectedFile.name}</span>
        </div>
      )}
    </div>
  )
}

export default ChatInput
