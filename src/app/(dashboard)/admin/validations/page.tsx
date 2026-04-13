'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import api from '@/services/api';
import { Course } from '@/types';
import { CheckCircle, XCircle, Eye, ShieldAlert, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminValidationsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'ADMINISTRATEUR') {
            router.push('/dashboard');
            return;
        }
        fetchPendingCourses();
    }, [user]);

    const fetchPendingCourses = async () => {
        try {
            const response = await api.get('/courses/status/PENDING_VALIDATION');
            setCourses(response.data);
        } catch (error) {
            console.error('Failed to fetch pending courses', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        setActionLoading(id);
        try {
            await api.put(`/courses/${id}/publish`);
            setCourses(courses.filter(c => c.id !== id));
        } catch (error) {
            console.error('Approval failed', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: number) => {
        setActionLoading(id);
        try {
            await api.put(`/courses/${id}/reject`);
            setCourses(courses.filter(c => c.id !== id));
        } catch (error) {
            console.error('Rejection failed', error);
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) return <div className="flex justify-center py-20"><Spinner size="xl" /></div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Validation des cours</h1>
                <p className="text-slate-500 mt-1">Examinez et approuvez les nouveaux contenus proposés par les formateurs.</p>
            </div>

            {courses.length === 0 ? (
                <Card className="border-dashed h-64 flex flex-col items-center justify-center bg-slate-50/50">
                    <CheckCircle className="w-12 h-12 text-slate-200 mb-4" />
                    <p className="text-slate-500 font-medium">Aucun cours en attente de validation.</p>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {courses.map((course) => (
                        <Card key={course.id} className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row">
                                <div className="w-full md:w-48 h-32 bg-slate-100 flex-shrink-0 relative overflow-hidden">
                                    {course.imageUrl ? (
                                        <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <BookOpen size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                                {course.category?.name || 'Général'}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-400">
                                                Soumis par {course.instructor?.firstName} {course.instructor?.lastName}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">{course.title}</h3>
                                        <p className="text-sm text-slate-500 line-clamp-1">{course.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/courses/${course.id}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                                            <Eye size={20} />
                                        </Link>
                                        <Button
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                                            onClick={() => handleApprove(course.id)}
                                            disabled={actionLoading === course.id}
                                        >
                                            {actionLoading === course.id ? <Spinner size="sm" /> : <CheckCircle size={18} className="mr-2" />}
                                            Approuver
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100"
                                            onClick={() => handleReject(course.id)}
                                            disabled={actionLoading === course.id}
                                        >
                                            <XCircle size={18} className="mr-2" />
                                            Rejeter
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
