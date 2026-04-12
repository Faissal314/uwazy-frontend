'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import api from '@/services/api';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState<'email' | 'reset'>('email');

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/forgot-password', { email });
            setResetToken(response.data.token);
            setStep('reset');
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await api.post('/auth/reset-password', {
                token: resetToken,
                newPassword: newPassword
            });
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Une erreur est survenue lors du changement de mot de passe.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="mb-6">
                    <Link href="/login" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour à la connexion
                    </Link>
                </div>

                <Card className="border-0 shadow-lg">
                    {step === 'email' ? (
                        <>
                            <CardHeader className="space-y-2">
                                <CardTitle className="text-2xl">Réinitialiser le mot de passe</CardTitle>
                                <CardDescription>
                                    Entrez l'adresse e-mail associée à votre compte
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleForgotPassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Adresse e-mail</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="vous@exemple.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isLoading}
                                            required
                                            className="h-10"
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full h-10"
                                        disabled={isLoading || !email}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Spinner size="sm" /> Envoi en cours...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="w-4 h-4 mr-2" />
                                                Envoyer le lien
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-center text-sm text-slate-600">
                                        Vous avez un compte?{' '}
                                        <Link href="/login" className="text-blue-600 hover:underline font-medium">
                                            Se connecter
                                        </Link>
                                    </p>
                                </form>
                            </CardContent>
                        </>
                    ) : (
                        <>
                            <CardHeader className="space-y-2">
                                <div className="flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                </div>
                                <CardTitle className="text-2xl text-center">Nouveau mot de passe</CardTitle>
                                <CardDescription className="text-center">
                                    Entrez votre nouveau mot de passe
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleResetPassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            disabled={isLoading}
                                            required
                                            className="h-10"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={isLoading}
                                            required
                                            className="h-10"
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    )}

                                    {success && (
                                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                                            <p className="text-sm text-emerald-700">
                                                Mot de passe réinitialisé avec succès! Redirection...
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full h-10"
                                        disabled={isLoading || !newPassword || !confirmPassword}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Spinner size="sm" /> Réinitialisation...
                                            </>
                                        ) : (
                                            'Réinitialiser le mot de passe'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
