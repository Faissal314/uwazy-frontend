'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { FileUpload } from '@/components/ui/FileUpload';
import api from '@/services/api';
import { Course, Module, Lesson, Quiz } from '@/types';
import { getImageUrl } from '@/utils/url';
import {
    ArrowLeft, Save, Plus, Trash2, Video, FileText, HelpCircle,
    ChevronDown, ChevronUp, Send, CheckCircle2, AlertCircle, Layout,
    Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { QuizEditor } from './QuizEditor';

export default function CourseEditPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const routeParams = use(params);
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Editing states
    const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [newModule, setNewModule] = useState({ title: '', description: '', orderIndex: 0 });
    const [editingQuiz, setEditingQuiz] = useState<{ id: number; title: string } | null>(null);

    useEffect(() => {
        fetchCourse();
    }, [routeParams.id]);

    const fetchCourse = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/courses/${routeParams.id}`);
            setCourse(response.data);
            if (response.data.modules && response.data.modules.length > 0) {
                setActiveModuleId(response.data.modules[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch course', err);
            setError('Impossible de charger le cours.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddModule = async () => {
        if (!newModule.title) return;
        try {
            const orderIndex = (course?.modules?.length || 0) + 1;
            await api.post(`/courses/${routeParams.id}/modules`, {
                ...newModule,
                orderIndex
            });
            setNewModule({ title: '', description: '', orderIndex: 0 });
            setIsAddingModule(false);
            fetchCourse();
            setSuccess('Module ajouté avec succès.');
        } catch (err) {
            setError('Erreur lors de l\'ajout du module.');
        }
    };

    const handleAddLesson = async (moduleId: number) => {
        const title = prompt('Titre de la leçon :');
        if (!title) return;
        try {
            const module = course?.modules?.find(m => m.id === moduleId);
            const orderIndex = (module?.lessons?.length || 0) + 1;
            await api.post(`/modules/${moduleId}/lessons`, {
                title,
                content: 'Contenu de la leçon à éditer...',
                orderIndex
            });
            fetchCourse();
        } catch (err) {
            setError('Erreur lors de l\'ajout de la leçon.');
        }
    };

    const handleAddQuiz = async (moduleId: number) => {
        const title = prompt('Titre du quiz :');
        if (!title) return;
        const description = prompt('Description du quiz :');
        try {
            await api.post(`/modules/${moduleId}/quizzes`, {
                title,
                description: description || ''
            });
            fetchCourse();
            setSuccess('Quiz ajouté avec succès. (La gestion des questions sera disponible ultérieurement)');
        } catch (err) {
            setError('Erreur lors de l\'ajout du quiz.');
        }
    };

    const handleSubmitForValidation = async () => {
        setIsSubmitting(true);
        try {
            await api.put(`/courses/${routeParams.id}/submit`);
            setSuccess('Cours soumis pour validation.');
            fetchCourse();
        } catch (err) {
            setError('Erreur lors de la soumission.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="flex justify-center py-20"><Spinner size="xl" /></div>;
    if (!course) return <div className="text-center py-20">Cours introuvable.</div>;

    return (
        <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/courses/${course.id}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Éditeur de cours</h1>
                        <p className="text-slate-500 text-sm">Gestion du contenu et de la structure</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.push(`/courses/${course.id}`)}>
                        Aperçu
                    </Button>
                    {course.status === 'DRAFT' && (
                        <Button onClick={handleSubmitForValidation} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                            <Send size={18} className="mr-2" /> Soumettre pour validation
                        </Button>
                    )}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} /> {error}
                </div>
            )}
            {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center gap-2">
                    <CheckCircle2 size={18} /> {success}
                </div>
            )}

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle>Détails du cours</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="title">Titre du cours</Label>
                            <Input
                                id="title"
                                value={course.title || ''}
                                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="imageUrl" className="flex items-center gap-2">
                                <ImageIcon size={16} className="text-blue-500" /> Image du cours
                            </Label>
                            <FileUpload 
                                type="image"
                                currentUrl={course.imageUrl}
                                onUploadSuccess={(url, path) => setCourse({ ...course, imageUrl: path })}
                                description="Image de couverture du cours"
                            />
                            {course.imageUrl && (
                                <div className="mt-2 relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200">
                                    <img 
                                        src={getImageUrl(course.imageUrl)} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <Input
                                id="imageUrl"
                                value={course.imageUrl || ''}
                                onChange={(e) => setCourse({ ...course, imageUrl: e.target.value })}
                                placeholder="Ou URL directe : https://..."
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>
                    <div className="space-y-2 mb-4">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={course.description || ''}
                            onChange={(e) => setCourse({ ...course, description: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <Button 
                            variant="ghost" 
                            className="text-red-500 hover:bg-red-50"
                            onClick={async () => {
                                if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.')) {
                                    try {
                                        await api.delete(`/courses/${course.id}`);
                                        router.push('/dashboard');
                                    } catch (e) {
                                        setError('Erreur lors de la suppression du cours.');
                                    }
                                }
                            }}
                        >
                            <Trash2 size={18} className="mr-2" /> Supprimer le cours
                        </Button>
                        <Button variant="outline" onClick={async () => {
                            try {
                                await api.put(`/courses/${course.id}`, {
                                    title: course.title,
                                    description: course.description,
                                    imageUrl: course.imageUrl
                                });
                                setSuccess('Détails du cours mis à jour.');
                            } catch (e) {
                                setError('Erreur lors de la mise à jour des détails.');
                            }
                        }}>
                            Sauvegarder les détails
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar: Modules */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-slate-700 uppercase p-2 text-xs tracking-wider">Modules</h2>
                        <Button size="sm" variant="ghost" onClick={() => setIsAddingModule(true)}>
                            <Plus size={16} />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {course.modules?.map((module) => (
                            <button
                                key={module.id}
                                onClick={() => setActiveModuleId(module.id)}
                                className={`w-full text-left p-3 rounded-xl transition-all border ${activeModuleId === module.id
                                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm ring-1 ring-blue-200'
                                    : 'border-transparent hover:bg-slate-50 text-slate-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Layout size={18} className={activeModuleId === module.id ? 'text-blue-500' : 'text-slate-400'} />
                                    <span className="font-medium truncate">{module.title}</span>
                                </div>
                            </button>
                        ))}
                        {isAddingModule && (
                            <div className="p-3 bg-white border border-blue-200 rounded-xl space-y-3 shadow-lg">
                                <Input
                                    placeholder="Titre du module"
                                    value={newModule.title}
                                    onChange={e => setNewModule({ ...newModule, title: e.target.value })}
                                    className="h-9 text-sm"
                                />
                                <div className="flex gap-2">
                                    <Button size="sm" className="w-full" onClick={handleAddModule}>Ajouter</Button>
                                    <Button size="sm" variant="outline" onClick={() => setIsAddingModule(false)}>X</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content: Lessons & Quizzes */}
                <div className="lg:col-span-3">
                    {editingQuiz ? (
                        <QuizEditor 
                            quizId={editingQuiz.id} 
                            quizTitle={editingQuiz.title} 
                            onClose={() => setEditingQuiz(null)} 
                        />
                    ) : activeModuleId ? (
                        <div className="space-y-6">
                            {course.modules?.find(m => m.id === activeModuleId)?.lessons?.map((lesson, idx) => (
                                <Card key={lesson.id} className="border-slate-200 shadow-sm overflow-hidden group">
                                    <div className="w-full bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-200 shadow-sm">
                                                {idx + 1}
                                            </div>
                                            <h3 className="font-bold text-slate-800">{lesson.title}</h3>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="text-red-500 hover:bg-red-50"
                                                onClick={async () => {
                                                    if (confirm('Supprimer cette leçon ?')) {
                                                        try {
                                                            await api.delete(`/modules/${activeModuleId}/lessons/${lesson.id}`);
                                                            fetchCourse();
                                                            setSuccess('Leçon supprimée.');
                                                        } catch (e) {
                                                            setError('Erreur lors de la suppression.');
                                                        }
                                                    }
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 font-bold text-slate-700">
                                                    <Video size={16} className="text-blue-500" /> Vidéo de la leçon
                                                </Label>
                                                <FileUpload 
                                                    type="video"
                                                    currentUrl={lesson.videoUrl || ''}
                                                    onUploadSuccess={(url, path) => {
                                                        const updatedModules = [...(course.modules || [])];
                                                        const moduleIdx = updatedModules.findIndex(m => m.id === activeModuleId);
                                                        if (moduleIdx !== -1) {
                                                            const lessonIdx = updatedModules[moduleIdx].lessons!.findIndex(l => l.id === lesson.id);
                                                            if (lessonIdx !== -1) {
                                                                updatedModules[moduleIdx].lessons![lessonIdx].videoUrl = path;
                                                                setCourse({ ...course, modules: updatedModules });
                                                            }
                                                        }
                                                    }}
                                                    description="Importer de la galerie (.mp4, .mov)"
                                                />
                                                <Input
                                                    value={lesson.videoUrl || ''}
                                                    onChange={(e) => {
                                                        const updatedModules = [...(course.modules || [])];
                                                        const moduleIdx = updatedModules.findIndex(m => m.id === activeModuleId);
                                                        if (moduleIdx !== -1) {
                                                            const lessonIdx = updatedModules[moduleIdx].lessons!.findIndex(l => l.id === lesson.id);
                                                            if (lessonIdx !== -1) {
                                                                updatedModules[moduleIdx].lessons![lessonIdx].videoUrl = e.target.value;
                                                                setCourse({ ...course, modules: updatedModules });
                                                            }
                                                        }
                                                    }}
                                                    placeholder="Ou lien YouTube/Vimeo"
                                                    className="focus:ring-blue-500 h-8 text-xs mt-2"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 font-bold text-slate-700">
                                                    <FileText size={16} className="text-blue-500" /> Support PDF / Document
                                                </Label>
                                                <FileUpload 
                                                    type="document"
                                                    currentUrl={lesson.documentUrl || ''}
                                                    onUploadSuccess={(url, path) => {
                                                        const updatedModules = [...(course.modules || [])];
                                                        const moduleIdx = updatedModules.findIndex(m => m.id === activeModuleId);
                                                        if (moduleIdx !== -1) {
                                                            const lessonIdx = updatedModules[moduleIdx].lessons!.findIndex(l => l.id === lesson.id);
                                                            if (lessonIdx !== -1) {
                                                                updatedModules[moduleIdx].lessons![lessonIdx].documentUrl = path;
                                                                setCourse({ ...course, modules: updatedModules });
                                                            }
                                                        }
                                                    }}
                                                    description="Importer (.pdf, .doc)"
                                                />
                                                <Input
                                                    value={lesson.documentUrl || ''}
                                                    onChange={(e) => {
                                                        const updatedModules = [...(course.modules || [])];
                                                        const moduleIdx = updatedModules.findIndex(m => m.id === activeModuleId);
                                                        if (moduleIdx !== -1) {
                                                            const lessonIdx = updatedModules[moduleIdx].lessons!.findIndex(l => l.id === lesson.id);
                                                            if (lessonIdx !== -1) {
                                                                updatedModules[moduleIdx].lessons![lessonIdx].documentUrl = e.target.value;
                                                                setCourse({ ...course, modules: updatedModules });
                                                            }
                                                        }
                                                    }}
                                                    placeholder="Ou lien vers le support"
                                                    className="focus:ring-blue-500 h-8 text-xs mt-2"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Contenu de la leçon</Label>
                                            <Textarea
                                                value={lesson.content || ''}
                                                onChange={(e) => {
                                                    const updatedModules = [...(course.modules || [])];
                                                    const moduleIdx = updatedModules.findIndex(m => m.id === activeModuleId);
                                                    if (moduleIdx !== -1) {
                                                        const lessonIdx = updatedModules[moduleIdx].lessons!.findIndex(l => l.id === lesson.id);
                                                        if (lessonIdx !== -1) {
                                                            updatedModules[moduleIdx].lessons![lessonIdx].content = e.target.value;
                                                            setCourse({ ...course, modules: updatedModules });
                                                        }
                                                    }
                                                }}
                                                className="min-h-[100px]"
                                                placeholder="Texte d'accompagnement..."
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-slate-50/30 p-4 flex justify-end gap-2 border-t border-slate-50">
                                        <Button size="sm" variant="ghost" onClick={async () => {
                                            try {
                                                await api.put(`/modules/${activeModuleId}/lessons/${lesson.id}`, {
                                                    title: lesson.title,
                                                    content: lesson.content,
                                                    videoUrl: lesson.videoUrl,
                                                    documentUrl: lesson.documentUrl,
                                                    orderIndex: lesson.orderIndex
                                                });
                                                setSuccess(`Leçon "${lesson.title}" sauvegardée.`);
                                            } catch (e) {
                                                setError("Erreur lors de la sauvegarde de la leçon.");
                                            }
                                        }}>Enregistrer les modifs</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                            
                            {course.modules?.find(m => m.id === activeModuleId)?.quizzes?.map((quiz, idx) => (
                                <Card key={`quiz-${quiz.id}`} className="border-amber-200 shadow-sm overflow-hidden group">
                                    <div className="w-full bg-amber-50 p-4 border-b border-amber-100 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-amber-600 border border-amber-200 shadow-sm">
                                                Q
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-amber-900">{quiz.title}</h3>
                                                {quiz.description && <p className="text-xs text-amber-700">{quiz.description}</p>}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="bg-white border-amber-200 text-amber-700 hover:bg-amber-50"
                                                onClick={() => setEditingQuiz({ id: quiz.id, title: quiz.title })}
                                            >
                                                Gérer les questions
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="text-red-500 hover:bg-red-50"
                                                onClick={async () => {
                                                    if (confirm('Supprimer ce quiz ?')) {
                                                        try {
                                                            await api.delete(`/modules/${activeModuleId}/quizzes/${quiz.id}`);
                                                            fetchCourse();
                                                            setSuccess('Quiz supprimé.');
                                                        } catch (e) {
                                                            setError('Erreur lors de la suppression.');
                                                        }
                                                    }
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button
                                    variant="outline"
                                    className="h-24 border-dashed border-2 hover:bg-blue-50/50 hover:border-blue-300 transition-all flex-col gap-2"
                                    onClick={() => handleAddLesson(activeModuleId)}
                                >
                                    <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                        <Plus size={20} />
                                    </div>
                                    <span>Nouvelle leçon</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-24 border-dashed border-2 hover:bg-amber-50/50 hover:border-amber-300 transition-all flex-col gap-2"
                                    onClick={() => handleAddQuiz(activeModuleId)}
                                >
                                    <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                                        <HelpCircle size={20} />
                                    </div>
                                    <span>Ajouter un Quiz</span>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                            <Layout size={48} className="mb-4 opacity-20" />
                            <p>Sélectionnez ou créez un module pour commencer à ajouter du contenu.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
