'use client';

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, LayoutDashboard, Library, Award, FileCheck, Users, LogOut, Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/utils/cn"
import { Button } from "../ui/Button"

// Sidebar component
function Sidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    const navItems = [
        { label: "Tableau de Bord", icon: LayoutDashboard, href: "/dashboard" },
    ]

    // "Cours" (catalogue) est pour les étudiants et admins
    if (user?.role === "ETUDIANT" || user?.role === "ADMINISTRATEUR") {
        navItems.push({ label: "Cours", icon: Library, href: "/courses" })
    }

    // "Mes Formations", "Étudiants" et "Certificats" sont pour les formateurs
    if (user?.role === "FORMATEUR") {
        navItems.push(
            { label: "Mes Formations", icon: BookOpen, href: "/my-courses" },
            { label: "Mes Étudiants", icon: Users, href: "/enrolled-students" },
            { label: "Certificats Émis", icon: Award, href: "/certificates" }
        )
    }

    // Évaluations et Certificats sont réservés aux étudiants
    if (user?.role === "ETUDIANT") {
        navItems.push(
            { label: "Mes évaluations", icon: FileCheck, href: "/evaluations" },
            { label: "Certificats", icon: Award, href: "/certificates" }
        )
    }

    // Gestion des utilisateurs pour les administrateurs
    if (user?.role === "ADMINISTRATEUR") {
        navItems.push({ label: "Utilisateurs", icon: Users, href: "/users" })
    }

    return (
        <div className="flex flex-col w-64 h-full bg-slate-900 text-slate-300 border-r border-slate-800 transition-all">
            <div className="p-6 flex items-center gap-3">
                <div className="flex items-center justify-center min-w-10 w-10 h-10 rounded-xl bg-white shadow-lg overflow-hidden">
                    <img src="/uwazylogo.jpeg" alt="Uwazy Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white truncate">
                    Uwazy<span className="text-blue-400">Online</span>
                </span>
            </div>

            <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-600/10 text-blue-400"
                                    : "hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <item.icon size={18} className={cn(isActive ? "text-blue-400" : "text-slate-400")} />
                            {item.label}
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 border-t border-slate-800">
                <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-800/50 mb-4 hover:bg-slate-800 transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm group-hover:scale-110 transition-transform">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                    </div>
                </Link>

                <Button
                    variant="ghost"
                    className="w-full flex items-center justify-start gap-3 text-slate-400 hover:text-white hover:bg-slate-800 px-3"
                    onClick={logout}
                >
                    <LogOut size={18} />
                    Déconnexion
                </Button>
            </div>
        </div>
    )
}

function Navbar() {
    return (
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold text-slate-800">Espace d'apprentissage</h1>
            </div>
            <div className="flex items-center gap-4">
                {/* Further top nav actions can go here */}
            </div>
        </header>
    )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth()

    // We don't firmly block rendering here to allow layout shell to show,
    // exact route protection happens in components or middleware

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
