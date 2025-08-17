"use client";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Genre {
    id: number;
    name: string;
}

export default function Genres() {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "" });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all genres when component mounts
    useEffect(() => {
        fetchGenres();
    }, []);

    const fetchGenres = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/genres`);
            if (response.ok) {
                const data = await response.json();
                setGenres(data);
            } else {
                console.error("Failed to fetch genres");
            }
        } catch (error) {
            console.error("Error fetching genres:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: "" });
        setEditingId(null);
        setIsOpen(false);
    };

    const handleEdit = (genre: Genre) => {
        setFormData({ name: genre.name });
        setEditingId(genre.id);
        setIsOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert("Genre name cannot be empty");
            return;
        }

        try {
            const url = editingId
                ? `/api/admin/genres/${editingId}`
                : `/api/admin/genres`;

            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${editingId ? 'update' : 'create'} genre`);
            }

            // Refresh the genres list after successful operation
            await fetchGenres();
            resetForm();
        } catch (error) {
            console.error(`Error ${editingId ? 'updating' : 'creating'} genre:`, error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this genre? This may affect movies using this genre.")) return;

        try {
            const response = await fetch(`/api/admin/genres/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setGenres((prev) => prev.filter((genre) => genre.id !== id));
            } else {
                throw new Error('Failed to delete genre');
            }
        } catch (error) {
            console.error("Error deleting genre:", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Genres</h1>

                <Dialog open={isOpen} onOpenChange={(open) => {
                    if (!open) resetForm();
                    setIsOpen(open);
                }}>
                    <DialogTrigger asChild>
                        <Button size="lg">Add New Genre</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl">
                                {editingId ? 'Edit Genre' : 'Add New Genre'}
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
                                    placeholder="Enter genre name"
                                    className="w-full"
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                {editingId ? 'Update Genre' : 'Create Genre'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={3} className="p-4 text-center">Loading genres...</td>
                            </tr>
                        ) : genres.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-4 text-center">No genres found. Add one to get started!</td>
                            </tr>
                        ) : (
                            genres.map((genre, index) => (
                                <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle">{genre.id}</td>
                                    <td className="p-4 align-middle font-medium">{genre.name}</td>
                                    <td className="p-4 align-middle">
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleEdit(genre)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDelete(genre.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}