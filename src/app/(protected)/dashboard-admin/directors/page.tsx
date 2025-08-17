"use client";
import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle, Pencil, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import {
    Card,
    CardContent
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Director {
    id: number;
    name: string;
    nationality: string;
    dateBirth: string;
    photoUrl?: string;
}

interface FormDataType {
    name: string;
    nationality: string;
    birthDate: string;
    photo?: File | null;
}

const initialFormData = {
    name: "",
    nationality: "",
    birthDate: "",
    photo: null,
};


const Directors = () => {
    const [directors, setDirectors] = useState<Director[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<FormDataType>(initialFormData);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`/api/admin/alldirectors`);
                if (response.ok) {
                    const data = await response.json();
                    setDirectors(data.directors);
                } else {
                    throw new Error('Failed to fetch directors');
                }
            } catch (error) {
                console.error("Error fetching directors:", error);
            }
        })();
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setEditingId(null);
        setIsOpen(false);
        setPhotoPreview(null);
    };

    const handleEdit = (director: Director) => {
        setFormData({
            name: director.name,
            nationality: director.nationality,
            birthDate: director.dateBirth,
            photo: null, // Reset photo since we can't get the File object from URL
        });
        setEditingId(director.id);
        setPhotoPreview(director.photoUrl || null);
        setIsOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/admin/directors/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setDirectors((prev) => prev.filter((director) => director.id !== id));
                toast({
                    title: "Director deleted",
                    description: "The director has been successfully deleted.",
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete director');
            }
        } catch (error) {
            console.error("Error deleting director:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete director",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // File drag handlers
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            handleFile(file);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            handleFile(file);
        }
    };

    const handleFile = (file: File) => {
        // Check if file is an image
        if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
            toast({
                variant: "destructive",
                title: "Invalid file type",
                description: "File must be an image (JPEG, PNG, GIF, WEBP)",
            });
            return;
        }

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                variant: "destructive",
                title: "File too large",
                description: "File size must be less than 5MB",
            });
            return;
        }

        setFormData(prev => ({ ...prev, photo: file }));

        // Create a preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removePhoto = () => {
        setFormData(prev => ({ ...prev, photo: null }));
        setPhotoPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const url = editingId
                ? `/api/admin/directors/${editingId}`
                : `/api/admin/directors`;

            const method = editingId ? 'PUT' : 'POST';

            // Create FormData object for multipart/form-data submission
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('nationality', formData.nationality);
            formDataToSend.append('birthDate', formData.birthDate);

            // Only append photo if it exists
            if (formData.photo) {
                formDataToSend.append('photo', formData.photo);
            }

            const response = await fetch(url, {
                method,
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${editingId ? 'update' : 'create'} director`);
            }

            toast({
                title: editingId ? "Director updated" : "Director created",
                description: `The director has been successfully ${editingId ? 'updated' : 'created'}.`,
            });

            // Refresh the directors list
            const directorResponse = await fetch(`/api/admin/alldirectors`);
            if (directorResponse.ok) {
                const directorData = await directorResponse.json();
                setDirectors(directorData.directors);
            } resetForm();
        } catch (error) {
            console.error(`Error ${editingId ? 'updating' : 'creating'} director:`, error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : `Failed to ${editingId ? 'update' : 'create'} director`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Format date for display
    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Directors</h1>

                <Dialog open={isOpen} onOpenChange={(open) => {
                    if (!open) resetForm();
                    setIsOpen(open);
                }}>
                    <DialogTrigger asChild>
                        <Button size="lg">Add New Director</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl">
                                {editingId ? 'Edit Director' : 'Add New Director'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Name
                                </label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Nationality
                                </label>
                                <Input
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Birth Date
                                </label>
                                <Input
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Photo Upload Area */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Photo
                                </label>

                                {photoPreview ? (
                                    <div className="relative w-48 h-48 mx-auto">
                                        <img
                                            src={photoPreview}
                                            alt="Director photo preview"
                                            className="object-cover rounded-md"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full h-8 w-8"
                                            onClick={removePhoto}
                                            disabled={isLoading}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        className={`border-2 border-dashed rounded-md p-8 text-center transition-colors ${dragActive
                                            ? "border-primary bg-primary/10"
                                            : "border-gray-300 hover:border-primary/50"
                                            }`}
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="director-photo"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            disabled={isLoading}
                                        />
                                        <label
                                            htmlFor="director-photo"
                                            className={`flex flex-col items-center justify-center ${isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                                        >
                                            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground mb-1">
                                                Drag and drop or click to upload
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                PNG, JPG, GIF or WEBP (max. 5MB)
                                            </p>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    editingId ? 'Update Director' : 'Create Director'
                                )}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading && !directors.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(6).fill(null).map((_, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-4 space-y-3">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-1/3" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : directors.length === 0 ? (
                <div className="text-center py-10 border rounded-lg">
                    <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No directors found</h3>
                    <p className="text-muted-foreground">Add your first director to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {directors.map((director, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        {director.photoUrl ? (
                                            <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                                <img
                                                    src={director.photoUrl}
                                                    alt={director.name}
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-xl font-medium text-primary">
                                                    {director.name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-medium truncate">{director.name}</h3>
                                        <p className="text-sm text-muted-foreground">{director.nationality}</p>
                                        <p className="text-sm mt-1">{formatDate(director.dateBirth)}</p>
                                    </div>
                                    <div className="flex-shrink-0 flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleEdit(director)}
                                            disabled={isLoading}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    disabled={isLoading}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete {director.name} from the directors list.
                                                        This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(director.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Directors;