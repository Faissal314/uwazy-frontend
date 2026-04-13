'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Attempt } from '@/types';
import api from '@/services/api';
import { CheckCircle2, XCircle, Clock, Award, FileCheck } from 'lucide-react';

export default function EvaluationsPage() {
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const response = await api.get('/evaluations/my-attempts');
                setAttempts(response.data);
            } catch (error) {
                console.error('Failed to fetch attempts', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttempts();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mes Évaluations</h1>
                    <p className="text-slate-500 mt-1">Consultez vos résultats et repassez des quizz si nécessaire.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Spinner size="lg" />
                </div>
            ) : attempts.length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-lg border-slate-200 bg-white">
                    <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">Aucune évaluation passée</h3>
                    <p className="text-slate-500 mt-1">Vous n'avez pas encore passé de quizz de validation.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {attempts.map((attempt) => (
                        <Card key={attempt.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-md flex items-center ${attempt.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {attempt.passed ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Réussi</> : <><XCircle className="w-3 h-3 mr-1" /> Échoué</>}
                                    </span>
                                    <span className="text-xs text-slate-500 flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {new Date(attempt.attemptedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <CardTitle className="text-lg mt-2">
                                    {attempt.quiz?.title || 'Quizz sans titre'}
                                </CardTitle>
                                <CardDescription>
                                    {attempt.quiz?.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end">
                                <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between border border-slate-100">
                                    <span className="text-sm font-medium text-slate-600">Score obtenu</span>
                                    <span className={`text-2xl font-bold ${attempt.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {attempt.score}%
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                {!attempt.passed ? (
                                    <Button variant="outline" className="w-full">
                                        Générer une nouvelle tentative
                                    </Button>
                                ) : (
                                    <Button variant="ghost" className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                        <Award className="w-4 h-4 mr-2" /> Voir les détails
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
