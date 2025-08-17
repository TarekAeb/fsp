// YouTube IFrame API TypeScript declarations
interface YT {
    PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
    };
}

declare class YTPlayer {
    constructor(
        elementId: string,
        options: {
            videoId: string;
            playerVars?: {
                autoplay?: 0 | 1;
                controls?: 0 | 1;
                disablekb?: 0 | 1;
                enablejsapi?: 0 | 1;
                fs?: 0 | 1;
                iv_load_policy?: 1 | 3;
                modestbranding?: 0 | 1;
                playsinline?: 0 | 1;
                rel?: 0 | 1;
                showinfo?: 0 | 1;
                start?: number;
                origin?: string;
            };
            events?: {
                onReady?: (event: { target: YTPlayer }) => void;
                onStateChange?: (event: { data: number; target: YTPlayer }) => void;
                onPlaybackQualityChange?: (event: { data: string; target: YTPlayer }) => void;
                onPlaybackRateChange?: (event: { data: number; target: YTPlayer }) => void;
                onError?: (event: { data: number; target: YTPlayer }) => void;
                onApiChange?: (event: { target: YTPlayer }) => void;
            };
        }
    );

    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    seekTo(seconds: number, allowSeekAhead?: boolean): void;
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    setVolume(volume: number): void;
    getVolume(): number;
    getDuration(): number;
    getCurrentTime(): number;
}

interface Window {
    YT: YT & { Player: typeof YTPlayer };
    onYouTubeIframeAPIReady: () => void;
}