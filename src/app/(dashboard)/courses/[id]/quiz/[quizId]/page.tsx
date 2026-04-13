'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle, CheckCircle, Award } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Question {
    id: number;
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    optionE: string;
}

export default function QuizTakingPage({ params }: { params: Promise<{ id: string, quizId: string }> }) {
    const router = useRouter();
    const [quizIdStr, setQuizIdStr] = useState<string>('');
    const [courseIdStr, setCourseIdStr] = useState<string>('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                // Unwrap the promise dynamically per Next.js 15
                const resolvedParams = await params;
                const quizId = resolvedParams.quizId;
                const courseId = resolvedParams.id;
                
                setQuizIdStr(quizId);
                setCourseIdStr(courseId);
                
                // Fetch the questions for the current quiz
                const res = await api.get(`/modules/0/quizzes/${quizId}/questions`); 
                setQuestions(res.data || []);
            } catch (e) {
                console.error("Failed to load quiz", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, [params]);

    const handleAnswerChange = (questionId: number, optionLetter: string) => {
        setAnswers({ ...answers, [questionId]: optionLetter });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // L'API backend attend la méthode submitQuiz : POST /api/evaluations/quizzes/{quizId}/submit
            // Corps de la requête : SubmitAttemptRequest qui contient Map<Long, String> answers
            const res = await api.post(`/evaluations/quizzes/${quizIdStr}/submit`, { answers });
            setResult(res.data);
            
            // Si le quiz est réussi, l'étudiant pourrait obtenir le certificat ? (Pour plus tard)
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-20"><Spinner size="xl" /></div>;

    if (result) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 animate-in zoom-in-95 duration-500">
                <Card className={cn(
                    "overflow-hidden border-0 shadow-2xl relative",
                    result.passed ? "ring-2 ring-emerald-500/20" : "ring-2 ring-red-500/20"
                )}>
                    <div className={cn(
                        "h-2",
                        result.passed ? "bg-emerald-500" : "bg-red-500"
                    )} />
                    
                    <CardHeader className={cn(
                        "text-center pb-8 pt-12",
                        result.passed ? "bg-emerald-50/50" : "bg-red-50/50"
                    )}>
                        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner animate-bounce">
                            {result.passed ? (
                                <CheckCircle className="w-12 h-12 text-emerald-600" />
                            ) : (
                                <AlertCircle className="w-12 h-12 text-red-600" />
                            )}
                        </div>
                        <CardTitle className={cn(
                            "text-3xl font-black tracking-tight",
                            result.passed ? "text-emerald-900" : "text-red-900"
                        )}>
                            {result.passed ? "Félicitations !" : "Pas tout à fait..."}
                        </CardTitle>
                        <CardDescription className="text-lg mt-2 font-medium">
                            {result.passed 
                                ? "Vous avez brillamment réussi cette évaluation." 
                                : "Vous n'avez pas encore atteint le score minimum de 70%."}
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-12 text-center space-y-8 bg-white">
                        <div className="relative inline-block">
                            <div className={cn(
                                "text-8xl font-black tabular-nums tracking-tighter",
                                result.passed ? "text-emerald-600" : "text-red-600"
                            )}>
                                {Math.round(result.score)}%
                            </div>
                            <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mt-2">Votre Score Final</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <p className={cn("font-black", result.passed ? "text-emerald-600" : "text-red-600")}>
                                    {result.passed ? "RÉUSSI" : "ÉCHEC"}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Seuil</p>
                                <p className="font-black text-slate-900">70%</p>
                            </div>
                        </div>
                    </CardContent>
                    
                    <CardFooter className="justify-center border-t bg-slate-50/50 p-8 gap-4">
                        <Button 
                            variant="outline" 
                            size="lg" 
                            className="rounded-full px-8 h-14 border-2 font-bold"
                            onClick={() => window.location.reload()}
                        >
                            Réessayer
                        </Button>
                        <Button 
                            size="lg" 
                            className={cn(
                                "rounded-full px-8 h-14 font-bold shadow-lg",
                                result.passed ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" : "bg-slate-900 hover:bg-black shadow-slate-200"
                            )}
                            onClick={() => router.push(`/courses/${courseIdStr}/learn`)}
                        >
                            Continuer le cours
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">Évaluation</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{questions.length} Questions</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">Quiz de validation</h1>
                        <p className="text-slate-500 text-lg max-w-2xl font-medium">Répondez avec précision. Un score de <span className="text-slate-900 font-bold underline decoration-blue-500 decoration-2">70%</span> est indispensable pour valider ce module.</p>
                    </div>
                </div>

                {questions.length === 0 ? (
                    <div className="p-12 bg-white rounded-[2.5rem] text-center border-2 border-dashed border-slate-200 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Ce quiz est en cours de préparation.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {questions.map((q, index) => (
                            <Card key={q.id} className="overflow-hidden border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] transition-all hover:ring-2 hover:ring-blue-500/10">
                                <CardHeader className="p-8 pb-4 border-b border-slate-50 bg-white/50 backdrop-blur-sm">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-100">
                                            {index + 1}
                                        </div>
                                        <div className="h-0.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl font-bold text-slate-900 leading-tight">
                                        {q.text}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-6 space-y-3 bg-white">
                                    {(['A', 'B', 'C', 'D', 'E'] as const).map(opt => {
                                        const text = q[`option${opt}` as keyof Question];
                                        if (!text) return null;
                                        const isSelected = answers[q.id] === opt;
                                        return (
                                            <label 
                                                key={opt} 
                                                className={cn(
                                                    "flex items-center gap-4 p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all duration-200 group relative overflow-hidden",
                                                    isSelected 
                                                        ? "border-blue-600 bg-blue-50/50 shadow-inner" 
                                                        : "border-slate-100 hover:border-blue-200 hover:bg-slate-50/50"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-xl flex items-center justify-center font-bold transition-all",
                                                    isSelected ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-100 text-slate-500 group-hover:bg-blue-100"
                                                )}>
                                                    {opt}
                                                </div>
                                                <input 
                                                    type="radio" 
                                                    name={`question-${q.id}`} 
                                                    className="sr-only"
                                                    checked={isSelected}
                                                    onChange={() => handleAnswerChange(q.id, opt)}
                                                />
                                                <span className={cn(
                                                    "text-lg font-medium transition-colors",
                                                    isSelected ? "text-blue-900" : "text-slate-600"
                                                )}>{text as string}</span>
                                                
                                                {isSelected && (
                                                    <div className="absolute right-6 animate-in fade-in zoom-in-50">
                                                        <CheckCircle className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                )}
                                            </label>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        ))}

                        <div className="flex flex-col items-center gap-4 pt-10 pb-20">
                            <div className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">
                                {Object.keys(answers).length} sur {questions.length} répondues
                            </div>
                            <Button 
                                size="lg" 
                                onClick={handleSubmit} 
                                disabled={isSubmitting || Object.keys(answers).length < questions.length}
                                className={cn(
                                    "rounded-full px-12 h-16 text-xl font-black shadow-2xl transition-all",
                                    Object.keys(answers).length < questions.length 
                                        ? "bg-slate-200 text-slate-400" 
                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 scale-105 active:scale-95"
                                )}
                            >
                                {isSubmitting ? <Spinner className="mr-2" size="sm" /> : null}
                                Valider mes réponses
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
