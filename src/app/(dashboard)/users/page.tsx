'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { User, Role } from '@/types';
import api from '@/services/api';
import { Users as UsersIcon, Mail, Shield, Calendar, Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/users');
                setUsers(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error('Failed to fetch users', err);
                setError('Impossible de charger la liste des utilisateurs.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUpdateRole = async (userId: number, newRole: string) => {
        try {
            await api.put(`/users/${userId}/role`, { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as Role } : u));
        } catch (error) {
            console.error('Failed to update role', error);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) return;
        try {
            await api.delete(`/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Failed to delete user', error);
            setError('Erreur lors de la suppression de l\'utilisateur.');
        }
    };

    const getRoleBadgeColor = (role: Role) => {
        switch (role) {
            case 'ADMINISTRATEUR': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'FORMATEUR': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Utilisateurs</h1>
                    <p className="text-slate-500 mt-1">Gérez les membres de la plateforme UwazyOnline.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Rechercher par nom ou email..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                <CardHeader className="pb-0">
                    <CardTitle>Liste des membres</CardTitle>
                    <CardDescription>Total: {filteredUsers.length} utilisateurs</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Spinner size="lg" />
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-600 bg-red-50">
                            {error}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rôle</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date d'inscription</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                                                        {user.firstName[0]}{user.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                                                        <p className="text-xs text-slate-500">ID: #{user.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} className="text-slate-400" />
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    className="border-slate-200 border rounded-md px-2 py-1 text-xs font-medium focus:ring-blue-500 bg-transparent text-slate-700 outline-none"
                                                    value={user.role}
                                                    onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                                >
                                                    <option value="ETUDIANT">Étudiant</option>
                                                    <option value="FORMATEUR">Formateur</option>
                                                    <option value="ADMINISTRATEUR">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteUser(user.id)}>
                                                    <Trash2 size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="p-10 text-center text-slate-500 italic">
                                    Aucun utilisateur ne correspond à votre recherche.
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
