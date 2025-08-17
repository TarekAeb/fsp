"use client";
import {
  Pencil,
  Trash2,
  PlusCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import MovieImageUpload from "@/components/Dashboard-admin/MovieImageUpload";
import VideoUpload from "@/components/Dashboard-admin/VideoUpload";
import SubtitleUpload from "@/components/Dashboard-admin/SubtitleUpload";
const movieTypes = ["short_movie", "documentary", "animation"];
interface Movie {
  id: number;
  title: string;
  releaseDate: Date;
  durationMinutes: number;
  rating: number;
  description: string;
  language: string;
  posterUrl: string;
  budget: number | null;
  boxOffice: number | null;
  trailerUrl: string | null;
  genres?: Genre[];
  directors?: Director[];
  cast?: CastMember[];
  type: "short_movie" | "documentary" | "animation";
}

interface Genre {
  id: number;
  name: string;
}

interface Director {
  id: number;
  name: string;
}

interface Actor {
  id: number;
  name: string;
}

interface CastMember {
  actorId: number;
  roleName: string;
  actor?: Actor;
}

interface FormDataType {
  title: string;
  releaseDate: Date;
  durationMinutes: number;
  rating: number;
  description: string;
  language: string;
  posterUrl: string;
  budget: number | null;
  boxOffice: number | null;
  trailerUrl: string | null;
  genres: number[];
  directors: number[];
  cast: { actorId: number; roleName: string }[];
  type: "short_movie" | "documentary" | "animation";
}

const initialFormData: FormDataType = {
  title: "",
  releaseDate: new Date(),
  durationMinutes: 0,
  rating: 0,
  description: "",
  language: "",
  posterUrl: "",
  budget: 0,
  boxOffice: 0,
  trailerUrl: "",
  genres: [],
  directors: [],
  cast: [],
  type: "short_movie",
};

type Step = 1 | 2 | 3 | 4;

export default function Movies() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [createdMovieId, setCreatedMovieId] = useState<number | null>(null);

  const [posterFile, setPosterFile] = useState<File | null>(null);
  // States for related entities
  const [genres, setGenres] = useState<Genre[]>([]);
  const [directors, setDirectors] = useState<Director[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);

  // For cast member selection in the form
  const [selectedActorId, setSelectedActorId] = useState<number | "">("");
  const [roleName, setRoleName] = useState("");

  // Step validation states
  const [stepValidation, setStepValidation] = useState({
    step1: false,
    step2: false,
    step3: false,
  });

  // Fetch all required data when component mounts
  useEffect(() => {
    fetchMovies();
    fetchGenres();
    fetchDirectors();
    fetchActors();
  }, []);

  // Validate steps
  useEffect(() => {
    setStepValidation({
      step1: !!(formData.title && formData.description && formData.language),
      step2: !!(
        formData.releaseDate &&
        formData.durationMinutes > 0 &&
        formData.rating > 0
      ),
      step3: formData.genres.length > 0 || formData.directors.length > 0,
    });
  }, [formData]);

  const fetchMovies = async () => {
    try {
      const response = await fetch("/api/admin/movies");
      if (response.ok) {
        const data = await response.json();
        setMovies(data);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await fetch("/api/admin/genres");
      if (response.ok) {
        const data = await response.json();
        setGenres(data);
      }
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchDirectors = async () => {
    try {
      const response = await fetch("/api/admin/alldirectors");
      if (response.ok) {
        const data = await response.json();
        setDirectors(data.directors);
      } else {
        throw new Error("Failed to fetch directors");
      }
    } catch (error) {
      console.error("Error fetching directors:", error);
    }
  };

  const fetchActors = async () => {
    try {
      const response = await fetch("/api/admin/allactors");
      if (response.ok) {
        const data = await response.json();
        setActors(data.actors);
      } else {
        throw new Error("Failed to fetch actors");
      }
    } catch (error) {
      console.error("Error fetching actors:", error);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsOpen(false);
    setCurrentStep(1);
    setCreatedMovieId(null);
    setSelectedActorId("");
    setRoleName("");
    setPosterFile(null);
  };

  const handleEdit = (movie: Movie) => {
    setFormData({
      title: movie.title,
      releaseDate: movie.releaseDate,
      durationMinutes: movie.durationMinutes,
      rating: movie.rating,
      description: movie.description,
      language: movie.language,
      posterUrl: movie.posterUrl,
      budget: movie.budget,
      boxOffice: movie.boxOffice,
      trailerUrl: movie.trailerUrl,
      genres: movie.genres?.map((g) => g.id) || [],
      directors: movie.directors?.map((d) => d.id) || [],
      cast:
        movie.cast?.map((c) => ({
          actorId: c.actorId,
          roleName: c.roleName,
        })) || [],
      type: "short_movie",
    });
    setEditingId(movie.id);
    setCreatedMovieId(movie.id);
    setCurrentStep(4); // Skip to video upload for editing
    setIsOpen(true);
  };

  const handleStepSubmit = async () => {
    if (currentStep === 3) {
      // Final step - create the movie
      await createMovie();
    } else {
      // Move to next step
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const createMovie = async () => {
    try {
      let posterUrl = formData.posterUrl;

      if (posterFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", posterFile);

        const uploadResponse = await fetch("/api/admin/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadData = await uploadResponse.json();
        posterUrl = uploadData.url;
      }

      const movieData = { ...formData, posterUrl };

      const response = await fetch("/api/admin/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(movieData),
      });

      if (!response.ok) {
        throw new Error("Failed to create movie");
      }

      const result = await response.json();
      setCreatedMovieId(result.id || result.movie?.id);
      setCurrentStep(4); // Move to video upload step
      await fetchMovies(); // Refresh movie list
    } catch (error) {
      console.error("Error creating movie:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "number") {
      const numValue = value === "" ? 0 : Number(value);
      const newValue =
        value === "" && (name === "budget" || name === "boxOffice")
          ? null
          : numValue;

      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Methods for handling multi-select relationships
  const handleGenreSelect = (genreId: number) => {
    setFormData((prev) => {
      if (!prev.genres.includes(genreId)) {
        return {
          ...prev,
          genres: [...prev.genres, genreId],
        };
      }
      return prev;
    });
  };

  const handleGenreRemove = (genreId: number) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.filter((id) => id !== genreId),
    }));
  };

  const handleDirectorSelect = (directorId: number) => {
    setFormData((prev) => {
      if (!prev.directors.includes(directorId)) {
        return {
          ...prev,
          directors: [...prev.directors, directorId],
        };
      }
      return prev;
    });
  };

  const handleDirectorRemove = (directorId: number) => {
    setFormData((prev) => ({
      ...prev,
      directors: prev.directors.filter((id) => id !== directorId),
    }));
  };

  const handleAddCastMember = () => {
    if (selectedActorId && roleName.trim()) {
      setFormData((prev) => ({
        ...prev,
        cast: [
          ...prev.cast,
          { actorId: Number(selectedActorId), roleName: roleName.trim() },
        ],
      }));
      setSelectedActorId("");
      setRoleName("");
    }
  };

  const handleRemoveCastMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      cast: prev.cast.filter((_, i) => i !== index),
    }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;
    try {
      const response = await fetch(`/api/admin/movies/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMovies((prev) => prev.filter((movie) => movie.id !== id));
      } else {
        throw new Error("Failed to delete movie");
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  const getStepTitle = (step: Step) => {
    switch (step) {
      case 1:
        return "Basic Information";
      case 2:
        return "Movie Details";
      case 3:
        return "Cast & Crew";
      case 4:
        return "Upload Video";
      default:
        return "";
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return stepValidation.step1;
      case 2:
        return stepValidation.step2;
      case 3:
        return stepValidation.step3;
      default:
        return false;
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step < currentStep
                ? "bg-green-500 text-white"
                : step === currentStep
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {step < currentStep ? <Check className="w-4 h-4" /> : step}
          </div>
          {step < 4 && (
            <div
              className={`w-12 h-0.5 mx-2 ${
                step < currentStep ? "bg-green-500" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter movie title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Enter movie description"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Language *</label>
              <Input
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                required
                placeholder="e.g., English, Spanish, French"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Movie Poster</label>
              <MovieImageUpload
                currentImage={formData.posterUrl}
                onImageChange={setPosterFile}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Release Date *</label>
                <Input
                  type="date"
                  name="releaseDate"
                  value={
                    formData.releaseDate instanceof Date
                      ? formData.releaseDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Duration (minutes) *
                </label>
                <Input
                  type="number"
                  name="durationMinutes"
                  value={formData.durationMinutes}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="120"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating (0-10) *</label>
                <Input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="8.5"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trailer URL</label>
                <Input
                  name="trailerUrl"
                  value={
                    formData.trailerUrl === null ? "" : formData.trailerUrl
                  }
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget ($)</label>
                <Input
                  type="number"
                  name="budget"
                  value={formData.budget === null ? "" : formData.budget}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="1000000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Box Office ($)</label>
                <Input
                  type="number"
                  name="boxOffice"
                  value={formData.boxOffice === null ? "" : formData.boxOffice}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="5000000"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Genres Section */}
            <div>
              <h3 className="text-sm font-medium mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.genres.map((genreId) => {
                  const genre = genres.find((g) => g.id === genreId);
                  return genre ? (
                    <Badge
                      key={genre.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {genre.name}
                      <button
                        type="button"
                        onClick={() => handleGenreRemove(genre.id)}
                        className="ml-1 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
              <Select
                onValueChange={(value) => handleGenreSelect(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres
                    .filter((genre) => !formData.genres.includes(genre.id))
                    .map((genre) => (
                      <SelectItem key={genre.id} value={genre.id.toString()}>
                        {genre.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Directors Section */}
            <div>
              <h3 className="text-sm font-medium mb-2">Directors</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.directors.map((directorId) => {
                  const director = directors.find((d) => d.id === directorId);
                  return director ? (
                    <Badge
                      key={director.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {director.name}
                      <button
                        type="button"
                        onClick={() => handleDirectorRemove(director.id)}
                        className="ml-1 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
              <Select
                onValueChange={(value) => handleDirectorSelect(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select director" />
                </SelectTrigger>
                <SelectContent>
                  {directors
                    .filter(
                      (director) => !formData.directors.includes(director.id)
                    )
                    .map((director) => (
                      <SelectItem
                        key={director.id}
                        value={director.id.toString()}
                      >
                        {director.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cast Section */}
            <div>
              <h3 className="text-sm font-medium mb-2">Cast (Optional)</h3>

              {formData.cast.length > 0 && (
                <div className="mb-4 border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="text-left p-2 font-medium">Actor</th>
                        <th className="text-left p-2 font-medium">Role</th>
                        <th className="p-2 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.cast.map((castMember, index) => {
                        const actor = actors.find(
                          (a) => a.id === castMember.actorId
                        );
                        return (
                          <tr key={index} className="border-b last:border-0">
                            <td className="p-2">{actor?.name || "Unknown"}</td>
                            <td className="p-2">{castMember.roleName}</td>
                            <td className="p-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveCastMember(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs font-medium block mb-1">
                    Actor
                  </label>
                  <Select
                    value={selectedActorId.toString()}
                    onValueChange={(value) => setSelectedActorId(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select actor" />
                    </SelectTrigger>
                    <SelectContent>
                      {actors.map((actor) => (
                        <SelectItem key={actor.id} value={actor.id.toString()}>
                          {actor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium block mb-1">
                    Role Name
                  </label>
                  <Input
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="Character name"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddCastMember}
                  disabled={!selectedActorId || !roleName.trim()}
                >
                  <PlusCircle className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium block mb-1">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as "short_movie" | "documentary" | "animation" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {movieTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      // In your movie form step 4, add:

      // In step 4 rendering:
      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-green-600 mb-2">
                🎉 Movie Created Successfully!
              </h3>
              <p className="text-muted-foreground">
                Now you can upload the video file and subtitles for your movie.
              </p>
            </div>

            {createdMovieId !== null && (
              <>
                <VideoUpload
                  movieId={createdMovieId}
                  onUploadComplete={(data) => {
                    console.log("Video uploaded successfully:", data);
                  }}
                />

                <SubtitleUpload
                  movieId={createdMovieId}
                  onUploadComplete={() => {
                    console.log("Subtitle uploaded successfully");
                  }}
                />
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Movies</h1>

        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) resetForm();
            setIsOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button size="lg">Add New Movie</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingId ? "Edit Movie" : `${getStepTitle(currentStep)}`}
              </DialogTitle>
            </DialogHeader>

            {!editingId && renderStepIndicator()}

            <div className="mt-4">{renderStepContent()}</div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setCurrentStep((prev) => Math.max(1, prev - 1) as Step)
                }
                disabled={currentStep === 1 || currentStep === 4}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleStepSubmit}
                  disabled={!canProceedToNextStep()}
                >
                  {currentStep === 3 ? "Create Movie" : "Next"}
                  {currentStep < 3 && <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
              ) : (
                <Button type="button" onClick={resetForm}>
                  Finish
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Movies Table */}
      <div className="border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Poster
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Title
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Description
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Release Date
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Rating
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Directors
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <tr
                key={movie.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="p-4 align-middle">
                  {movie.posterUrl && (
                    <div className="relative w-16 h-24 overflow-hidden rounded">
                      <Image
                        src={movie.posterUrl}
                        alt={`${movie.title} poster`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </td>
                <td className="p-4 align-middle font-medium">{movie.title}</td>
                <td className="p-4 align-middle">
                  {movie.description.length > 50
                    ? `${movie.description.substring(0, 50)}...`
                    : movie.description}
                </td>
                <td className="p-4 align-middle">
                  {new Date(movie.releaseDate).toLocaleDateString()}
                </td>
                <td className="p-4 align-middle">{movie.rating}</td>
                <td className="p-4 align-middle">
                  {movie.directors?.map((d) => d.name).join(", ")}
                </td>
                <td className="p-4 align-middle">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(movie)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(movie.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
