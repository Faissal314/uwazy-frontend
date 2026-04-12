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
import { Role } from '@/types';

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'ETUDIANT' as Role,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/register', formData);
            const { token, ...userData } = response.data;
            login(token, userData);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Échec de l\'inscription. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-0 shadow-2xl shadow-blue-900/5 ring-1 ring-slate-200/50">
            <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl text-center">Créer un compte</CardTitle>
                <CardDescription className="text-center">
                    Rejoignez UwazyOnline pour démarrer votre apprentissage
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Prénom</label>
                            <Input
                                name="firstName"
                                placeholder="Faissal"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nom</label>
                            <Input
                                name="lastName"
                                placeholder="DERME"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Email</label>
                        <Input
                            type="email"
                            name="email"
                            placeholder="exemple@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Mot de passe</label>
                        <Input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Rôle (Type de compte)</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                            required
                        >
                            <option value="ETUDIANT">Étudiant</option>
                            <option value="FORMATEUR">Formateur</option>
                        </select>
                    </div>

                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading && <Spinner className="mr-2 h-4 w-4" size="sm" />}
                        <span>S'inscrire</span>
                    </Button>
                    <div className="text-sm text-center text-slate-500">
                        Vous avez déjà un compte ?{' '}
                        <Link href="/login" className="text-blue-600 hover:underline font-medium">
                            Se connecter
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
