"use client"
import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';

interface VolumeControlProps {
    volume: number; // 0 to 1
    isMuted: boolean;
    onVolumeChange: (volume: number) => void;
    onMuteToggle: () => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
    volume,
    isMuted,
    onVolumeChange,
    onMuteToggle
}) => {
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const volumeRef = useRef<HTMLDivElement>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Detect if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Get volume icon based on current volume level
    const getVolumeIcon = () => {
        if (isMuted || volume === 0) {
            return (
                <img src="/icons/sound0.svg" alt="0" className="h-6 w-6 lg:w-10 lg:h-10"/>
            );
        }

        // Volume level 1 (0.01 - 0.33)
        if (volume <= 0.33) {
            return (
                <img src="/icons/sound1.svg" alt="+"  className="h-6 w-6 lg:w-10 lg:h-10"/>
            );
        }

        // Volume level 2 (0.34 - 0.66)
        if (volume <= 0.66) {
            return (
                <img src="/icons/sound2.svg" alt="++"  className="h-6 w-6 lg:w-10 lg:h-10"/>
            );
        }

        // Volume level 3 (0.67 - 1.0)
        return (
            <img src="/icons/sound3.svg" alt="+++"  className="h-6 w-6 lg:w-10 lg:h-10"/>
        );
    };

    // Show slider with delayed hide
    const showSlider = () => {
        if (isMobile) return;
        
        setShowVolumeSlider(true);
        
        // Clear any existing timeout
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    };

    // Hide slider with delay
    const hideSlider = () => {
        if (isMobile) return;
        
        // Set timeout to hide after 2 seconds
        hideTimeoutRef.current = setTimeout(() => {
            setShowVolumeSlider(false);
        }, 1000);
    };

    // Cancel hide timeout when mouse enters slider area
    const cancelHide = () => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    };

    // Handle wheel scroll for desktop
    const handleWheel = (e: React.WheelEvent) => {
        if (isMobile) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newVolume = Math.max(0, Math.min(1, volume + delta));
        
        onVolumeChange(newVolume);
        
        // Show slider when scrolling
        showSlider();
        hideSlider();
    };

    // Handle volume slider change
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        onVolumeChange(newVolume);
    };

    // Volume up/down for mobile
    const adjustVolume = (direction: 'up' | 'down') => {
        const delta = direction === 'up' ? 0.1 : -0.1;
        const newVolume = Math.max(0, Math.min(1, volume + delta));
        onVolumeChange(newVolume);
    };

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, []);

    // Close volume slider when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
                setShowVolumeSlider(false);
                if (hideTimeoutRef.current) {
                    clearTimeout(hideTimeoutRef.current);
                    hideTimeoutRef.current = null;
                }
            }
        };

        if (showVolumeSlider) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showVolumeSlider]);

    return (
        <div 
            ref={volumeRef}
            className="relative flex items-center space-x-2"
            onMouseEnter={showSlider}
            onMouseLeave={hideSlider}
        >
            {/* Mobile Volume Controls */}
            {isMobile && (
                <>
                    <button
                        onClick={() => adjustVolume('down')}
                        className="text-white hover:text-[#D5FF01] transition-colors duration-200 p-1"
                        disabled={volume <= 0}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </button>
                </>
            )}

            {/* Main Volume Button */}
            <button
                onClick={onMuteToggle}
                onWheel={handleWheel}
                className="text-white hover:text-[#D5FF01] transition-colors duration-200 p-1 cursor-pointer select-none"
                title={isMobile ? "Tap to mute/unmute" : "Click to mute/unmute, scroll to adjust volume"}
            >
                {getVolumeIcon()}
            </button>

            {/* Mobile Volume Controls */}
            {isMobile && (
                <button
                    onClick={() => adjustVolume('up')}
                    className="text-white hover:text-[#D5FF01] transition-colors duration-200 p-1"
                    disabled={volume >= 1}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/>
                        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                </button>
            )}

            {/* Horizontal Volume Slider for Desktop - Positioned to the RIGHT */}
            {!isMobile && showVolumeSlider && (
                <div 
                    className="left-full  ml-3   rounded-sm px-3 transition-all duration-500"
                    onMouseEnter={cancelHide}
                    onMouseLeave={hideSlider}
                >
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleSliderChange}
                        className="volume-slider w-24 h-2 bg-white  rounded-xs appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #D5FF01 0%, #D5FF01 ${volume * 100}%, rgba(255, 255, 255, 1) ${volume * 100}%, rgba(255, 255, 255, 1) 100%)`
                        }}
                    />
                </div>
            )}

            {/* Mobile Volume Slider (horizontal) - Keep above for mobile */}
            {isMobile && showVolumeSlider && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black bg-opacity-90 rounded-sm p-3">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleSliderChange}
                        className="w-24 h-2 bg-white bg-opacity-30 rounded-xs appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #D5FF01 0%, #D5FF01 ${volume * 100}%, rgba(255, 255, 255, 0.3) ${volume * 100}%, rgba(255, 255, 255, 0.3) 100%)`
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default VolumeControl;