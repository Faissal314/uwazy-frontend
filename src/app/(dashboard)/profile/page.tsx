'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User as UserIcon, Mail, BadgeCent } from 'lucide-react';

export default function ProfilePage() {
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [isSaving, setIsSaving] = useState(false);

    if (!user) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { default: api } = await import('@/services/api');
            const response = await api.put('/users/profile', { firstName, lastName });
            
            // update context locally using trick if no separate update method
            if (response.data) {
                const token = localStorage.getItem('token');
                if (token) {
                    login(token, { ...user, firstName, lastName });
                    setIsEditing(false);
                }
            }
        } catch (error) {
            console.error('Failed to update profile', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mon Profil</h1>
                <p className="text-slate-500 mt-1">Gérez vos informations personnelles et préférences.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Informations Personnelles</CardTitle>
                            <CardDescription>Mettez à jour vos informations de base</CardDescription>
                        </div>
                        <Button variant={isEditing ? "outline" : "default"} onClick={() => {
                            setIsEditing(!isEditing);
                            if (isEditing) {
                                setFirstName(user.firstName);
                                setLastName(user.lastName);
                            }
                        }}>
                            {isEditing ? "Annuler" : "Modifier"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-3xl">
                            {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900">{user.firstName} {user.lastName}</h3>
                            <div className="flex items-center text-slate-500 mt-1">
                                <BadgeCent className="w-4 h-4 mr-1 text-blue-500" />
                                <span className="text-sm">{user.role === 'ETUDIANT' ? 'Étudiant' : user.role === 'FORMATEUR' ? 'Formateur' : 'Administrateur'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center">
                                <UserIcon className="w-4 h-4 mr-2 text-slate-400" /> Prénom
                            </label>
                            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center">
                                <UserIcon className="w-4 h-4 mr-2 text-slate-400" /> Nom
                            </label>
                            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!isEditing} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center">
                                <Mail className="w-4 h-4 mr-2 text-slate-400" /> Adresse Email
                            </label>
                            <Input defaultValue={user.email} disabled={true} className="bg-slate-50" />
                            <p className="text-xs text-slate-500 mt-1">L'adresse email ne peut pas être modifiée ici.</p>
                        </div>
                    </div>
                </CardContent>
                {isEditing && (
                    <CardFooter className="flex justify-end border-t border-slate-100 pt-6">
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
