'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Award, Download, Share2, Eye, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { getCertificateUrl } from '@/utils/url';
import { cn } from '@/utils/cn';

export default function CertificatesPage() {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                if (user?.role === 'ETUDIANT') {
                    // Students fetch their own certificates
                    const response = await api.get('/certificates/my-certificates');
                    setCertificates(response.data);
                } else if (user?.role === 'FORMATEUR') {
                    // Trainers fetch certificates for their students
                    const response = await api.get('/certificates/instructor/all');
                    setCertificates(response.data);
                } else if (user?.role === 'ADMINISTRATEUR') {
                    // Admins fetch all certificates
                    const response = await api.get('/certificates/admin/all');
                    setCertificates(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch certificates', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCertificates();
    }, [user?.role]);

    if (user?.role === 'ETUDIANT') {
        return <StudentCertificatesView certificates={certificates} isLoading={isLoading} />;
    } else if (user?.role === 'FORMATEUR') {
        return <TrainerCertificatesView certificates={certificates} isLoading={isLoading} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
    } else if (user?.role === 'ADMINISTRATEUR') {
        return <AdminCertificatesView certificates={certificates} isLoading={isLoading} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
    }

    return null;
}

function StudentCertificatesView({ certificates, isLoading }: { certificates: any[], isLoading: boolean }) {
    const { user } = useAuth();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mes Certificats</h1>
                    <p className="text-slate-500 mt-1">Gérez et téléchargez vos certificats de réussite.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Spinner size="lg" />
                </div>
            ) : certificates.length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-lg border-slate-200 bg-white">
                    <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">Aucun certificat obtenu</h3>
                    <p className="text-slate-500 mt-1">Terminez des cours et passez les évaluations finales pour obtenir des certificats.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert, idx) => (
                        <Card key={cert.id || idx} className="overflow-hidden border-2 border-slate-200">
                            <div className="h-48 bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Award className="w-32 h-32" />
                                </div>
                                <Award className="w-12 h-12 text-amber-400 mb-2 relative z-10" />
                                <h3 className="text-white font-serif font-medium text-lg relative z-10">Certificat d'accomplissement</h3>
                                <p className="text-slate-300 text-sm mt-1 mb-2 relative z-10">{cert.course?.title || 'Cours inconnu'}</p>
                                <div className="mt-auto w-full border-t border-slate-700/50 pt-2 text-xs text-slate-400 flex justify-between relative z-10">
                                    <span>Décerné à {user?.firstName} {user?.lastName}</span>
                                    <span>{new Date(cert.issuedAt || Date.now()).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 font-medium">Numéro d'émission:</span>
                                    <span className="font-mono text-slate-700 text-xs">{cert.uuid ? cert.uuid.substring(0, 8).toUpperCase() : 'N/A'}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 bg-slate-50 flex gap-2">
                                <Button 
                                    className="flex-1 bg-slate-900 border-0 hover:bg-black text-white font-bold rounded-xl"
                                    onClick={() => {
                                        const url = getCertificateUrl(cert.pdfUrl);
                                        if (url) {
                                            window.open(url, '_blank');
                                        } else {
                                            alert("Le fichier PDF n'est pas encore disponible.");
                                        }
                                    }}
                                >
                                    <Download className="w-4 h-4 mr-2" /> Télécharger
                                </Button>
                                <Button className="flex-1 rounded-xl" variant="outline">
                                    <Share2 className="w-4 h-4 mr-2" /> Partager
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function TrainerCertificatesView({ certificates, isLoading, searchQuery, setSearchQuery }: { certificates: any[], isLoading: boolean, searchQuery: string, setSearchQuery: (q: string) => void }) {
    const filteredCertificates = certificates.filter(cert =>
        cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Certificats Émis</h1>
                    <p className="text-slate-500 mt-1">Consultez les certificats obtenus par les étudiants dans vos cours.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Rechercher par étudiant ou cours..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                <CardHeader className="pb-0">
                    <CardTitle>Certificats de vos étudiants</CardTitle>
                    <CardDescription>Total: {filteredCertificates.length} certificats obtenus</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Spinner size="lg" />
                        </div>
                    ) : filteredCertificates.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 bg-slate-50">
                            <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p>Aucun certificat n'a encore été émis pour vos cours.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Étudiant</th>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Cours</th>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Date d'émission</th>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Numéro</th>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredCertificates.map((cert) => (
                                        <tr key={cert.uuid} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-slate-900 font-medium">{cert.studentName}</td>
                                            <td className="px-6 py-4 text-slate-700">{cert.courseTitle}</td>
                                            <td className="px-6 py-4 text-slate-600">{new Date(cert.issuedAt).toLocaleDateString('fr-FR')}</td>
                                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">{cert.uuid.substring(0, 8)}...</td>
                                            <td className="px-6 py-4">
                                                <Button size="sm" variant="outline" className="h-8 px-2">
                                                    <Eye className="w-4 h-4 mr-1" /> Voir
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function AdminCertificatesView({ certificates, isLoading, searchQuery, setSearchQuery }: { certificates: any[], isLoading: boolean, searchQuery: string, setSearchQuery: (q: string) => void }) {
    const [localCertificates, setLocalCertificates] = useState(certificates);

    useEffect(() => {
        setLocalCertificates(certificates);
    }, [certificates]);

    const handleDeleteCertificate = async (uuid: string) => {
        if (!confirm('Êtes-vous sûr de vouloir révoquer ce certificat ? Cette action est irréversible.')) return;
        try {
            await api.delete(`/certificates/${uuid}`);
            setLocalCertificates(localCertificates.filter(c => c.uuid !== uuid));
        } catch (error) {
            console.error('Failed to delete certificate', error);
        }
    };

    const filteredCertificates = localCertificates.filter(cert =>
        cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestion des Certificats</h1>
                    <p className="text-slate-500 mt-1">Consultez et gérez tous les certificats émis sur la plateforme.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Rechercher par étudiant ou cours..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                <CardHeader className="pb-0">
                    <CardTitle>Liste des certificats</CardTitle>
                    <CardDescription>Total: {filteredCertificates.length} certificats</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Spinner size="lg" />
                        </div>
                    ) : filteredCertificates.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 bg-slate-50">
                            <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p>Aucun certificat n'a été émis pour le moment.</p>
                            <p className="text-sm mt-2">Les certificats apparaîtront ici lorsque les étudiants compléteront leurs cours.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Étudiant</th>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Cours</th>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Date d'émission</th>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Numéro</th>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredCertificates.map((cert) => (
                                        <tr key={cert.uuid} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-slate-900 font-medium">{cert.studentName}</td>
                                            <td className="px-6 py-4 text-slate-700">{cert.courseTitle}</td>
                                            <td className="px-6 py-4 text-slate-600">{new Date(cert.issuedAt).toLocaleDateString('fr-FR')}</td>
                                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">{cert.uuid.substring(0, 8)}...</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="h-8 px-2">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDeleteCertificate(cert.uuid)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
