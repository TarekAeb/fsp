// src/components/Dashboard-admin/VideoUpload.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  X,
  Video,
  StopCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface VideoUploadProps {
  movieId?: number;
  onUploadComplete?: (videoData: any) => void;
}

type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export default function VideoUpload({
  movieId,
  onUploadComplete,
}: VideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [conversionProgress, setConversionProgress] = useState<{
    [key: string]: number;
  }>({});
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Refs for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  const conversionPollingRef = useRef<NodeJS.Timeout | null>(null);
  const uploadStartTimeRef = useRef<number>(0);
  const uploadedBytesRef = useRef<number>(0);

  const handleFileSelect = (file: File) => {
    const validTypes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/mkv",
      "video/webm",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error(
        "Please select a valid video file (MP4, AVI, MOV, MKV, WEBM)"
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024 * 1024) {
      toast.error("File size must be less than 2GB");
      return;
    }

    setSelectedFile(file);
    resetUploadState();
  };

  const resetUploadState = () => {
    setUploadStatus("idle");
    setUploadProgress(0);
    setConversionProgress({});
    setCurrentJobId(null);
    setUploadSpeed("");
    setTimeRemaining("");
    setErrorMessage("");
    uploadedBytesRef.current = 0;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return "--:--";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateUploadMetrics = (loaded: number, total: number) => {
    const currentTime = Date.now();
    const elapsed = (currentTime - uploadStartTimeRef.current) / 1000; // seconds

    if (elapsed > 0) {
      const speed = loaded / elapsed; // bytes per second
      const remaining = (total - loaded) / speed; // seconds remaining

      setUploadSpeed(`${formatFileSize(speed)}/s`);
      setTimeRemaining(formatTime(remaining));
    }
  };

  const uploadVideo = async () => {
    if (!selectedFile || !movieId) {
      toast.error("Please select a video file and ensure movie is saved first");
      return;
    }

    // Create new AbortController for this upload
    abortControllerRef.current = new AbortController();

    setUploadStatus("uploading");
    setUploadProgress(0);
    uploadStartTimeRef.current = Date.now();
    uploadedBytesRef.current = 0;

    const formData = new FormData();
    formData.append("video", selectedFile);
    formData.append("movieId", movieId.toString());

    try {
      const xhr = new XMLHttpRequest();

      // Set up progress tracking
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
          uploadedBytesRef.current = e.loaded;
          calculateUploadMetrics(e.loaded, e.total);
        }
      });

      // Handle upload completion
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            setUploadStatus("processing");
            setUploadProgress(100);
            setCurrentJobId(result.jobId);
            toast.success("Video uploaded! Starting conversion...");

            // Start polling for conversion progress
            pollConversionProgress(result.jobId);
          } catch (error) {
            console.error("Error parsing response:", error);
            setUploadStatus("failed");
            setErrorMessage("Invalid response from server");
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            setUploadStatus("failed");
            setErrorMessage(error.error || "Upload failed");
            toast.error(error.error || "Upload failed");
          } catch {
            setUploadStatus("failed");
            setErrorMessage(`Upload failed with status ${xhr.status}`);
          }
        }
      });

      // Handle upload errors
      xhr.addEventListener("error", () => {
        setUploadStatus("failed");
        setErrorMessage("Network error during upload");
        toast.error("Network error during upload");
      });

      // Handle upload abort
      xhr.addEventListener("abort", () => {
        setUploadStatus("cancelled");
        toast.info("Upload cancelled by user");
      });

      // Listen for abort signal
      abortControllerRef.current.signal.addEventListener("abort", () => {
        xhr.abort();
      });

      // Start the upload
      xhr.open("POST", "/api/admin/videos/upload");
      xhr.send(formData);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("failed");
      setErrorMessage("Failed to start upload");
      toast.error("Failed to start upload");
    }
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (conversionPollingRef.current) {
      clearInterval(conversionPollingRef.current);
      conversionPollingRef.current = null;
    }

    // If we have a job ID, we should inform the server to cancel conversion
    if (currentJobId && uploadStatus === "processing") {
      fetch(`/api/admin/videos/cancel/${currentJobId}`, {
        method: "POST",
      }).catch((error) => console.error("Failed to cancel conversion:", error));
    }

    setUploadStatus("cancelled");
    toast.info("Upload cancelled");
  };

  // Update the pollConversionProgress function in VideoUpload component
  const pollConversionProgress = async (jobId: string) => {
    let retryCount = 0;
    const maxRetries = 3;

    conversionPollingRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/admin/videos/conversion-status/${jobId}`
        );

        if (response.status === 404) {
          retryCount++;
          if (retryCount >= maxRetries) {
            if (conversionPollingRef.current) {
              clearInterval(conversionPollingRef.current);
              conversionPollingRef.current = null;
            }
            setUploadStatus("failed");
            setErrorMessage("Conversion job lost. Please try uploading again.");
            toast.error(
              "Conversion job was lost. Please try uploading the video again."
            );
            return;
          }
          console.warn(`Job not found, retry ${retryCount}/${maxRetries}`);
          return; // Continue polling
        }

        const data = await response.json();

        // Reset retry count on successful response
        retryCount = 0;

        setConversionProgress(data.progress || {});

        if (data.completed) {
          if (conversionPollingRef.current) {
            clearInterval(conversionPollingRef.current);
            conversionPollingRef.current = null;
          }
          setUploadStatus("completed");
          toast.success(
            "Video conversion completed! All quality versions are ready."
          );
          onUploadComplete?.(data.result);
        } else if (data.failed) {
          if (conversionPollingRef.current) {
            clearInterval(conversionPollingRef.current);
            conversionPollingRef.current = null;
          }
          setUploadStatus("failed");
          setErrorMessage(data.error || "Video conversion failed");
          toast.error("Video conversion failed. Please try again.");
        }
      } catch (error) {
        console.error("Failed to get conversion status:", error);
        retryCount++;
        if (retryCount >= maxRetries) {
          if (conversionPollingRef.current) {
            clearInterval(conversionPollingRef.current);
            conversionPollingRef.current = null;
          }
          setUploadStatus("failed");
          setErrorMessage("Lost connection to conversion service");
          toast.error(
            "Lost connection to conversion service. Please try again."
          );
        }
      }
    }, 2000);
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
      case "cancelled":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "uploading":
      case "processing":
        return <Video className="h-5 w-5 text-blue-500 animate-pulse" />;
      default:
        return <Video className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case "uploading":
        return `Uploading... ${uploadProgress}%`;
      case "processing":
        return "Converting video to multiple qualities...";
      case "completed":
        return "Upload and conversion completed successfully!";
      case "failed":
        return `Failed: ${errorMessage}`;
      case "cancelled":
        return "Upload cancelled";
      default:
        return "Ready to upload";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Video Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedFile ? (
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => document.getElementById("video-file-input")?.click()}
          >
            <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Upload Video File</p>
            <p className="text-sm text-muted-foreground mb-4">
              Click to select your highest quality video. We&apos;ll create multiple
              quality versions.
            </p>
            <Input
              id="video-file-input"
              type="file"
              accept="video/*"
              onChange={(e) =>
                e.target.files?.[0] && handleFileSelect(e.target.files[0])
              }
              className="hidden"
            />
            <Button type="button" disabled={!movieId}>
              <Upload className="mr-2 h-4 w-4" />
              {!movieId ? "Save movie first to upload video" : "Select Video"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Video className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              {uploadStatus === "idle" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    resetUploadState();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Status Display */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{getStatusText()}</span>
                {uploadStatus === "uploading" && (
                  <span className="text-xs text-muted-foreground">
                    {uploadSpeed} • {timeRemaining} remaining
                  </span>
                )}
              </div>

              {/* Upload Progress */}
              {uploadStatus === "uploading" && (
                <div className="space-y-1">
                  <Progress value={uploadProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {formatFileSize(uploadedBytesRef.current)} /{" "}
                      {formatFileSize(selectedFile.size)}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Conversion Progress */}
            {uploadStatus === "processing" &&
              Object.keys(conversionProgress).length > 0 && (
                <div className="space-y-3">
                  <p className="font-medium text-sm">
                    Converting to multiple qualities:
                  </p>
                  {Object.entries(conversionProgress).map(
                    ([quality, progress]) => (
                      <div key={quality} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{quality}</span>
                          <span
                            className={
                              progress === 100
                                ? "text-green-600"
                                : "text-blue-600"
                            }
                          >
                            {progress}%{progress === 100 && " ✓"}
                          </span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    )
                  )}
                </div>
              )}

            {/* Error Message */}
            {uploadStatus === "failed" && errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {uploadStatus === "completed" && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700">
                    Video uploaded and converted successfully! Available
                    qualities: {Object.keys(conversionProgress).join(", ")}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {uploadStatus === "idle" && (
                <Button
                  onClick={uploadVideo}
                  className="flex-1"
                  disabled={!movieId}
                >
                  {!movieId
                    ? "Save movie first to upload video"
                    : "Upload and Process Video"}
                </Button>
              )}

              {(uploadStatus === "uploading" ||
                uploadStatus === "processing") && (
                <Button
                  variant="destructive"
                  onClick={cancelUpload}
                  className="flex-1"
                >
                  <StopCircle className="mr-2 h-4 w-4" />
                  Cancel Upload
                </Button>
              )}

              {(uploadStatus === "failed" || uploadStatus === "cancelled") && (
                <div className="flex gap-2 flex-1">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      resetUploadState();
                    }}
                    className="flex-1"
                  >
                    Choose Different File
                  </Button>
                  <Button
                    onClick={uploadVideo}
                    className="flex-1"
                    disabled={!movieId}
                  >
                    Retry Upload
                  </Button>
                </div>
              )}

              {uploadStatus === "completed" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    resetUploadState();
                  }}
                  className="flex-1"
                >
                  Upload Another Video
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
