"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface ProfilePhotoSectionProps {
  user: User
}

export function ProfilePhotoSection({ user }: ProfilePhotoSectionProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(user.image || "")
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const validateFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error("Please select an image file")
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB")
    }

    return true
  }

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('photo', file)

    const response = await fetch('/api/user/upload-photo', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to upload photo")
    }

    return response.json()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    await processFile(file)
  }

  const processFile = async (file: File) => {
    setIsUploading(true)
    setMessage("")

    try {
      validateFile(file)

      // Create preview immediately
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload file
      const data = await uploadFile(file)
      
      setPreviewUrl(data.imageUrl)
      setMessage("Profile photo updated successfully!")
      setIsSuccess(true)
      
      // Refresh the page to update the session
      setTimeout(() => {
        router.refresh()
      }, 1000)

    } catch (error) {
      setMessage(error instanceof Error ? error.message : "An error occurred while uploading photo")
      setIsSuccess(false)
      // Reset preview to original image on error
      setPreviewUrl(user.image || "")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removePhoto = async () => {
    setIsUploading(true)
    setMessage("")

    try {
      const response = await fetch('/api/user/remove-photo', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setPreviewUrl("")
        setMessage("Profile photo removed successfully!")
        setIsSuccess(true)
        router.refresh()
      } else {
        setMessage(data.error || "Failed to remove photo")
        setIsSuccess(false)
      }
    } catch (error) {
      setMessage("An error occurred while removing photo")
      setIsSuccess(false)
    } finally {
      setIsUploading(false)
    }
  }

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      await processFile(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="bg-card rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Profile Photo</h2>
          <p className="text-sm text-muted-foreground">
            Upload your professional headshot
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Photo */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden  border shadow-lg">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img src="/icons/bold profile colored.svg" alt="" />
                </div>
              )}
            </div>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
            dragActive 
              ? "border-primary bg-primary/10" 
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
          
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-muted-foreground" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <p className="text-sm font-medium text-foreground">
                {dragActive ? "Drop image here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-muted-foreground">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={triggerFileInput}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {isUploading ? "Uploading..." : "Change Photo"}
          </button>

          {previewUrl && (
            <button
              onClick={removePhoto}
              disabled={isUploading}
              className="inline-flex items-center px-4 py-2 border border-destructive text-destructive rounded-md hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove Photo
            </button>
          )}
        </div>

        {/* Guidelines */}
        {/* <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Photo Guidelines</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use a square image for best results</li>
            <li>• Minimum resolution: 400x400 pixels</li>
            <li>• Accepted formats: JPG, PNG, GIF</li>
            <li>• Maximum file size: 5MB</li>
            <li>• Professional headshots work best</li>
          </ul>
        </div> */}

        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-md border ${
            isSuccess 
              ? 'bg-primary/10 border-primary/20 text-primary' 
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {isSuccess ? (
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm">{message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}