'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { buttonVariants } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { Course } from '@/types';
import api from '@/services/api';
import { getImageUrl } from '@/utils/url';
import { Search, BookOpen, Clock, Users, PlusCircle, Edit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MyCoursesPage() {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchMyCourses = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get('/courses/my-courses');
                setCourses(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Failed to fetch my courses', error);
                setError('Impossible de charger vos cours.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyCourses();
    }, []);

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mes Formations</h1>
                    <p className="text-slate-500 mt-1">Gérez le contenu de vos cours.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            placeholder="Filtrer mes cours..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Link href="/courses/new" className={buttonVariants()}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Créer
                    </Link>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Spinner size="lg" />
                </div>
            ) : error ? (
                <div className="text-center py-20 border border-dashed rounded-lg border-red-200 bg-red-50">
                    <BookOpen className="w-12 h-12 text-red-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-red-900">{error}</h3>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-lg border-slate-200 bg-white">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">Vous n'avez pas encore créé de cours</h3>
                    <p className="text-slate-500 mt-1">Commencez par créer votre première formation !</p>
                    <Link href="/courses/new" className={buttonVariants({ variant: "outline", className: "mt-4" })}>
                        Créer mon premier cours
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <Card key={course.id} className="flex flex-col group overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                {course.imageUrl ? (
                                    <img 
                                        src={getImageUrl(course.imageUrl)} 
                                        alt={course.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                ) : (
                                    <BookOpen className="w-16 h-16 text-slate-300" />
                                )}
                                <div className="absolute top-2 right-2">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm ${
                                        course.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                                        course.status === 'ARCHIVED' ? 'bg-amber-100 text-amber-700' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                        {course.status === 'PUBLISHED' ? 'Publié' : 
                                         course.status === 'ARCHIVED' ? 'Archivé' : 'Brouillon'}
                                    </span>
                                </div>
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="line-clamp-1 text-lg">
                                    {course.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {course.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 pb-4">
                                <div className="flex items-center text-xs text-slate-500 gap-4">
                                    <div className="flex items-center">
                                        <Clock className="w-3.5 h-3.5 mr-1" />
                                        <span>{course.modules?.length || 0} modules</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="w-3.5 h-3.5 mr-1" />
                                        <span>{(course as any).studentCount || 0} étudiants</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 border-t border-slate-50 gap-2">
                                <Link href={`/courses/${course.id}`} className={buttonVariants({ variant: "outline", size: "sm", className: "flex-1" })}>
                                    Voir
                                </Link>
                                <Link href={`/courses/${course.id}/edit`} className={buttonVariants({ size: "sm", className: "flex-1" })}>
                                    <Edit className="w-3.5 h-3.5 mr-1.5" />
                                    Éditer
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
