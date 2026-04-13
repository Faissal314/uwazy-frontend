import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/Button';
import { BookOpen, CheckCircle2, ArrowRight, BadgeCent } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-md overflow-hidden">
              <img src="/uwazylogo.jpeg" alt="Uwazy Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Uwazy<span className="text-blue-600">Online</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Connexion
            </Link>
            <Link href="/register" className={buttonVariants({ size: "sm" })}>
              S'inscrire
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-3xl -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 mb-8">
              <span className="flex w-2 h-2 rounded-full bg-blue-600 mr-2 animate-pulse" />
              La nouvelle façon d'apprendre
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto mb-8">
              Développez vos compétences avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">UwazyOnline</span>.
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Une plateforme moderne et intuitive pour suivre des cours, passer des évaluations et obtenir des certificats reconnus.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className={buttonVariants({ size: "lg", className: "w-full sm:w-auto h-12 px-8 text-base" })}>
                Commencer l'apprentissage <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/courses" className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto h-12 px-8 text-base bg-white" })}>
                Explorer le catalogue
              </Link>
            </div>

            <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto text-left border-t border-slate-200 pt-12">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
                  <BookOpen size={24} />
                </div>
                <h3 className="font-semibold text-slate-900">Cours interactifs</h3>
                <p className="text-sm text-slate-500 mt-2">Apprenez à votre rythme avec des modules structurés.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4 text-emerald-600">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="font-semibold text-slate-900">Évaluations</h3>
                <p className="text-sm text-slate-500 mt-2">Validez vos acquis avec des auto-évaluations ciblées.</p>
              </div>
              <div className="hidden md:flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
                  <BadgeCent size={24} />
                </div>
                <h3 className="font-semibold text-slate-900">Certifications</h3>
                <p className="text-sm text-slate-500 mt-2">Obtenez des certificats valorisants pour votre carrière.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
