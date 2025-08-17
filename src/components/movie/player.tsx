"use client"
// src/components/movie/player.tsx - Updated duration handling
import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ArrowLeft,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VolumeControl from "./VolumeControl";
import Image from "next/image";

interface VideoPlayerProps {
    title: string;
    movieId: string;
    posterUrl?: string; // Add this
    onExit?: () => void;
    isVisible?: boolean;
}

interface VideoQuality {
  quality: string;
  src: string;
  fileSize: string;
  duration: number;
  bitrate?: string;
  codec?: string;
}

interface SubtitleData {
  src: string;
  label: string;
  isDefault: boolean;
}

interface VideoData {
  qualities: VideoQuality[];
  subtitles: Record<string, SubtitleData>;
}



// In the component:
const VideoPlayer: React.FC<VideoPlayerProps> = ({
    title,
    movieId,
    posterUrl, // Add this
    onExit,
    isVisible = false
}) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exitAttemptCount, setExitAttemptCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Video source management
  const [currentQuality, setCurrentQuality] = useState("720p");
  const [currentSubtitle, setCurrentSubtitle] = useState("off");
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [videoSource, setVideoSource] = useState<string>("");

  // Progress bar states
  const [isProgressHovered, setIsProgressHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch video data when component mounts
  useEffect(() => {
    if (movieId && isVisible) {
      fetchVideoData();
    }
  }, [movieId, isVisible]);

  const fetchVideoData = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching video data for movie:", movieId);
      const response = await fetch(`/api/movies/${movieId}/videos`);

      if (!response.ok) {
        throw new Error("Failed to fetch video data");
      }

      const data: VideoData = await response.json();
      console.log("Video data received:", data);
      setVideoData(data);

      // Set default quality (prefer 720p, fallback to highest available)
      const availableQualities = data.qualities.map((q) => q.quality);
      const defaultQuality = availableQualities.includes("720p")
        ? "720p"
        : availableQualities[0];

      if (defaultQuality) {
        setCurrentQuality(defaultQuality);
        const selectedQuality = data.qualities.find(
          (q) => q.quality === defaultQuality
        );
        if (selectedQuality) {
          console.log("Setting video source:", selectedQuality.src);
          console.log("Database duration:", selectedQuality.duration);
          setVideoSource(selectedQuality.src);

          // Set duration from database as fallback
          if (selectedQuality.duration > 0) {
            setDuration(selectedQuality.duration);
            console.log(
              "Duration set from database:",
              selectedQuality.duration
            );
          }
        }
      }
    } catch (error) {
      console.error("Error fetching video data:", error);
      toast({
        title: "Error",
        description: "Failed to load video data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // FORCE FULLSCREEN ON MOUNT
  useEffect(() => {
    if (isVisible) {
      const enterFullscreen = async () => {
        try {
          document.documentElement.style.overflow = "hidden";
          document.body.style.overflow = "hidden";

          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          } else if ((document.documentElement as any).mozRequestFullScreen) {
            await (document.documentElement as any).mozRequestFullScreen();
          } else if (
            (document.documentElement as any).webkitRequestFullscreen
          ) {
            await (document.documentElement as any).webkitRequestFullscreen();
          } else if ((document.documentElement as any).msRequestFullscreen) {
            await (document.documentElement as any).msRequestFullscreen();
          }

          setIsFullscreen(true);
        } catch (err) {
          console.error("Couldn't enter fullscreen mode:", err);
          document.documentElement.style.overflow = "hidden";
          document.body.style.overflow = "hidden";
        }
      };

      enterFullscreen();
    }

    return () => {
      if (isVisible) {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
    };
  }, [isVisible]);

  // Handle keyboard events for ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        e.preventDefault();
        e.stopPropagation();
        handleExitAttempt();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown, { capture: true });
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [isVisible, exitAttemptCount]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);

      if (!isNowFullscreen && isVisible && exitAttemptCount === 0) {
        handleExitAttempt();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, [isVisible, exitAttemptCount]);

  // ENHANCED VIDEO EVENT HANDLING WITH MULTIPLE DURATION SOURCES
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log("Setting up video event listeners");

    const handleLoadStart = () => {
      console.log("Video load started");
      setIsLoading(true);
    };

    const handleLoadedMetadata = () => {
      console.log("Video metadata loaded");
      console.log("Video duration from metadata:", video.duration);
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
        setDuration(video.duration);
        console.log("Duration set from video metadata:", video.duration);
      }
    };

    const handleLoadedData = () => {
      console.log("Video data loaded");
      console.log("Video duration from loadeddata:", video.duration);
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
        setDuration(video.duration);
        console.log("Duration updated from loadeddata:", video.duration);
      }
      video.volume = volume;
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      console.log("Video can play");
      console.log("Video duration from canplay:", video.duration);
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
        setDuration(video.duration);
        console.log("Duration updated from canplay:", video.duration);
      }
    };

    const handleDurationChange = () => {
      console.log("Duration changed event");
      console.log("New duration:", video.duration);
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
        setDuration(video.duration);
        console.log("Duration updated from durationchange:", video.duration);
      }
    };

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(video.currentTime);
        if (duration > 0) {
          setProgress((video.currentTime / duration) * 100);
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setShowControls(true);
    };

    const handleError = (e: Event) => {
      console.error("Video error:", e);
      setIsLoading(false);
      toast({
        title: "Video Error",
        description: "Failed to load video. Please try a different quality.",
        variant: "destructive",
      });
    };

    const handleProgress = () => {
      console.log("Video progress event");
      if (video.buffered.length > 0) {
        console.log("Video buffered:", video.buffered.end(0));
      }
    };

    // Add all event listeners
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    video.addEventListener("progress", handleProgress);

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      video.removeEventListener("progress", handleProgress);
    };
  }, [volume, toast, isDragging, duration]);

  // Debug video source changes
  useEffect(() => {
    if (videoSource) {
      console.log("Video source changed to:", videoSource);
      const video = videoRef.current;
      if (video) {
        console.log("Video element src:", video.src);
        console.log("Video readyState:", video.readyState);
        console.log("Video networkState:", video.networkState);
      }
    }
  }, [videoSource]);

  // Auto-hide controls with mouse movement
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      setShowControls(true);

      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const container = videoContainerRef.current;
    if (container && isVisible) {
      container.addEventListener("mousemove", resetControlsTimeout);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      if (container) {
        container.removeEventListener("mousemove", resetControlsTimeout);
      }
    };
  }, [isPlaying, isVisible]);

  // Handle exit attempts
  const handleExitAttempt = () => {
    if (exitAttemptCount === 0) {
      setExitAttemptCount(1);
      setShowControls(true);

      exitTimeoutRef.current = setTimeout(() => {
        setExitAttemptCount(0);
      }, 5000);
    } else {
      handleExit();
    }
  };

  const handleExit = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
    }

    if (videoRef.current) {
      videoRef.current.pause();
    }

    // Exit fullscreen
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";

    setIsPlaying(false);
    setExitAttemptCount(0);
    setShowControls(true);

    if (onExit) {
      onExit();
    }
  };

  // Volume control functions
  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    setVolume(newVolume);
    video.volume = newVolume;

    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMutedState = !isMuted;
    video.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  // Format time in MM:SS or HH:MM:SS
  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";

    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
  };

  // Play/Pause toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    console.log("Toggle play - current duration:", duration);
    console.log("Toggle play - video duration:", video.duration);

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((error) => {
        console.error("Play failed:", error);
        toast({
          title: "Playback Error",
          description: "Failed to play video. Please try again.",
          variant: "destructive",
        });
      });
    }

    setIsPlaying(!isPlaying);
  };

  // Handle video click (no double-click)
  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    togglePlay();
  };

  // Enhanced progress handling with drag support
  const handleProgressMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    setIsDragging(true);
    handleProgressChange(e as any);
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || duration <= 0) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(parseFloat(e.target.value));
    console.log("Seeking to:", newTime, "Duration:", duration);
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(
      0,
      Math.min(duration, video.currentTime + seconds)
    );
    video.currentTime = newTime;
    setCurrentTime(newTime);
    console.log("Skipped to:", newTime);
  };

  // Handle quality change
  const handleQualityChange = (quality: string) => {
    const video = videoRef.current;
    if (!video || !videoData) return;

    const currentVideoTime = video.currentTime;
    const wasPlaying = !video.paused;

    setCurrentQuality(quality);
    setIsLoading(true);

    const selectedQuality = videoData.qualities.find(
      (q) => q.quality === quality
    );
    if (selectedQuality) {
      console.log("Changing quality to:", quality);
      console.log("New video source:", selectedQuality.src);
      console.log("Quality duration from DB:", selectedQuality.duration);

      setVideoSource(selectedQuality.src);

      // Set duration from database for new quality
      if (selectedQuality.duration > 0) {
        setDuration(selectedQuality.duration);
        console.log("Duration set for new quality:", selectedQuality.duration);
      }

      setTimeout(() => {
        const newVideo = videoRef.current;
        if (newVideo) {
          newVideo.load();

          newVideo.addEventListener(
            "loadeddata",
            () => {
              console.log(
                "Quality change - loaded data, duration:",
                newVideo.duration
              );
              newVideo.currentTime = currentVideoTime;
              if (wasPlaying) {
                newVideo.play();
              }
              setIsLoading(false);
            },
            { once: true }
          );
        }
      }, 100);

      toast({
        title: "Quality Changed",
        description: `Video quality set to ${quality}`,
      });
    }

    setShowQualityMenu(false);
  };

  // Handle subtitle change
  const handleSubtitleChange = (value: string) => {
    const video = videoRef.current;
    if (!video || !videoData) return;

    setCurrentSubtitle(value);

    // Remove existing subtitle tracks
    const existingTracks = video.querySelectorAll("track");
    existingTracks.forEach((track) => track.remove());

    if (value !== "off" && videoData.subtitles[value]) {
      const track = document.createElement("track");
      track.kind = "subtitles";
      track.src = videoData.subtitles[value].src;
      track.srclang = value;
      track.label = videoData.subtitles[value].label;
      track.default = videoData.subtitles[value].isDefault;

      video.appendChild(track);

      track.addEventListener("load", () => {
        const textTracks = video.textTracks;
        for (let i = 0; i < textTracks.length; i++) {
          textTracks[i].mode =
            i === textTracks.length - 1 ? "showing" : "hidden";
        }
      });

      toast({
        title: "Subtitles Enabled",
        description: `${track.label} subtitles are now active`,
      });
    } else {
      const textTracks = video.textTracks;
      for (let i = 0; i < textTracks.length; i++) {
        textTracks[i].mode = "hidden";
      }

      toast({
        title: "Subtitles Disabled",
        description: "Subtitles have been turned off",
      });
    }

    setShowSubtitleMenu(false);
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  // Show loading if no video data
  if (!videoData) {
    return (
      <div className="fixed inset-0 z-[9999] w-screen h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D5FF01]"></div>
      </div>
    );
  }

  return (
    <div
      ref={videoContainerRef}
      className="fixed inset-0 z-[9999] w-screen h-screen bg-black overflow-hidden"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D5FF01]"></div>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={handleExitAttempt}
        className="absolute top-6 left-6 z-20 flex items-center text-white bg-black bg-opacity-70 p-3 rounded-full hover:bg-opacity-100 transition-all duration-300"
        style={{
          opacity: showControls ? 1 : 0,
          transform: showControls ? "translateX(0)" : "translateX(-20px)",
        }}
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Video title */}
      <div
        className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 text-white font-medium text-2xl transition-opacity duration-300"
        style={{
          opacity: showControls ? 1 : 0,
        }}
      >
        {title}
      </div>

      {/* Quality indicator */}
      <div
        className="absolute top-6 right-6 z-20 bg-black bg-opacity-70 text-white px-4 py-2 rounded text-sm font-medium"
        style={{
          opacity: showControls ? 1 : 0,
        }}
      >
        {currentQuality}
      </div>


      {/* Exit attempt indicator */}
      {exitAttemptCount > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-black bg-opacity-95 text-white px-8 py-6 rounded-lg">
          <p className="text-center text-xl font-medium">
            Press ESC again to exit
          </p>
        </div>
      )}

      {/* Subtitle display indicator */}
      {currentSubtitle !== "off" && videoData.subtitles[currentSubtitle] && (
        <div
          className="absolute top-20 right-6 z-20 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm"
          style={{
            opacity: showControls ? 1 : 0,
          }}
        >
          {videoData.subtitles[currentSubtitle].label} ON
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        src={videoSource}
        poster={posterUrl}
        className="w-full h-full object-contain"
        onClick={handleVideoClick}
        playsInline
        crossOrigin="anonymous"
        preload="metadata"
      />

      {/* Play/Pause overlay button */}
      {!isPlaying && !isLoading && (
        <button
          className="absolute inset-0 flex items-center justify-center w-full h-full bg-black bg-opacity-30 z-10"
          onClick={togglePlay}
        >
          <div className="rounded-full bg-black bg-opacity-70 p-6 hover:bg-opacity-90 transition-all">
            <Image
              src="/icons/play white.svg"
              alt="play"
              width={32}
              height={32}
            />
          </div>
        </button>
      )}

      {/* ALWAYS VISIBLE PROGRESS BAR */}
      <div className="absolute bottom-20 left-0 right-0 z-20 px-6 flex items-center justify-between gap-1 lg:gap-3">
        <div className={`text-muted ${isProgressHovered ? 'text-sm' : 'text-xs'}`}>
          {formatTime(currentTime)}
        </div>
        <div
          className="relative w-full cursor-pointer group flex items-center justify-center"
          onMouseEnter={() => setIsProgressHovered(true)}
          onMouseLeave={() => setIsProgressHovered(false)}
        >
          <input
            ref={progressRef}
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            onMouseDown={handleProgressMouseDown}
            onMouseUp={handleProgressMouseUp}
            disabled={duration <= 0}
            className={`w-full cursor-pointer transition-all duration-300 ${
              isProgressHovered || showControls ? "h-1" : "h-[1px]"
            }`}
            style={{
              appearance: "none",
              background:
                duration > 0
                  ? `linear-gradient(to right, #D5FF01 0%, #D5FF01 ${progress}%, rgba(255, 255, 255, 0.4) ${progress}%, rgba(255, 255, 255, 0.4) 100%)`
                  : "rgba(255, 255, 255, 0.4)",
              borderRadius: "2px",
              outline: "none",
              opacity: 1,
            }}
          />

          {/* Time tooltip on hover */}
          {isProgressHovered && duration > 0 && (
            <div
              className="absolute -top-8 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs"
              style={{
                left: `${progress}%`,
                transform: "translateX(-50%)",
              }}
            >
              {formatTime(currentTime)}
            </div>
          )}
        </div>
        <div className={`text-muted ${isProgressHovered ? 'text-sm' : 'text-xs'}`}>
          {formatTime(duration)}
        </div>
      </div>

      {/* Controls overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/80 to-transparent"
        style={{
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {/* Skip backward button */}
            <button
              onClick={() => skip(-10)}
              className="text-white focus:outline-none hover:text-[#D5FF01] transition-colors duration-200"
            >
              <Image
                src="/icons/10s white.svg"
                alt="skip backward"
                width={36}
                height={36}
              />
            </button>

            {/* Play/Pause button */}
            <button
              onClick={togglePlay}
              className="text-white focus:outline-none hover:text-[#D5FF01] transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              ) : isPlaying ? (
                <Image
                  src="/icons/pause white.svg"
                  alt="pause"
                  width={32}
                  height={32}
                />
              ) : (
                <Image
                  src="/icons/play white.svg"
                  alt="play"
                  width={32}
                  height={32}
                />
              )}
            </button>

            {/* Skip forward button */}
            <button
              onClick={() => skip(10)}
              className="text-white focus:outline-none hover:text-[#D5FF01] transition-colors duration-200"
            >
              <Image
                src="/icons/after 10s white.svg"
                alt="skip forward"
                width={36}
                height={36}
              />
            </button>

            {/* Volume Control */}
            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={handleVolumeChange}
              onMuteToggle={toggleMute}
            />
          </div>

          <div className="flex items-center space-x-8">
            {/* Settings - Quality Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowQualityMenu(!showQualityMenu);
                  setShowSubtitleMenu(false);
                }}
                className="text-white focus:outline-none hover:text-[#D5FF01] transition-colors duration-200"
              >
                <Image
                  src="/icons/settings.svg"
                  alt="settings"
                  width={32}
                  height={32}
                />
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-12 right-0 bg-black/95 border border-gray-600 rounded-lg p-3 min-w-[140px] shadow-xl">
                  <div className="text-white text-sm font-medium mb-3 px-2">
                    Quality
                  </div>
                  {videoData.qualities.map((quality) => (
                    <button
                      key={quality.quality}
                      onClick={() => handleQualityChange(quality.quality)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        currentQuality === quality.quality
                          ? "bg-[#D5FF01] text-black font-medium"
                          : "text-white hover:bg-gray-700"
                      }`}
                    >
                      {quality.quality}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subtitles Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSubtitleMenu(!showSubtitleMenu);
                  setShowQualityMenu(false);
                }}
                className="text-white focus:outline-none hover:text-[#D5FF01] transition-colors duration-200"
              >
                <Image
                  src="/icons/sub white.svg"
                  alt="subtitles"
                  width={32}
                  height={32}
                />
              </button>

              {showSubtitleMenu && (
                <div className="absolute bottom-12 right-0 bg-black/95 border border-gray-600 rounded-lg p-3 min-w-[140px] shadow-xl">
                  <div className="text-white text-sm font-medium mb-3 px-2">
                    Subtitles
                  </div>
                  <button
                    onClick={() => handleSubtitleChange("off")}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      currentSubtitle === "off"
                        ? "bg-[#D5FF01] text-black font-medium"
                        : "text-white hover:bg-gray-700"
                    }`}
                  >
                    Off
                  </button>
                  {Object.entries(videoData.subtitles).map(
                    ([code, subtitle]) => (
                      <button
                        key={code}
                        onClick={() => handleSubtitleChange(code)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          currentSubtitle === code
                            ? "bg-[#D5FF01] text-black font-medium"
                            : "text-white hover:bg-gray-700"
                        }`}
                      >
                        {subtitle.label}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Fullscreen button */}
            <button
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  document.documentElement.requestFullscreen();
                }
              }}
              className="text-white focus:outline-none hover:text-[#D5FF01] transition-colors duration-200"
            >
              <Maximize className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showQualityMenu || showSubtitleMenu) && (
        <div
          className="absolute inset-0 z-10"
          onClick={() => {
            setShowQualityMenu(false);
            setShowSubtitleMenu(false);
          }}
        />
      )}

      {/* Custom styles for progress bar */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: ${isProgressHovered || showControls ? "16px" : "12px"};
          height: ${isProgressHovered || showControls ? "16px" : "12px"};
          border-radius: 50%;
          background: #d5ff01;
          cursor: pointer;
          border: 2px solid #000;
          transition: all 0.2s ease;
          opacity: ${isProgressHovered || showControls ? "1" : "0"};
        }
        input[type="range"]::-moz-range-thumb {
          width: ${isProgressHovered || showControls ? "16px" : "12px"};
          height: ${isProgressHovered || showControls ? "16px" : "12px"};
          border-radius: 50%;
          background: #d5ff01;
          cursor: pointer;
          border: 2px solid #000;
          transition: all 0.2s ease;
          opacity: ${isProgressHovered || showControls ? "1" : "0"};
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
