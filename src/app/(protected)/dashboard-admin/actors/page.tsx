"use client";
import React, { useState, useCallback } from "react";
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
import { Pencil, Trash2, Upload, X } from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";


interface Actor {
    id: number;
    name: string;
    nationality: string;
    dateBirth: string;
    bio: string;
    photoUrl?: string;
}

interface FormDataType {
    name: string;
    nationality: string;
    birthDate: string;
    bio: string;
    photo?: File | null;
}

const initialFormData = {
    name: "",
    nationality: "",
    birthDate: "",
    bio: "",
    photo: null,
};

const Actors = () => {
    const [actors, setActors] = useState<Actor[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<FormDataType>(initialFormData);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`/api/admin/allactors`);
                if (response.ok) {
                    const data = await response.json();
                    setActors(data.actors);
                } else {
                    throw new Error('Failed to fetch actors');
                }
            } catch (error) {
                console.error("Error fetching actors:", error);
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

    const handleEdit = (actor: Actor) => {
        setFormData({
            name: actor.name,
            nationality: actor.nationality,
            birthDate: actor.dateBirth,
            bio: actor.bio,
            photo: null, // Reset photo since we can't get the File object from URL
        });
        setEditingId(actor.id);
        setPhotoPreview(actor.photoUrl || null);
        setIsOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this actor?")) return;
        try {
            const response = await fetch(`/api/admin/actors/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setActors((prev) => prev.filter((actor) => actor.id !== id));
            } else {
                throw new Error('Failed to delete actor');
            }
        } catch (error) {
            console.error("Error deleting actor:", error);
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
            alert("File must be an image (JPEG, PNG, GIF, WEBP)");
            return;
        }

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB");
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
        try {
            const url = editingId
                ? `/api/admin/actors/${editingId}`
                : `/api/admin/actors`;

            const method = editingId ? 'PUT' : 'POST';

            // Create FormData object for multipart/form-data submission
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('nationality', formData.nationality);
            formDataToSend.append('birthDate', formData.birthDate);
            formDataToSend.append('bio', formData.bio);

            // Only append photo if it exists
            if (formData.photo) {
                formDataToSend.append('photo', formData.photo);
            }

            const response = await fetch(url, {
                method,
                body: formDataToSend,
                // Don't set Content-Type header, browser sets it with boundary for FormData
            });

            if (!response.ok) {
                throw new Error(`Failed to ${editingId ? 'update' : 'create'} actor`);
            }

            const data = await response.json();

            // Refresh the actors list to get the updated data
            const actorsResponse = await fetch(`/api/admin/allactors`);
            if (actorsResponse.ok) {
                const actorsData = await actorsResponse.json();
                setActors(actorsData.actors);
            }

            resetForm();
        } catch (error) {
            console.error(`Error ${editingId ? 'updating' : 'creating'} actor:`, error);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Actors</h1>

                <Dialog open={isOpen} onOpenChange={(open) => {
                    if (!open) resetForm();
                    setIsOpen(open);
                }}>
                    <DialogTrigger asChild>
                        <Button size="lg">Add New Actor</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl">
                                {editingId ? 'Edit Actor' : 'Add New Actor'}
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
                                            alt="Actor photo preview"
                                            
                                            className="object-cover rounded-md"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full h-8 w-8"
                                            onClick={removePhoto}
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
                                            id="actor-photo"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <label
                                            htmlFor="actor-photo"
                                            className="flex flex-col items-center justify-center cursor-pointer"
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

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Biography
                                </label>
                                <Textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    required
                                    className="h-32 w-full"
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                {editingId ? 'Update Actor' : 'Create Actor'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Photo</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nationality</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Birth Date</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Biography</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {actors.map((actor) => (
                            <tr key={actor.id} className="border-b transition-colors hover:bg-muted/50">
                                <td className="p-4 align-middle">
                                    {actor.photoUrl ? (
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                                            <img
                                                src={actor.photoUrl}
                                                alt={actor.name}
                                                
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                            <span className="text-lg font-medium">
                                                {actor.name.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 align-middle font-medium">{actor.name}</td>
                                <td className="p-4 align-middle">{actor.nationality}</td>
                                <td className="p-4 align-middle">
                                    {new Date(actor.dateBirth).toLocaleDateString()}
                                </td>
                                <td className="p-4 align-middle max-w-md truncate">
                                    {actor.bio}
                                </td>
                                <td className="p-4 align-middle">
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleEdit(actor)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleDelete(actor.id)}
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
};

export default Actors;