"use client"
import Image from "next/image";

type IconSize = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface IconProps {
    size: IconSize;
    color?: string;
    path: string;
    alt?: string;
}

const sizeMap = {
    0: { className: 'w-8 h-8', pixels: 32 },
    1: { className: 'w-9 h-9', pixels: 36 },
    2: { className: 'w-10 h-10', pixels: 40 },
    3: { className: 'w-11 h-11', pixels: 44 },
    4: { className: 'w-16 h-16', pixels: 64 },
    5: { className: 'w-20 h-20', pixels: 80 },
    6: { className: 'w-24 h-24', pixels: 96 },
} as const;

export default function Icon({ path, size, color, alt = '' }: IconProps) {
    const style = color ? {
        filter: `invert(1) brightness(100%) sepia(100%) hue-rotate(${getHueRotate(color)}deg)`
    } : undefined;

    const { className, pixels } = sizeMap[size];

    return (
        <Image
            src={path}
            className={className}
            style={style}
            alt={alt}
            width={pixels}
            height={pixels}
        />
    );
}

// Helper function to convert color to hue rotation
function getHueRotate(color: string): number {
    // Check if we're in browser environment
    if (typeof document === 'undefined') return 0;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    ctx.fillStyle = color;
    const hsl = ctx.fillStyle.match(/\d+/g);
    return hsl ? parseInt(hsl[0]) : 0;
}