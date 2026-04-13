'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Spinner } from '@/components/ui/Spinner';
import { Trash2, Plus, CheckCircle2, Circle, Save, ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/services/api';

interface Question {
    id?: number;
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    optionE: string;
    correctAnswer: string;
}

interface QuizEditorProps {
    quizId: number;
    quizTitle: string;
    onClose: () => void;
}

export function QuizEditor({ quizId, quizTitle, onClose }: QuizEditorProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

    useEffect(() => {
        fetchQuestions();
    }, [quizId]);

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            // Consistent with the save endpoint
            const response = await api.get(`/evaluations/quizzes/${quizId}/questions`);
            setQuestions(response.data || []);
            if (response.data && response.data.length > 0) setExpandedQuestion(0);
        } catch (error) {
            console.error('Failed to fetch questions', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddQuestion = () => {
        const newQuestion: Question = {
            text: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            optionE: '',
            correctAnswer: 'A'
        };
        setQuestions([...questions, newQuestion]);
        setExpandedQuestion(questions.length);
    };

    const handleRemoveQuestion = async (index: number, questionId?: number) => {
        if (questionId) {
            if (!confirm('Supprimer cette question définitivement ?')) return;
            try {
                // Endpoint DELETE /evaluations/questions/{id}
                await api.delete(`/evaluations/questions/${questionId}`);
            } catch (error) {
                console.error('Failed to delete question', error);
                return;
            }
        }
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
        setExpandedQuestion(null);
    };

    const handleQuestionChange = (index: number, field: keyof Question, value: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
        setQuestions(updatedQuestions);
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            for (const q of questions) {
                if (!q.text || !q.optionA || !q.optionB || !q.correctAnswer) continue;
                
                // Construct clean request body without undefined/null fields that might upset the backend
                const requestBody = {
                    text: q.text,
                    optionA: q.optionA,
                    optionB: q.optionB,
                    optionC: q.optionC || null,
                    optionD: q.optionD || null,
                    optionE: q.optionE || null,
                    correctAnswer: q.correctAnswer
                };

                if (q.id) {
                    await api.put(`/evaluations/questions/${q.id}`, requestBody);
                } else {
                    await api.post(`/evaluations/quizzes/${quizId}/questions`, requestBody);
                }
            }
            fetchQuestions();
            alert('Questions sauvegardées !');
        } catch (error) {
            console.error('Failed to save questions', error);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-10 text-center"><Spinner /></div>;

    return (
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Éditeur de Quiz : {quizTitle}</h3>
                    <p className="text-sm text-slate-500">Gérez les questions et les bonnes réponses</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                    <Button onClick={handleSaveAll} disabled={isSaving}>
                        {isSaving ? <Spinner className="mr-2" size="sm" /> : <Save className="mr-2" size={18} />}
                        Sauvegarder tout
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {questions.map((q, index) => (
                    <Card key={index} className={`border-slate-200 overflow-hidden ${expandedQuestion === index ? 'ring-2 ring-blue-500' : ''}`}>
                        <div 
                            className="bg-slate-50 p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100"
                            onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold border border-slate-200 text-slate-500">
                                    {index + 1}
                                </span>
                                <span className="font-medium text-slate-700 truncate max-w-md">
                                    {q.text || <i className="text-slate-400">Nouvelle question...</i>}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-500" 
                                    onClick={(e) => { e.stopPropagation(); handleRemoveQuestion(index, q.id); }}
                                >
                                    <Trash2 size={16} />
                                </Button>
                                {expandedQuestion === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                        </div>

                        {expandedQuestion === index && (
                            <CardContent className="p-4 space-y-4 bg-white border-t border-slate-100">
                                <div className="space-y-2">
                                    <Label>Texte de la question</Label>
                                    <Input 
                                        value={q.text} 
                                        onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                                        placeholder="Ex: Quelle est la capitale de la France ?"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(['A', 'B', 'C', 'D', 'E'] as const).map((letter) => (
                                        <div key={letter} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="flex items-center gap-2">
                                                    Option {letter}
                                                </Label>
                                                <button 
                                                    onClick={() => handleQuestionChange(index, 'correctAnswer', letter)}
                                                    className={`p-1 rounded-full transition-colors ${q.correctAnswer === letter ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                                                >
                                                    {q.correctAnswer === letter ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                                </button>
                                            </div>
                                            <Input 
                                                value={q[`option${letter}` as keyof Question] as string}
                                                onChange={(e) => handleQuestionChange(index, `option${letter}` as keyof Question, e.target.value)}
                                                placeholder={`Texte de l'option ${letter}`}
                                                className={q.correctAnswer === letter ? 'border-emerald-200 bg-emerald-50/30' : ''}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        )}
                    </Card>
                ))}

                <Button 
                    variant="outline" 
                    className="w-full border-dashed py-6 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                    onClick={handleAddQuestion}
                >
                    <Plus size={20} className="mr-2" /> Ajouter une question
                </Button>
            </div>
        </div>
    );
}
