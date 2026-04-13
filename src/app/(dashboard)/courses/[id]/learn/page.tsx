'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Course, Module, Lesson } from '@/types';
import api from '@/services/api';
import { ArrowLeft, CheckCircle2, Circle, PlayCircle, FileText, BookOpen, MessageSquare, Send, Award } from 'lucide-react';
import { getImageUrl, getFileUrl, getCertificateUrl } from '@/utils/url';
import { cn } from '@/utils/cn';
import { useAuth } from '@/context/AuthContext';

export default function CourseLearningPage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = useAuth();
    const router = useRouter();
    const routeParams = use(params);

    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [completedLessons, setCompletedLessons] = useState<number[]>([]);
    const [passedQuizzes, setPassedQuizzes] = useState<number[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'content' | 'questions'>('content');
    const [newQuestion, setNewQuestion] = useState('');
    const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
    const [answerTexts, setAnswerTexts] = useState<Record<number, string>>({});

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const response = await api.get(`/courses/${routeParams.id}`);
                setCourse(response.data);

                // Auto-select first lesson if available
                if (response.data.modules && response.data.modules.length > 0) {
                    const firstModule = response.data.modules.sort((a: Module, b: Module) => a.orderIndex - b.orderIndex)[0];
                    if (firstModule.lessons && firstModule.lessons.length > 0) {
                        const firstLesson = firstModule.lessons.sort((a: Lesson, b: Lesson) => a.orderIndex - b.orderIndex)[0];
                        setActiveLesson(firstLesson);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch course data', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourseData();
    }, [routeParams.id]);

    useEffect(() => {
        const fetchCompletedLessons = async () => {
            if (!routeParams.id) return;
            try {
                const response = await api.get(`/enrollments/courses/${routeParams.id}/completed-lessons`);
                setCompletedLessons(response.data || []);
            } catch (error) {
                console.error('Failed to fetch completed lessons', error);
            }
        };

        const fetchPassedQuizzes = async () => {
            if (!routeParams.id) return;
            try {
                const response = await api.get('/evaluations/my-attempts');
                const attempts = response.data || [];
                // Filter for passed attempts in this course
                const courseQuizzes = attempts.filter((a: any) => 
                    a.passed && course?.modules?.some(m => m.quizzes?.some(q => q.id === a.quizId))
                );
                const quizIds = Array.from(new Set<number>(courseQuizzes.map((a: any) => a.quizId)));
                setPassedQuizzes(quizIds);
            } catch (error) {
                console.error('Failed to fetch passed quizzes', error);
            }
        };

        fetchCompletedLessons();
        fetchPassedQuizzes();
    }, [routeParams.id, course]);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (!routeParams.id) return;
            try {
                const response = await api.get(`/courses/${routeParams.id}/questions`);
                setQuestions(response.data || []);
            } catch (error) {
                console.error('Failed to fetch questions', error);
            }
        };
        fetchQuestions();
    }, [routeParams.id]);

    const handleQuestionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;
        setIsSubmittingQuestion(true);
        try {
            const res = await api.post(`/courses/${routeParams.id}/questions`, { content: newQuestion });
            setQuestions([res.data, ...questions]);
            setNewQuestion('');
        } catch (error) {
            console.error('Question submission failed', error);
        } finally {
            setIsSubmittingQuestion(false);
        }
    };

    const handleAnswerSubmit = async (questionId: number) => {
        const content = answerTexts[questionId];
        if (!content || !content.trim()) return;
        try {
            const res = await api.post(`/courses/${routeParams.id}/questions/${questionId}/answers`, { content });
            setQuestions(questions.map(q => q.id === questionId ? { ...q, answers: [...(q.answers || []), res.data] } : q));
            setAnswerTexts({ ...answerTexts, [questionId]: '' });
        } catch (error) {
            console.error('Answer submission failed', error);
        }
    };

    const totalLessons = course?.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
    const totalQuizzes = course?.modules?.reduce((acc, m) => acc + (m.quizzes?.length || 0), 0) || 0;
    const totalItems = totalLessons + totalQuizzes || 1;
    const completedItems = completedLessons.length + passedQuizzes.length;
    const progress = Math.round((completedItems / totalItems) * 100);

    const goToNextLesson = () => {
        if (!course || !activeLesson) return;

        // Flatten all curriculum items (lessons and quizzes) in order
        const curriculum: (Lesson | { id: number; title: string; type: 'quiz' })[] = [];
        course.modules?.sort((a, b) => a.orderIndex - b.orderIndex).forEach(module => {
            const lessons = module.lessons?.sort((a, b) => a.orderIndex - b.orderIndex) || [];
            curriculum.push(...lessons);
            const quizzes = module.quizzes?.map(q => ({ ...q, type: 'quiz' as const })) || [];
            curriculum.push(...quizzes);
        });

        const currentIndex = curriculum.findIndex(item => 'type' in item ? false : item.id === activeLesson.id);
        
        if (currentIndex !== -1 && currentIndex < curriculum.length - 1) {
            const nextItem = curriculum[currentIndex + 1];
            if ('type' in nextItem) {
                // It's a quiz, redirect to quiz page
                router.push(`/courses/${course.id}/quiz/${nextItem.id}`);
            } else {
                // It's a lesson, update active lesson
                setActiveLesson(nextItem as Lesson);
                setActiveTab('content');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            // End of course
            if (progress === 100) {
                alert("Félicitations ! Vous avez terminé toutes les leçons de ce cours.");
            }
        }
    };

    const toggleLessonCompletion = async (lessonId: number) => {
        if (!lessonId) return;
        const isCurrentlyCompleted = completedLessons.includes(lessonId);
        
        try {
            if (!isCurrentlyCompleted) {
                await api.post(`/enrollments/lessons/${lessonId}/complete`);
                setCompletedLessons([...completedLessons, lessonId]);
                
                // Automatically go to next lesson after a short delay
                setTimeout(() => {
                    goToNextLesson();
                }, 1000);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message;
            const errorType = error.response?.data?.type || 'Unknown';
            console.error(`Failed to update lesson completion: [${errorType}] ${errorMessage}`, error);
            // Optional: alert or toast here for user
        }
    };

    const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
    const [hasCertificate, setHasCertificate] = useState(false);

    useEffect(() => {
        const checkCertificate = async () => {
            if (!routeParams.id || user?.role !== 'ETUDIANT') return;
            try {
                const response = await api.get('/certificates/my-certificates');
                const certs = response.data || [];
                setHasCertificate(certs.some((c: any) => c.courseId === Number(routeParams.id)));
            } catch (error) {
                console.error('Failed to check certificate', error);
            }
        };
        checkCertificate();
    }, [routeParams.id, user?.role]);

    const handleGenerateCertificate = async () => {
        setIsGeneratingCertificate(true);
        try {
            await api.post(`/certificates/generate/courses/${routeParams.id}`);
            setHasCertificate(true);
            router.push('/certificates');
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Erreur lors de la génération du certificat.';
            alert(msg);
        } finally {
            setIsGeneratingCertificate(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-[70vh] items-center justify-center">
                <Spinner size="xl" className="mb-4" />
                <p className="text-slate-500 animate-pulse">Chargement de votre espace d'apprentissage...</p>
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
        <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] bg-slate-50/50 rounded-3xl overflow-hidden border border-slate-200/60 shadow-xl shadow-slate-200/20 animate-in fade-in zoom-in-95 duration-700">
            {/* Sidebar Navigation - Moved to Left */}
            <div className="w-full lg:w-80 flex flex-col bg-white border-r border-slate-200/60 shrink-0 z-10">
                <div className="p-6 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
                    <h3 className="font-bold text-slate-900 text-lg tracking-tight">Programme du cours</h3>
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-1000 ease-out" 
                            style={{ width: `${progress}%` }} 
                        />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{progress}% Terminés</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{completedItems}/{totalItems} ÉTAPES</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {course.modules?.sort((a, b) => a.orderIndex - b.orderIndex).map((module, mIdx) => (
                        <div key={module.id} className="space-y-3">
                            <div className="px-2">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                                    Module {mIdx + 1}
                                </h4>
                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{module.title}</p>
                            </div>

                            <div className="space-y-1">
                                {module.lessons?.sort((a, b) => a.orderIndex - b.orderIndex).map((lesson, lIdx) => {
                                    const isActive = activeLesson?.id === lesson.id;
                                    const isCompleted = completedLessons.includes(lesson.id);
                                    return (
                                        <button
                                            key={lesson.id}
                                            onClick={() => {
                                                setActiveLesson(lesson);
                                                setActiveTab('content');
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 text-left group",
                                                isActive 
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 font-semibold" 
                                                    : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                                            )}
                                        >
                                            <div className={cn(
                                                "shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors border",
                                                isActive ? "bg-white/20 border-white/30" : isCompleted ? "bg-emerald-100 border-emerald-200 text-emerald-600" : "bg-slate-100 border-slate-200"
                                            )}>
                                                {isCompleted ? (
                                                    <CheckCircle2 className="w-3 h-3" />
                                                ) : (
                                                    <span className={cn("text-[9px]", isActive ? "text-white" : "text-slate-400")}>{lIdx + 1}</span>
                                                )}
                                            </div>

                                            <span className="truncate flex-1">{lesson.title}</span>

                                            <div className="shrink-0 group-hover:scale-110 transition-transform">
                                                {lesson.videoUrl ? (
                                                    <PlayCircle className={cn("w-4 h-4 opacity-60", isActive ? "text-white" : "text-blue-500")} />
                                                ) : (
                                                    <FileText className={cn("w-4 h-4 opacity-60", isActive ? "text-white" : "text-slate-400")} />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}

                                {module.quizzes?.map((quiz) => (
                                    <Link 
                                        href={`/courses/${course.id}/quiz/${quiz.id}`} 
                                        key={quiz.id}
                                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 text-left hover:bg-amber-50 text-amber-700 font-bold border border-amber-100 bg-amber-50/30 group"
                                    >
                                        <div className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-200 group-hover:bg-amber-200">
                                            <Award className="w-3 h-3" />
                                        </div>
                                        <span className="truncate flex-1">{quiz.title}</span>
                                        <div className="text-[8px] bg-amber-200/50 text-amber-800 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Quiz</div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0 bg-white">
                <div className="p-4 px-8 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-6">
                        <Link href={`/courses/${course.id}`} className="group flex items-center text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Retour
                        </Link>
                        
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                            <button 
                                onClick={() => setActiveTab('content')}
                                className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", activeTab === 'content' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                            >
                                Contenu
                            </button>
                            <button 
                                onClick={() => setActiveTab('questions')}
                                className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", activeTab === 'questions' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                            >
                                Questions
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {progress === 100 && !hasCertificate && (
                            <Button 
                                size="sm" 
                                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-lg shadow-amber-200 border-0 font-bold px-6 rounded-full"
                                onClick={handleGenerateCertificate}
                                disabled={isGeneratingCertificate}
                            >
                                <Award className="w-4 h-4 mr-2 animate-pulse" /> 
                                {isGeneratingCertificate ? "Génération..." : "Obtenir mon diplôme"}
                            </Button>
                        )}
                        {hasCertificate && (
                            <Link href="/certificates" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full font-bold px-4")}>
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Certificat acquis
                            </Link>
                        )}
                        {activeLesson && activeTab === 'content' && (
                            <Button
                                size="sm"
                                variant={completedLessons.includes(activeLesson.id) ? "outline" : "default"}
                                onClick={() => toggleLessonCompletion(activeLesson.id)}
                                className={cn("rounded-full font-bold px-6", !completedLessons.includes(activeLesson.id) && "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100")}
                            >
                                {completedLessons.includes(activeLesson.id) ? (
                                    <><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Complété</>
                                ) : (
                                    "Terminer la leçon"
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                    {activeTab === 'content' ? (
                        activeLesson ? (
                            <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">Cours Actif</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Leçon {activeLesson.orderIndex}</span>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">{activeLesson.title}</h1>
                                </div>

                                {activeLesson.videoUrl && (
                                    <div className="aspect-video bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-300 ring-1 ring-slate-100 relative group">
                                        <video 
                                            src={getFileUrl(activeLesson.videoUrl)} 
                                            controls 
                                            preload="metadata"
                                            className="w-full h-full object-cover"
                                        >
                                            Votre navigateur ne supporte pas la lecture de vidéos.
                                        </video>
                                    </div>
                                )}

                                {activeLesson.documentUrl?.toLowerCase().endsWith('.pdf') ? (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="w-full h-[80vh] min-h-[600px] rounded-[2.5rem] overflow-hidden border-8 border-slate-100 shadow-2xl bg-slate-200/50 relative">
                                            <iframe 
                                                src={`${getFileUrl(activeLesson.documentUrl)}#toolbar=1`} 
                                                className="w-full h-full border-none"
                                                title={activeLesson.title}
                                            />
                                        </div>
                                        <div className="flex justify-center gap-4">
                                            <a 
                                                href={getFileUrl(activeLesson.documentUrl)} 
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cn(buttonVariants({ variant: 'outline' }), "rounded-full px-8 font-bold border-2")}
                                            >
                                                <FileText className="w-4 h-4 mr-2" /> Télécharger pour réviser plus tard
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="prose prose-slate prose-lg max-w-none bg-slate-50/50 p-8 md:p-12 rounded-[2.5rem] border border-slate-100">
                                        <div
                                            className="text-slate-700 leading-relaxed text-xl whitespace-pre-line font-medium"
                                            dangerouslySetInnerHTML={{ __html: activeLesson.content || '<p class="text-slate-400 italic font-normal">Cette leçon est principalement axée sur la vidéo ci-dessus.</p>' }}
                                        />
                                        
                                        {activeLesson.documentUrl && (
                                            <div className="mt-12 p-6 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm group hover:border-blue-300 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">Support de cours</p>
                                                        <p className="text-xs text-slate-500">Document d'accompagnement</p>
                                                    </div>
                                                </div>
                                                <a 
                                                    href={getFileUrl(activeLesson.documentUrl)} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "rounded-full")}
                                                >
                                                    Télécharger
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Prochaine étape footer */}
                                <div className="pt-10 pb-20 border-t border-slate-100 flex flex-col items-center">
                                    <p className="text-slate-400 text-sm font-medium mb-4">Prêt pour la suite ?</p>
                                    <Button 
                                        variant="outline" 
                                        size="lg" 
                                        className="rounded-full px-8 h-14 border-2 hover:bg-slate-50"
                                        onClick={goToNextLesson}
                                    >
                                        Étape Suivante <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-slate-300">
                                <BookOpen className="w-24 h-24 mb-6 opacity-20" />
                                <h2 className="text-2xl font-black text-slate-400">Bienvenue dans votre formation</h2>
                                <p className="max-w-xs mx-auto mt-2 text-slate-400">Sélectionnez la première leçon dans le menu à gauche pour commencer votre voyage.</p>
                            </div>
                        )
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black text-slate-900 leading-[1.1]">Espace d'entraide</h2>
                                <p className="text-slate-500 text-lg">Posez vos questions sur {activeLesson?.title || "le cours"}.</p>
                            </div>
                            
                            <form onSubmit={handleQuestionSubmit} className="relative group">
                                <input 
                                    type="text" 
                                    placeholder="Posez une question ici..." 
                                    className="w-full h-16 pl-6 pr-20 bg-slate-100 rounded-2xl border-transparent focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none text-lg"
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                />
                                <Button 
                                    type="submit" 
                                    disabled={isSubmittingQuestion}
                                    className="absolute right-2 top-2 h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 p-0 shadow-lg shadow-blue-200"
                                >
                                    {isSubmittingQuestion ? <Spinner className="w-4 h-4" /> : <Send className="w-5 h-5 text-white" />}
                                </Button>
                            </form>

                            <div className="space-y-6">
                                {questions.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200/50">
                                        <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Aucune question pour le moment</p>
                                    </div>
                                ) : (
                                    questions.map(q => (
                                        <div key={q.id} className="group p-8 rounded-[2rem] border border-slate-200/60 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-slate-100 transition-all animate-in fade-in">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-600 border border-white shadow-sm capitalize">
                                                        {q.userName?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">{q.userName}</h4>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(q.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <p className="text-slate-700 text-lg leading-relaxed pl-1">{q.content}</p>

                                            <div className="mt-8 ml-6 space-y-4 border-l-4 border-slate-100 pl-6 py-2">
                                                {q.answers?.map((a: any) => (
                                                    <div key={a.id} className="relative group/answer animate-in slide-in-from-left-2 transition-all">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-slate-800 text-sm">{a.userName}</span>
                                                            <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest", a.role === 'FORMATEUR' ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500")}>
                                                                {a.role}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-600 text-base">{a.content}</p>
                                                    </div>
                                                ))}
                                                
                                                <div className="mt-6 flex gap-3">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Votre réponse..." 
                                                        className="flex-1 h-12 bg-slate-50 rounded-xl px-4 text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                                        value={answerTexts[q.id] || ''}
                                                        onChange={(e) => setAnswerTexts({ ...answerTexts, [q.id]: e.target.value })}
                                                    />
                                                    <Button 
                                                        onClick={() => handleAnswerSubmit(q.id)}
                                                        className="h-12 w-12 rounded-xl bg-slate-900 hover:bg-black p-0 shadow-lg shadow-slate-200"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
