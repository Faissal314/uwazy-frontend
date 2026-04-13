'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { BookOpen, Award, CheckCircle2, Clock, Users, PlusCircle, BarChart3, ShieldAlert, GraduationCap, Library } from 'lucide-react';

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = React.useState<any>(null);
    const [courseStats, setCourseStats] = React.useState<any[]>([]);
    const [isStatsLoading, setIsStatsLoading] = React.useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            setIsStatsLoading(true);
            try {
                const { default: api } = await import('@/services/api');

                if (user.role === 'ADMINISTRATEUR') {
                    const resGlobal = await api.get('/stats/global');
                    setStats(resGlobal.data);
                }

                if (user.role === 'ADMINISTRATEUR' || user.role === 'FORMATEUR') {
                    const resCourses = await api.get('/stats/courses');
                    setCourseStats(resCourses.data);
                }

                if (user.role === 'ETUDIANT') {
                    const resStudent = await api.get('/stats/student');
                    setStats(resStudent.data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            } finally {
                setIsStatsLoading(false);
            }
        };
        fetchDashboardData();
    }, [user]);

    if (!user) return null;

    const renderStudentDashboard = () => (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bonjour, {user.firstName}</h1>
                    <p className="text-slate-500 mt-1">Prêt pour votre prochaine leçon ? Voici votre progression.</p>
                </div>
                <Link href="/courses" className={buttonVariants()}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explorer le catalogue
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-blue-300 overflow-hidden transition-all duration-300 group">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500 font-semibold uppercase tracking-wider">Formations En Cours</CardTitle>
                        <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                            <Clock className="w-4 h-4 text-blue-700" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-4xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{stats?.activeCoursesCount || 0}</div>
                        <p className="text-xs text-slate-500">En apprentissage actif</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-emerald-300 overflow-hidden transition-all duration-300 group">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500 font-semibold uppercase tracking-wider">Leçons Complétées</CardTitle>
                        <div className="p-2 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-4xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{stats?.completedLessonsCount || 0}</div>
                        <p className="text-xs text-slate-500">Continuer votre progression</p>
                    </CardContent>
                </Card>

                <Link href="/certificates" className="block">
                    <Card className="border-0 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-amber-300 overflow-hidden transition-all duration-300 group cursor-pointer h-full">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-500 font-semibold uppercase tracking-wider">Certificats</CardTitle>
                            <div className="p-2 rounded-lg bg-amber-100 group-hover:bg-amber-200 transition-colors">
                                <Award className="w-4 h-4 text-amber-700" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="text-4xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{stats?.certificatesCount || 0}</div>
                            <p className="text-xs text-slate-500">Succès obtenus</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                    <CardHeader>
                        <CardTitle>Reprendre l'apprentissage</CardTitle>
                        <CardDescription>Vos formations en cours</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isStatsLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <Spinner size="sm" />
                            </div>
                        ) : stats && stats.activeCourses && stats.activeCourses.length > 0 ? (
                            <div className="space-y-3">
                                {stats.activeCourses.slice(0, 3).map((course: any) => (
                                    <Link key={course.courseId} href={`/courses/${course.courseId}/learn`} className="block">
                                        <div className="p-3 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{course.courseTitle}</p>
                                                <span className="text-xs text-slate-500">{Math.round(course.progressPercentage || 0)}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 transition-all" style={{ width: `${course.progressPercentage || 0}%` }}></div>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2">{course.instructorName}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 flex flex-col items-center justify-center p-12 border border-dashed rounded-xl border-slate-200 bg-slate-50/50">
                                <BookOpen className="w-10 h-10 text-slate-300 mb-3" />
                                <p className="font-medium text-slate-600">Aucun cours actif pour le moment.</p>
                                <Link href="/courses" className={buttonVariants({ variant: "link", className: "mt-2 text-blue-600" })}>
                                    Parcourir les formations
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                    <CardHeader>
                        <CardTitle>Dernières Évaluations</CardTitle>
                        <CardDescription>Vos résultats aux quizz</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isStatsLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <Spinner size="sm" />
                            </div>
                        ) : stats && stats.recentEvaluations && stats.recentEvaluations.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recentEvaluations.map((evaluation: any, index: number) => (
                                    <div key={evaluation.id || `${evaluation.quizId}-${index}`} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-medium text-slate-900 text-sm">{evaluation.quizTitle}</p>
                                            <span className={`text-sm font-bold ${evaluation.score >= 60 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {Math.round(evaluation.score || 0)}%
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500">{evaluation.courseTitle}</p>
                                        <p className="text-xs text-slate-400 mt-1">{evaluation.attemptDate}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 flex flex-col items-center justify-center p-12 border border-dashed rounded-xl border-slate-200 bg-slate-50/50">
                                <CheckCircle2 className="w-10 h-10 text-slate-300 mb-3" />
                                <p className="font-medium text-slate-600">En attente de vos premiers résultats.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>{/* ✅ FIX 1: supprimé </CardContent></Card> parasites ici */}
        </>
    );

    const renderTrainerDashboard = () => (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Espace Formateur: {user.firstName}</h1>
                    <p className="text-slate-500 mt-1">Gérez vos contenus pédagogiques et suivez vos étudiants.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/my-courses" className={buttonVariants({ variant: "outline" })}>
                        Mes Cours
                    </Link>
                    <Link href="/courses/new" className={buttonVariants()}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Créer un cours
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-purple-300 overflow-hidden transition-all duration-300 group">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500 font-semibold uppercase tracking-wider">Mes Cours</CardTitle>
                        <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                            <Library className="w-4 h-4 text-purple-700" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-4xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{courseStats.length}</div>
                        <p className="text-xs text-slate-500">Formations créées</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-blue-300 overflow-hidden transition-all duration-300 group">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500 font-semibold uppercase tracking-wider">Total Étudiants</CardTitle>
                        <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                            <Users className="w-4 h-4 text-blue-700" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-4xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {courseStats.reduce((acc, c) => acc + c.studentCount, 0)}
                        </div>
                        <p className="text-xs text-slate-500">Apprenants inscrits</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-emerald-300 overflow-hidden transition-all duration-300 group">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500 font-semibold uppercase tracking-wider">Taux de Réussite</CardTitle>
                        <div className="p-2 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                            <BarChart3 className="w-4 h-4 text-emerald-700" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-4xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {Math.round(courseStats.reduce((acc, c) => acc + c.successRate, 0) / (courseStats.length || 1))}%
                        </div>
                        <p className="text-xs text-slate-500">Réussite moyenne</p>
                    </CardContent>
                </Card>
            </div>{/* ✅ FIX 2: supprimé </Card></div> parasites ici */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                    <CardHeader>
                        <CardTitle>Activités Récentes</CardTitle>
                        <CardDescription>Inscriptions et questions d'étudiants</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-slate-500 flex flex-col items-center justify-center p-12 border border-dashed rounded-xl border-slate-200 bg-slate-50/50">
                            <Users className="w-10 h-10 text-slate-300 mb-3" />
                            <p className="font-medium text-slate-600">Les activités s'afficheront ici</p>
                            <p className="text-xs text-slate-500 mt-1">quand vos étudiants rejoindront vos cours.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                    <CardHeader>
                        <CardTitle>À Finaliser</CardTitle>
                        <CardDescription>Tâches en attente sur vos cours</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {courseStats && courseStats.length > 0 ? (
                            <div className="space-y-3">
                                {courseStats.map((course: any) => {
                                    const hasQuiz = course.studentCount > 0;
                                    return !hasQuiz ? (
                                        <div key={course.courseId} className="flex items-start gap-3 p-3 rounded-lg border border-amber-100 bg-amber-50/50">
                                            <ShieldAlert size={18} className="text-amber-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-amber-900">Quiz manquant</p>
                                                <p className="text-xs text-amber-700">Le cours "{course.title}" n'a pas encore de quiz de validation.</p>
                                            </div>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 flex flex-col items-center justify-center p-8 border border-dashed rounded-xl border-slate-200">
                                <CheckCircle2 className="w-8 h-8 text-emerald-300 mb-2" />
                                <p className="font-medium text-slate-600">Tout est à jour !</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );

    const renderAdminDashboard = () => (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Supervision plateforme: {user.firstName}</h1>
                    <p className="text-slate-500 mt-1">Vue d'ensemble et administration du système UwazyOnline.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/users" className={buttonVariants()}>
                        <Users className="w-4 h-4 mr-2" />
                        Gérer les utilisateurs
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-0 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-slate-300 overflow-hidden transition-all duration-300 group">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-semibold uppercase text-slate-500">Utilisateurs</CardTitle>
                        <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                            <Users size={16} className="text-blue-700" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{stats?.totalUsers || 0}</div>
                        <p className="text-xs text-slate-500">Inscrits au total</p>
                    </CardContent>
                </Card>

                <Link href="/admin/validations" className="block">
                    <Card className="border-0 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-purple-300 overflow-hidden transition-all duration-300 group cursor-pointer">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-semibold uppercase text-slate-500">Cours</CardTitle>
                            <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                                <Library size={16} className="text-purple-700" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="text-3xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{stats?.totalCourses || 0}</div>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="border-0 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-blue-300 overflow-hidden transition-all duration-300 group">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-semibold uppercase text-slate-500">Inscriptions</CardTitle>
                        <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                            <GraduationCap size={16} className="text-blue-700" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{stats?.totalEnrollments || 0}</div>
                        <p className="text-xs text-slate-500">Apprenants actifs</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-amber-300 overflow-hidden transition-all duration-300 group">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-semibold uppercase text-slate-500">Certificats</CardTitle>
                        <div className="p-2 rounded-lg bg-amber-100 group-hover:bg-amber-200 transition-colors">
                            <Award size={16} className="text-amber-700" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-3xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{stats?.totalCertificates || 0}</div>
                        <p className="text-xs text-slate-500">Certificats générés</p>
                    </CardContent>
                </Card>
            </div>{/* ✅ FIX 3: supprimé </div> parasite ici */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-0 shadow-sm ring-1 ring-slate-200">
                    <CardHeader>
                        <CardTitle>Inscriptions Récentes</CardTitle>
                        <CardDescription>Flux global des nouveaux apprenants</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-end justify-between gap-2 pt-4">
                            {[40, 60, 45, 90, 65, 80, 55, 70, 85, 40].map((h, i) => (
                                <div key={i} className="flex-1 bg-blue-100 rounded-t-sm hover:bg-blue-600 transition-colors group relative" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        Jour {i + 1}: {Math.floor(h * 1.5)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                            <span>Il y a 10 jours</span>
                            <span>Aujourd'hui</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                    <CardHeader>
                        <CardTitle>Alertes Système</CardTitle>
                        <CardDescription>Modération requise</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-3 text-sm">
                                <div className="p-2 h-max rounded-full bg-red-50 text-red-600">
                                    <ShieldAlert size={14} />
                                </div>
                                <p className="text-slate-600 leading-tight">
                                    <span className="font-bold text-slate-900 block">3 Nouveaux Formateurs</span>
                                    En attente de validation de profil.
                                </p>
                            </div>
                            <div className="flex gap-3 text-sm">
                                <div className="p-2 h-max rounded-full bg-amber-50 text-amber-600">
                                    <ShieldAlert size={14} />
                                </div>
                                <p className="text-slate-600 leading-tight">
                                    <span className="font-bold text-slate-900 block">MAJ Course Template</span>
                                    Un nouveau template est disponible.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {user.role === 'ADMINISTRATEUR' ? renderAdminDashboard() :
                user.role === 'FORMATEUR' ? renderTrainerDashboard() :
                    renderStudentDashboard()}
        </div>
    );
}