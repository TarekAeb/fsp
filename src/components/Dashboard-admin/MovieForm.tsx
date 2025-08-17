// src/components/Dashboard-admin/MovieForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import MovieImageUpload from "./MovieImageUpload";
import VideoUpload from "./VideoUpload";
import SubtitleUpload from "./SubtitleUpload";
interface MovieData {
  title: string;
  description: string;
  releaseDate: string | Date;
  durationMinutes: number | string;
  rating: number | string;
  language: string;
  budget?: number | string;
  boxOffice?: number | string;
  trailerUrl?: string;
  posterUrl?: string;
}
interface MovieFormProps {
  movieId?: number;
  initialData?: MovieData;
  isEdit?: boolean;
}

export function MovieForm({ movieId, initialData, isEdit = false }: MovieFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMovieId, setCurrentMovieId] = useState<number | undefined>(movieId);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    releaseDate: initialData?.releaseDate ? new Date(initialData.releaseDate).toISOString().split('T')[0] : "",
    durationMinutes: initialData?.durationMinutes || "",
    rating: initialData?.rating || "",
    language: initialData?.language || "en",
    budget: initialData?.budget || "",
    boxOffice: initialData?.boxOffice || "",
    trailerUrl: initialData?.trailerUrl || "",
  });

  const [posterFile, setPosterFile] = useState<File | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const movieData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        movieData.append(key, value.toString());
      });

      // Add poster if selected
      if (posterFile) {
        movieData.append('poster', posterFile);
      }

      const url = isEdit ? `/api/admin/movies/${movieId}` : '/api/admin/movies';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: movieData,
      });

      if (response.ok) {
        const result = await response.json();
        
        // Set movie ID for video/subtitle uploads if this is a new movie
        if (!isEdit && result.movie?.id) {
          setCurrentMovieId(result.movie.id);
        }

        toast.success(isEdit ? 'Movie updated successfully!' : 'Movie created successfully!');
        
        if (!isEdit) {
          // Don't redirect immediately, let user upload video and subtitles
          toast.info('You can now upload the video and subtitles for this movie.');
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save movie');
      }
    } catch (error) {
      console.error('Error saving movie:', error);
      toast.error('An error occurred while saving the movie');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVideoUploadComplete = () => {
    toast.success('Video processing completed!');
    // Optionally refresh or update UI
  };

  const handleSubtitleUploadComplete = () => {
    toast.success('Subtitle uploaded successfully!');
    // Optionally refresh subtitle list
  };

  return (
    <div className="space-y-8">
      {/* Movie Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Movie' : 'Movie Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Movie title"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Release Date</label>
                  <Input
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => handleInputChange('durationMinutes', e.target.value)}
                    placeholder="120"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Rating (1-10)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={formData.rating}
                    onChange={(e) => handleInputChange('rating', e.target.value)}
                    placeholder="8.5"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Language</label>
                  <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Budget ($)</label>
                  <Input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="1000000"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Box Office ($)</label>
                  <Input
                    type="number"
                    value={formData.boxOffice}
                    onChange={(e) => handleInputChange('boxOffice', e.target.value)}
                    placeholder="5000000"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Trailer URL</label>
                  <Input
                    type="url"
                    value={formData.trailerUrl}
                    onChange={(e) => handleInputChange('trailerUrl', e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                {/* Movie Poster Upload */}
                <MovieImageUpload
                  currentImage={initialData?.posterUrl}
                  onImageChange={setPosterFile}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Movie description..."
                rows={4}
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update Movie' : 'Create Movie')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Video and Subtitle Upload - Only show if we have a movie ID */}
      {currentMovieId && (
        <>
          <VideoUpload 
            movieId={currentMovieId}
            onUploadComplete={handleVideoUploadComplete}
          />
          
          <SubtitleUpload 
            movieId={currentMovieId}
            onUploadComplete={handleSubtitleUploadComplete}
          />
        </>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Back to Movies
        </Button>
        
        {currentMovieId && (
          <Button onClick={() => router.push('/dashboard-admin/movies')}>
            Finish & View Movies
          </Button>
        )}
      </div>
    </div>
  );
}