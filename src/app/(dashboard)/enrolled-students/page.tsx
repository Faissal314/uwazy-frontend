'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import api from '@/services/api';
import { Users, Search, GraduationCap, Mail, Calendar, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface StudentEnrollment {
    id: number;
    studentName: string;
    studentEmail: string;
    courseId: number;
    courseTitle: string;
    progressPercentage: number;
    enrolledAt: string;
    completedAt: string | null;
}

interface CourseGroup {
    title: string;
    students: StudentEnrollment[];
}

export default function EnrolledStudentsPage() {
    const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const response = await api.get('/enrollments/instructor/all');
                setEnrollments(response.data);
            } catch (error) {
                console.error('Failed to fetch enrollments', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEnrollments();
    }, []);

    const filteredEnrollments = enrollments.filter(enrollment =>
        enrollment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.studentEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group enrollments by course
    const enrollmentsByCourse = filteredEnrollments.reduce((acc, enrollment) => {
        const courseId = enrollment.courseId;
        if (!acc[courseId]) {
            acc[courseId] = {
                title: enrollment.courseTitle,
                students: []
            };
        }
        acc[courseId].students.push(enrollment);
        return acc;
    }, {} as Record<number, CourseGroup>);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mes Étudiants</h1>
                    <p className="text-slate-500 mt-1">Suivez la progression des étudiants inscrits à vos formations.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Réchercher étudiant, cours, email..."
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
            ) : Object.keys(enrollmentsByCourse).length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-lg border-slate-200 bg-white">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">Aucun étudiant inscrit</h3>
                    <p className="text-slate-500 mt-1">Les inscriptions apparaîtront ici dès que des étudiants rejoindront vos cours.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(enrollmentsByCourse).map(([courseId, courseData]) => (
                        <Card key={courseId} className="border-0 shadow-sm ring-1 ring-slate-200 overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                                        <GraduationCap size={20} />
                                    </div>
                                    <div>
                                        <CardTitle>{courseData.title}</CardTitle>
                                        <CardDescription>{courseData.students.length} étudiant(s) inscrit(s)</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50/30 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left font-semibold text-slate-700">Étudiant</th>
                                                <th className="px-6 py-3 text-left font-semibold text-slate-700">Progression</th>
                                                <th className="px-6 py-3 text-left font-semibold text-slate-700">Inscrit le</th>
                                                <th className="px-6 py-3 text-left font-semibold text-slate-700">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {courseData.students.map((enrollment) => (
                                                <tr key={enrollment.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-900">{enrollment.studentName}</span>
                                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                <Mail size={10} /> {enrollment.studentEmail}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                                                                <div 
                                                                    className={`h-full transition-all ${enrollment.progressPercentage >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                                                    style={{ width: `${enrollment.progressPercentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs font-medium text-slate-600">{Math.round(enrollment.progressPercentage)}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                                                            <Calendar size={14} className="text-slate-400" />
                                                            {new Date(enrollment.enrolledAt).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {enrollment.completedAt ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                                                                <CheckCircle2 size={10} /> Terminé
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                                                                En cours
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
