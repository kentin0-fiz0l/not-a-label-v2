"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Music, X, FileAudio, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface FileWithProgress extends File {
  progress?: number
  status?: "uploading" | "completed" | "error"
  id: string
}

interface UploadZoneProps {
  onFilesAccepted?: (files: File[]) => void
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSize?: number
  className?: string
}

export function UploadZone({
  onFilesAccepted,
  accept = {
    'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a']
  },
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB
  className
}: UploadZoneProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([])
  const [rejectedFiles, setRejectedFiles] = useState<any[]>([])

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    // Add unique ID to each file
    const filesWithProgress = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substring(7),
      progress: 0,
      status: "uploading" as const
    }))

    setFiles(prev => [...prev, ...filesWithProgress])
    setRejectedFiles(fileRejections)

    // Simulate upload progress
    filesWithProgress.forEach((file, index) => {
      const interval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === file.id) {
            const newProgress = Math.min(f.progress! + Math.random() * 30, 100)
            return {
              ...f,
              progress: newProgress,
              status: newProgress >= 100 ? "completed" : "uploading"
            }
          }
          return f
        }))
      }, 500)

      setTimeout(() => {
        clearInterval(interval)
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, progress: 100, status: "completed" } : f
        ))
      }, 3000 + index * 1000)
    })

    if (onFilesAccepted) {
      onFilesAccepted(acceptedFiles)
    }
  }, [onFilesAccepted])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize
  })

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative overflow-hidden rounded-lg border-2 border-dashed p-8 transition-all duration-200 cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent/50",
          "group"
        )}
      >
        <input {...getInputProps()} />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(139, 92, 246, 0.1) 35px, rgba(139, 92, 246, 0.1) 70px)`
          }} />
        </div>

        <div className="relative flex flex-col items-center justify-center space-y-4 text-center">
          <div className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200",
            isDragActive
              ? "bg-primary text-white scale-110"
              : "bg-primary/10 text-primary group-hover:scale-105"
          )}>
            <Upload className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragActive ? "Drop your files here" : "Drag & drop your music files"}
            </p>
            <p className="text-sm text-muted-foreground">
              or <span className="text-primary font-medium">browse</span> to upload
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-secondary px-2 py-1">MP3</span>
            <span className="rounded-full bg-secondary px-2 py-1">WAV</span>
            <span className="rounded-full bg-secondary px-2 py-1">FLAC</span>
            <span className="rounded-full bg-secondary px-2 py-1">AAC</span>
            <span className="rounded-full bg-secondary px-2 py-1">M4A</span>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Maximum file size: {maxSize / 1024 / 1024}MB • Up to {maxFiles} files
          </p>
        </div>
      </div>

      {/* Rejected Files */}
      {rejectedFiles.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <div className="p-4 space-y-2">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Some files were rejected:
            </p>
            {rejectedFiles.map(({ file, errors }) => (
              <div key={file.name} className="text-xs text-red-700 dark:text-red-300">
                <span className="font-medium">{file.name}</span>
                {errors.map((error: any) => (
                  <span key={error.code}> - {error.message}</span>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Uploading {files.length} file{files.length > 1 ? 's' : ''}</h3>
          {files.map((file) => (
            <Card key={file.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    file.status === "completed"
                      ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                      : "bg-primary/10 text-primary"
                  )}>
                    {file.status === "completed" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <FileAudio className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate pr-2">{file.name}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      {file.status === "uploading" && (
                        <span>{Math.round(file.progress || 0)}%</span>
                      )}
                      {file.status === "completed" && (
                        <span className="text-green-600 dark:text-green-400">Uploaded</span>
                      )}
                    </div>
                    
                    {file.status === "uploading" && (
                      <Progress 
                        value={file.progress} 
                        className="h-1.5 mt-2"
                      />
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}