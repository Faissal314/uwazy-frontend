'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Course } from '@/types';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, BookOpen, Clock, Users, PlayCircle, CheckCircle } from 'lucide-react';
import { getImageUrl } from '@/utils/url';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = useAuth();
    const router = useRouter();
    const routeParams = use(params);

    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchCourseAndReviews = async () => {
            if (!routeParams.id || isNaN(Number(routeParams.id))) {
                setIsLoading(false);
                return;
            }
            
            try {
                const [courseRes, reviewsRes] = await Promise.all([
                    api.get(`/courses/${routeParams.id}`),
                    api.get(`/courses/${routeParams.id}/reviews`)
                ]);
                setCourse(courseRes.data);
                setReviews(reviewsRes.data);
            } catch (error) {
                console.error('Failed to fetch course details', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourseAndReviews();
    }, [routeParams.id]);

    const handleEnroll = async () => {
        setIsEnrolling(true);
        try {
            await api.post(`/enrollments/courses/${routeParams.id}`);
            router.push(`/courses/${routeParams.id}/learn`);
        } catch (error) {
            console.error('Enrollment failed', error);
            // Even if it fails (already enrolled), let's go learn
            router.push(`/courses/${routeParams.id}/learn`);
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingReview(true);
        try {
            const res = await api.post(`/courses/${routeParams.id}/reviews`, { rating, comment });
            setReviews([res.data, ...reviews]);
            setComment('');
        } catch (error) {
            console.error('Review submission failed', error);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Spinner size="xl" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-900">Cours introuvable</h2>
                <Link href="/courses" className={buttonVariants({ variant: 'link' })}>Retour au catalogue</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <Link href="/courses" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Retour au catalogue
                </Link>
                {user?.id === course.instructor?.id && (
                    <Link href={`/courses/${course.id}/edit`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                        Gérer le cours
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-12">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                                {course.category?.name || "Général"}
                            </span>
                            <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" /> {course.status}
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            {course.title}
                        </h1>
                        <p className="text-lg text-slate-600 mt-4 leading-relaxed whitespace-pre-line">
                            {course.description}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Programme du cours</h2>
                        {course.modules && course.modules.length > 0 ? (
                            <div className="space-y-3">
                                {course.modules.sort((a, b) => a.orderIndex - b.orderIndex).map((module, idx) => (
                                    <Card key={module.id} className="border border-slate-200 shadow-sm">
                                        <CardHeader className="py-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-base text-slate-900">
                                                        Module {idx + 1}: {module.title}
                                                    </CardTitle>
                                                    {module.description && (
                                                        <CardDescription className="mt-1">{module.description}</CardDescription>
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                                    {module.lessons?.length || 0} leçons
                                                </span>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50">
                                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">Le programme est en cours de création.</p>
                            </div>
                        )}
                    </div>

                    {/* Reviews Section */}
                    <div className="space-y-8 pt-6 border-t border-slate-100">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Avis et Évaluations</h2>
                        
                        {(user?.role === 'ETUDIANT' && user.id !== course.instructor?.id) && (
                            <Card className="border-blue-50 bg-blue-50/20">
                                <CardHeader>
                                    <CardTitle className="text-lg">Laisser un avis</CardTitle>
                                    <CardDescription>Partagez votre expérience avec les autres étudiants.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium text-slate-700">Note:</label>
                                            <select 
                                                className="bg-white border border-slate-200 rounded p-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                value={rating}
                                                onChange={(e) => setRating(parseInt(e.target.value))}
                                            >
                                                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} étoiles</option>)}
                                            </select>
                                        </div>
                                        <textarea 
                                            placeholder="Votre commentaire..." 
                                            className="w-full h-24 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                        />
                                        <Button type="submit" disabled={isSubmittingReview}>
                                            {isSubmittingReview ? "Envoi..." : "Publier l'avis"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        <div className="space-y-6 mt-6">
                            {reviews.length === 0 ? (
                                <p className="text-slate-500 text-center py-8 italic">Aucun avis pour le moment. Soyez le premier !</p>
                            ) : (
                                reviews.map(review => (
                                    <div key={review.id} className="flex gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 shrink-0">
                                            {review.userName[0]}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900">{review.userName}</span>
                                                <div className="flex text-amber-400 text-xs">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600">{review.comment}</p>
                                            <p className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1">
                    <Card className="sticky top-24 border-blue-100 shadow-xl shadow-blue-900/5">
                        <div className="aspect-video bg-slate-900 flex items-center justify-center rounded-t-xl overflow-hidden">
                            {course.videoUrl ? (
                                <video 
                                    src={getImageUrl(course.videoUrl)} 
                                    controls 
                                    className="w-full h-full object-cover"
                                />
                            ) : course.imageUrl ? (
                                <img src={getImageUrl(course.imageUrl)} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                                <PlayCircle className="w-16 h-16 text-white/50" />
                            )}
                        </div>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex flex-col space-y-3">
                                <div className="flex items-center text-sm">
                                    <Clock className="w-5 h-5 mr-3 text-slate-400" />
                                    <span className="font-medium text-slate-700">Rythme libre</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <BookOpen className="w-5 h-5 mr-3 text-slate-400" />
                                    <span className="font-medium text-slate-700">{course.modules?.length || 0} modules</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Users className="w-5 h-5 mr-3 text-slate-400" />
                                    <span className="font-medium text-slate-700">Par {course.instructor?.firstName} {course.instructor?.lastName}</span>
                                </div>
                            </div>

                            {user?.id === course.instructor?.id ? (
                                <Link href={`/courses/${course.id}/learn`} className={buttonVariants({ variant: 'default', size: 'lg', className: 'w-full text-base' })}>
                                    <PlayCircle className="w-5 h-5 mr-2" />
                                    <span>Aperçu du cours</span>
                                </Link>
                            ) : user?.role === 'ETUDIANT' ? (
                                <Button size="lg" className="w-full text-base" onClick={handleEnroll} disabled={isEnrolling}>
                                    {isEnrolling && <Spinner className="w-5 h-5 mr-2" />}
                                    <span>{isEnrolling ? "Inscription..." : "Commencer le cours"}</span>
                                </Button>
                            ) : (
                                <div className="text-center text-sm font-medium text-slate-500 py-2 border border-slate-100 rounded-md bg-slate-50">
                                    Mode administrateur / formateur
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
