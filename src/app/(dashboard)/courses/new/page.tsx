'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { FileUpload } from '@/components/ui/FileUpload';
import api from '@/services/api';
import { Category } from '@/types';
import { ArrowLeft, Save, BookOpen, AlertCircle, Image as ImageIcon, Video } from 'lucide-react';
import Link from 'next/link';

export default function CreateCoursePage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        imageUrl: '',
        videoUrl: ''
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error('Failed to fetch categories', err);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.categoryId) {
            setError('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await api.post('/courses', {
                title: formData.title,
                description: formData.description,
                categoryId: parseInt(formData.categoryId),
                imageUrl: formData.imageUrl,
                videoUrl: formData.videoUrl || null
            });

            // Redirect to course details or edit page (modules)
            router.push(`/courses/${response.data.id}`);
        } catch (err: any) {
            console.error('Failed to create course', err);
            setError(err.response?.data?.message || 'Une erreur est survenue lors de la création du cours.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link href="/courses" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux cours
            </Link>

            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                    <BookOpen size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Nouveau Cours</h1>
                    <p className="text-slate-500 mt-1">Commencez à structurer votre nouveau contenu pédagogique.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="border-0 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200">
                    <CardHeader>
                        <CardTitle>Informations Générales</CardTitle>
                        <CardDescription>Ces détails seront visibles par vos futurs étudiants.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 flex items-center gap-3 animate-in shake duration-300">
                                <AlertCircle size={18} />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-slate-700 font-semibold">Titre du cours *</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="ex: Apprendre React de A à Z"
                                value={formData.title || ''}
                                onChange={handleChange}
                                className="h-12 focus-visible:ring-blue-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoryId" className="text-slate-700 font-semibold">Catégorie *</Label>
                            <div className="relative">
                                {isLoadingCategories ? (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Spinner size="sm" />
                                    </div>
                                ) : null}
                                <select
                                    id="categoryId"
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    disabled={isLoadingCategories}
                                    className="w-full h-12 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                >
                                    <option value="">Sélectionnez une catégorie</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-slate-700 font-semibold">Description courte *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Décrivez en quelques lignes ce que les étudiants vont apprendre..."
                                value={formData.description}
                                onChange={handleChange}
                                className="min-h-[150px] focus-visible:ring-blue-500 resize-none"
                            />
                            <p className="text-xs text-slate-400">Soyez concis et percutant pour attirer l'attention.</p>
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="imageUrl" className="text-slate-700 font-semibold flex items-center gap-2">
                                <ImageIcon size={18} className="text-blue-500" /> Image d'illustration
                            </Label>
                            
                            <FileUpload 
                                type="image"
                                label="Image de couverture"
                                description="Format JPG, PNG ou WebP. Max 5MB."
                                currentUrl={formData.imageUrl}
                                onUploadSuccess={(url, path) => {
                                    setFormData(prev => ({ ...prev, imageUrl: path }));
                                    setSuccess('Image mise en ligne avec succès.');
                                }}
                            />
                            
                            <div className="space-y-2">
                                <Label htmlFor="imageUrlInput" className="text-xs text-slate-500">Ou collez une URL directe</Label>
                                <Input
                                    id="imageUrl"
                                    name="imageUrl"
                                    placeholder="https://exemple.com/image.jpg"
                                    value={formData.imageUrl || ''}
                                    onChange={handleChange}
                                    className="h-10 text-sm focus-visible:ring-blue-600"
                                />
                                <p className="text-[10px] text-slate-400">Une belle image augmente le taux d'inscription.</p>
                            </div>
                        </div>

                        {/* Section Vidéo de présentation */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="videoUrl" className="text-slate-700 font-semibold flex items-center gap-2">
                                    <Video size={18} className="text-violet-500" /> Vidéo de présentation
                                </Label>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">Optionnel</span>
                            </div>

                            <FileUpload
                                type="video"
                                label="Importer une vidéo depuis la galerie"
                                description="Format MP4, MOV ou WebM. Max 500MB."
                                currentUrl={formData.videoUrl}
                                onUploadSuccess={(url, path) => {
                                    setFormData(prev => ({ ...prev, videoUrl: path }));
                                    setSuccess('Vidéo mise en ligne avec succès.');
                                }}
                            />

                            <div className="space-y-2">
                                <Label htmlFor="videoUrlInput" className="text-xs text-slate-500">Ou collez / écrivez une URL de vidéo</Label>
                                <Input
                                    value={formData.videoUrl || ''}
                                    onChange={handleChange}
                                    className="h-10 text-sm focus-visible:ring-violet-600"
                                />
                                <p className="text-[10px] text-slate-400">Une courte vidéo de présentation augmente l'engagement des étudiants.</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t border-slate-100 bg-slate-50/50 p-6 rounded-b-xl">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="min-w-[150px] shadow-lg shadow-blue-600/20">
                            {isSubmitting ? (
                                <><Spinner size="sm" className="mr-2" /> Création...</>
                            ) : (
                                <><Save size={18} className="mr-2" /> Créer le cours</>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
