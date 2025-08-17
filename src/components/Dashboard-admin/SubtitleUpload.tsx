// src/components/Dashboard-admin/SubtitleUpload.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface SubtitleUploadProps {
  movieId: number;
  onUploadComplete?: () => void;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ar', label: 'Arabic' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' }
];

export default function SubtitleUpload({ movieId, onUploadComplete }: SubtitleUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const handleFileSelect = (file: File) => {
    const validTypes = ['.srt', '.vtt', '.ass', '.sub'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      toast.error('Please select a valid subtitle file (.srt, .vtt, .ass, .sub)');
      return;
    }
    
    // Check file size (max 5MB for subtitle files)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Subtitle file size must be less than 5MB');
      return;
    }
    
    setSelectedFile(file);
    setUploadSuccess(false);
  };
  
  const uploadSubtitle = async () => {
    if (!selectedFile || !selectedLanguage) {
      toast.error('Please select both a subtitle file and language');
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('subtitle', selectedFile);
    formData.append('movieId', movieId.toString());
    formData.append('language', selectedLanguage);
    
    try {
      const response = await fetch('/api/admin/subtitles/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        toast.success(`${LANGUAGES.find(l => l.code === selectedLanguage)?.label} subtitles uploaded successfully!`);
        setUploadSuccess(true);
        onUploadComplete?.();
        
        // Reset form after successful upload
        setTimeout(() => {
          setSelectedFile(null);
          setSelectedLanguage('');
          setUploadSuccess(false);
        }, 2000);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Subtitle upload failed');
      }
    } catch (error) {
      console.error('Subtitle upload failed:', error);
      toast.error('Subtitle upload failed');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Subtitles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploadSuccess ? (
          <div className="flex items-center justify-center p-8 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-green-700 font-medium">Subtitle uploaded successfully!</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Language *</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Subtitle File *</label>
                {!selectedFile ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Select subtitle file
                    </p>
                    <Input
                      type="file"
                      accept=".srt,.vtt,.ass,.sub"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                      id="subtitle-upload"
                    />
                    <Button asChild variant="outline" size="sm">
                      <label htmlFor="subtitle-upload" className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </label>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Supported formats: .srt, .vtt, .ass, .sub (Max 5MB)
            </div>
            
            <Button 
              onClick={uploadSubtitle}
              disabled={!selectedFile || !selectedLanguage || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Subtitle
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}