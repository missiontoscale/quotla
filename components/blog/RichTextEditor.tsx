'use client'

/**
 * RichTextEditor Component
 *
 * A reusable rich text editor with markdown support for blog content creation.
 * Features:
 * - Markdown formatting toolbar (bold, italic, headings, lists, links, code blocks)
 * - Live preview mode
 * - Auto-saving textarea
 * - Keyboard shortcuts
 * - Sanitized HTML output
 *
 * Usage:
 * <RichTextEditor
 *   value={content}
 *   onChange={(content) => setContent(content)}
 *   placeholder="Start writing..."
 * />
 */

import React, { useRef, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  minHeight?: string
  maxHeight?: string
  className?: string
}

interface ToolbarButton {
  icon: string
  label: string
  action: () => void
  shortcut?: string
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing your content...',
  disabled = false,
  minHeight = '300px',
  maxHeight = '600px',
  className = '',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')

  // Insert text at cursor position
  const insertText = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const textToInsert = selectedText || placeholder

    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end)
    onChange(newText)

    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange])

  // Toolbar actions
  const formatBold = () => insertText('**', '**', 'bold text')
  const formatItalic = () => insertText('*', '*', 'italic text')
  const formatHeading1 = () => insertText('# ', '', 'Heading 1')
  const formatHeading2 = () => insertText('## ', '', 'Heading 2')
  const formatHeading3 = () => insertText('### ', '', 'Heading 3')
  const formatBulletList = () => insertText('- ', '', 'List item')
  const formatNumberedList = () => insertText('1. ', '', 'List item')
  const formatLink = () => insertText('[', '](https://example.com)', 'link text')
  const formatCode = () => insertText('`', '`', 'code')
  const formatCodeBlock = () => insertText('```\n', '\n```', 'code block')
  const formatQuote = () => insertText('> ', '', 'Quote')
  const formatHR = () => insertText('\n---\n', '', '')

  // Toolbar button configuration
  const toolbarButtons: ToolbarButton[][] = [
    [
      { icon: 'B', label: 'Bold', action: formatBold, shortcut: 'Ctrl+B' },
      { icon: 'I', label: 'Italic', action: formatItalic, shortcut: 'Ctrl+I' },
    ],
    [
      { icon: 'H1', label: 'Heading 1', action: formatHeading1 },
      { icon: 'H2', label: 'Heading 2', action: formatHeading2 },
      { icon: 'H3', label: 'Heading 3', action: formatHeading3 },
    ],
    [
      { icon: '•', label: 'Bullet List', action: formatBulletList },
      { icon: '1.', label: 'Numbered List', action: formatNumberedList },
    ],
    [
      { icon: '🔗', label: 'Link', action: formatLink, shortcut: 'Ctrl+K' },
      { icon: '</>', label: 'Code', action: formatCode },
      { icon: '{ }', label: 'Code Block', action: formatCodeBlock },
    ],
    [
      { icon: '"', label: 'Quote', action: formatQuote },
      { icon: '—', label: 'Horizontal Rule', action: formatHR },
    ],
  ]

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault()
          formatBold()
          break
        case 'i':
          e.preventDefault()
          formatItalic()
          break
        case 'k':
          e.preventDefault()
          formatLink()
          break
      }
    }

    // Tab key handling for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      insertText('  ', '', '')
    }
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Tabs */}
      <div className="flex border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button
          type="button"
          onClick={() => setActiveTab('write')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'write'
              ? 'text-[#ce6203] border-b-2 border-[#ce6203]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'preview'
              ? 'text-[#ce6203] border-b-2 border-[#ce6203]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Editor Area */}
      {activeTab === 'write' ? (
        <div className="border border-gray-300 dark:border-gray-700 rounded-b-md bg-white dark:bg-gray-900">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {toolbarButtons.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                {groupIndex > 0 && (
                  <div className="w-px bg-gray-300 dark:bg-gray-700 mx-1" />
                )}
                <div className="flex gap-1">
                  {group.map((button, buttonIndex) => (
                    <button
                      key={buttonIndex}
                      type="button"
                      onClick={button.action}
                      disabled={disabled}
                      title={`${button.label}${button.shortcut ? ` (${button.shortcut})` : ''}`}
                      className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {button.icon}
                    </button>
                  ))}
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-3 outline-none resize-none font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            style={{
              minHeight,
              maxHeight,
            }}
          />

          {/* Footer with character count */}
          <div className="flex justify-between items-center px-4 py-2 border-t border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
            <span>Markdown supported</span>
            <span>{value.length} characters</span>
          </div>
        </div>
      ) : (
        /* Preview Area */
        <div
          className="border border-gray-300 dark:border-gray-700 rounded-b-md bg-white dark:bg-gray-900 overflow-y-auto px-4 py-3"
          style={{
            minHeight,
            maxHeight,
          }}
        >
          {value.trim() ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                remarkPlugins={[remarkGfm]}
              >
                {value}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 italic">
              Nothing to preview yet. Start writing in the Write tab.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default RichTextEditor
