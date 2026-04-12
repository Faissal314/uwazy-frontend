'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Image, Video, FileText, Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '@/services/api';

interface FileUploadProps {
    onUploadSuccess: (url: string, path: string) => void;
    type: 'image' | 'video' | 'document';
    label?: string;
    description?: string;
    accept?: string;
    maxSizeMB?: number;
    currentUrl?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onUploadSuccess,
    type,
    label,
    description,
    accept,
    maxSizeMB = 500,
    currentUrl
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getIcon = () => {
        switch (type) {
            case 'image': return <Image size={20} />;
            case 'video': return <Video size={20} />;
            case 'document': return <FileText size={20} />;
            default: return <Upload size={20} />;
        }
    };

    const getAccept = () => {
        if (accept) return accept;
        switch (type) {
            case 'image': return 'image/*';
            case 'video': return 'video/*';
            case 'document': return '.pdf,.doc,.docx';
            default: return '*/*';
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`Le fichier est trop volumineux. Max ${maxSizeMB}MB.`);
            return;
        }

        setIsUploading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const config = {
                onUploadProgress: (progressEvent: any) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                },
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            const response = await api.post(`/files/upload/${type}`, formData, config);
            
            setSuccess(true);
            onUploadSuccess(response.data.url || '', response.data.path || '');
            
            // Clear input
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
            console.error('Upload failed', err);
            setError(err.response?.data?.message || 'Erreur lors de l\'envoi du fichier.');
        } finally {
            setIsUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="space-y-2">
            {label && <label className="text-sm font-semibold text-slate-700 block">{label}</label>}
            
            <div 
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer
                    flex flex-col items-center justify-center gap-2 text-center
                    ${isUploading ? 'bg-slate-50 border-slate-200 cursor-wait' : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'}
                    ${success ? 'border-emerald-200 bg-emerald-50/30' : ''}
                    ${error ? 'border-red-200 bg-red-50/30' : ''}
                `}
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept={getAccept()}
                    className="hidden" 
                />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Spinner size="lg" className="text-blue-600" />
                        <span className="text-sm font-medium text-slate-600">Téléchargement {progress}%</span>
                        <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-600 transition-all duration-300" 
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                ) : success ? (
                    <div className="flex flex-col items-center gap-1 text-emerald-600">
                        <CheckCircle2 size={32} />
                        <span className="text-sm font-bold">Fichier envoyé !</span>
                        <span className="text-xs text-emerald-500 underline">Changer de fichier</span>
                    </div>
                ) : (
                    <>
                        <div className={`p-3 rounded-full ${error ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                            {getIcon()}
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm font-bold text-slate-700">
                                {currentUrl ? 'Modifier le fichier' : 'Cliquez pour envoyer'}
                            </span>
                            {description && <p className="text-xs text-slate-400">{description}</p>}
                        </div>
                    </>
                )}

                {currentUrl && !isUploading && !success && !error && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                        DÉJÀ PRÉSENT
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-600 text-xs font-medium animate-in fade-in duration-300">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                    <button onClick={(e) => { e.stopPropagation(); setError(null); }} className="ml-auto hover:text-red-800">
                        <X size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};
