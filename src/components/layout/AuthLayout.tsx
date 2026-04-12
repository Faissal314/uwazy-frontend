import React from "react"
import { BookOpen } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 relative overflow-hidden">

            {/* Decorative background blur shapes for premium look */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />

            <div className="z-10 w-full max-w-md p-6">
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-lg group-hover:bg-blue-700 transition-colors">
                            <BookOpen size={24} />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900">
                            Uwazy<span className="text-blue-600">Online</span>
                        </span>
                    </Link>
                    <p className="mt-2 text-sm text-slate-500">
                        Votre plateforme d'apprentissage intelligente
                    </p>
                </div>

                {children}
            </div>
        </div>
    )
}
