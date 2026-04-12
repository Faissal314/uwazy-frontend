'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });

            const { token, ...userData } = response.data;
            login(token, userData);

            router.push('/dashboard');
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Échec de connexion. Vérifiez vos identifiants.';
            const axiosError = err as { response?: { data?: { error?: string } } };
            setError(axiosError?.response?.data?.error || error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-0 shadow-2xl shadow-blue-900/5 ring-1 ring-slate-200/50">
            <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl text-center">Connexion</CardTitle>
                <CardDescription className="text-center">
                    Entrez votre email et mot de passe pour accéder à votre espace
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none text-slate-700">Email</label>
                        <Input
                            type="email"
                            placeholder="exemple@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium leading-none text-slate-700">Mot de passe</label>
                            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                                Oublié ?
                            </Link>
                        </div>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading && <Spinner className="mr-2 h-4 w-4" size="sm" />}
                        <span>Se connecter</span>
                    </Button>
                    <div className="text-sm text-center text-slate-500">
                        Pas encore de compte ?{' '}
                        <Link href="/register" className="text-blue-600 hover:underline font-medium">
                            S'inscrire
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
