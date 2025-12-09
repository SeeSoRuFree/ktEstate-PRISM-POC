'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, FileText, Image, File } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AttachmentInfo } from '@/types'

interface FileUploaderProps {
  attachments: AttachmentInfo[]
  onAttachmentsChange: (attachments: AttachmentInfo[]) => void
  maxFiles?: number
  maxSizeBytes?: number
  disabled?: boolean
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 5

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image
  if (type.includes('pdf') || type.includes('document')) return FileText
  return File
}

export function FileUploader({
  attachments,
  onAttachmentsChange,
  maxFiles = MAX_FILES,
  maxSizeBytes = MAX_FILE_SIZE,
  disabled = false,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null)
      const fileArray = Array.from(files)

      if (attachments.length + fileArray.length > maxFiles) {
        setError(`최대 ${maxFiles}개의 파일만 첨부할 수 있습니다.`)
        return
      }

      const validFiles: AttachmentInfo[] = []

      for (const file of fileArray) {
        if (file.size > maxSizeBytes) {
          setError(`파일 크기는 ${formatFileSize(maxSizeBytes)}를 초과할 수 없습니다.`)
          continue
        }

        const reader = new FileReader()
        const url = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })

        validFiles.push({
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url,
          uploadedAt: new Date().toISOString(),
        })
      }

      if (validFiles.length > 0) {
        onAttachmentsChange([...attachments, ...validFiles])
      }
    },
    [attachments, maxFiles, maxSizeBytes, onAttachmentsChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (!disabled && e.dataTransfer.files) {
        processFiles(e.dataTransfer.files)
      }
    },
    [disabled, processFiles]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files)
      }
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [processFiles]
  )

  const removeFile = useCallback(
    (id: string) => {
      onAttachmentsChange(attachments.filter((a) => a.id !== id))
    },
    [attachments, onAttachmentsChange]
  )

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        첨부파일 ({attachments.length}/{maxFiles})
      </label>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragging && 'border-blue-500 bg-blue-50',
          !isDragging && 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.hwp"
        />
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          파일을 끌어다 놓거나 <span className="text-blue-600">클릭</span>하여 선택
        </p>
        <p className="text-xs text-gray-500 mt-1">
          최대 {maxFiles}개, 각 {formatFileSize(maxSizeBytes)}까지
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* File List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((file) => {
            const Icon = getFileIcon(file.type)
            return (
              <div
                key={file.id}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
              >
                {file.type.startsWith('image/') ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded">
                    <Icon className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(file.id)
                  }}
                  disabled={disabled}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
