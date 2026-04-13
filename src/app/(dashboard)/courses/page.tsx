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
import { Search, BookOpen, Clock, Users } from 'lucide-react';

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get('/courses');
                setCourses(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Failed to fetch courses', error);
                setError('Impossible de charger les cours. Veuillez vérifier que le serveur est lancé.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Catalogue des cours</h1>
                    <p className="text-slate-500 mt-1">Découvrez et inscrivez-vous à de nouveaux cours.</p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Rechercher un cours..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
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
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 text-red-600 hover:text-red-800 font-medium"
                    >
                        Réessayer
                    </button>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-lg border-slate-200 bg-white">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">Aucun cours trouvé</h3>
                    <p className="text-slate-500 mt-1">Essayez de modifier votre recherche.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <Card key={course.id} className="flex flex-col group overflow-hidden">
                            <div className="h-40 bg-blue-50 relative overflow-hidden flex items-center justify-center">
                                {course.imageUrl ? (
                                    <img 
                                        src={getImageUrl(course.imageUrl)} 
                                        alt={course.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                ) : (
                                    <BookOpen className="w-16 h-16 text-blue-200 group-hover:scale-110 transition-transform duration-500" />
                                )}
                            </div>
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                                        {course.category?.name || "Général"}
                                    </span>
                                </div>
                                <CardTitle className="line-clamp-2 hover:underline decoration-blue-500 decoration-2 underline-offset-2">
                                    <Link href={`/courses/${course.id}`}>{course.title}</Link>
                                </CardTitle>
                                <CardDescription className="line-clamp-2 mt-2">
                                    {course.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="flex items-center text-sm text-slate-500 gap-4 mt-2">
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>~ {course.modules?.length || 0} modules</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        <span>{course.instructor?.firstName} {course.instructor?.lastName}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Link href={`/courses/${course.id}`} className={buttonVariants({ className: "w-full" })}>
                                    Voir les détails
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
