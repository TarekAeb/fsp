import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Upload, X } from "lucide-react";

interface MovieImageUploadProps {
    currentImage?: string;
    onImageChange: (file: File | null) => void;
}

export default function MovieImageUpload({
    currentImage,
    onImageChange
}: MovieImageUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
    const [isDragging, setIsDragging] = useState(false);
    const [inputKey, setInputKey] = useState(Date.now()); // Used to reset the file input

    const handleFileChange = (file: File | null) => {
        if (file) {
            // Create a preview URL for the selected image
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
            onImageChange(file);
        } else {
            setPreviewUrl(null);
            onImageChange(null);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        handleFileChange(file);
    };

    const handleRemoveImage = () => {
        setPreviewUrl(null);
        onImageChange(null);
        // Reset the file input
        setInputKey(Date.now());
    };

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) {
            setIsDragging(true);
        }
    }, [isDragging]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            // Validate file type
            const file = files[0];
            const validTypes = ["image/jpeg", "image/png", "image/webp"];

            if (validTypes.includes(file.type)) {
                handleFileChange(file);
            } else {
                alert("Invalid file type. Please upload JPEG, PNG, or WebP images only.");
            }
        }
    }, []);

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
                Movie Poster
            </label>

            <div className="flex flex-col gap-4">
                {previewUrl ? (
                    // Show preview if an image is selected
                    <div className="relative w-full max-w-[200px] aspect-[2/3] border rounded-md overflow-hidden">
                        <img
                            src={previewUrl}
                            alt="Movie poster preview"
                            
                            className="object-cover"
                        />
                        <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2 p-1 h-auto"
                            onClick={handleRemoveImage}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    // Show drop zone if no image is selected
                    <div
                        className={`border-2 border-dashed rounded-md p-8 text-center transition-all cursor-pointer ${isDragging
                                ? "border-primary bg-primary/10"
                                : "border-muted-foreground/25 hover:border-primary/50"
                            }`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("poster-upload")?.click()}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            <p className="font-medium">
                                {isDragging ? "Drop image here" : "Drag and drop your poster image"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                or click to browse files
                            </p>
                        </div>
                    </div>
                )}

                <Input
                    id="poster-upload"
                    key={inputKey}
                    type="file"
                    onChange={handleInputChange}
                    accept="image/jpeg,image/png,image/webp"
                    className={previewUrl ? "w-full" : "w-full hidden"}
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Accepted formats: JPEG, PNG, WebP. Recommended size: 300x450 pixels.
                </p>
            </div>
        </div>
    );
}