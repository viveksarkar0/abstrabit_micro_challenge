
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GoogleSignInButton from './google-sign-in-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bookmark, CheckCircle2, Zap, Shield } from 'lucide-react'

export default async function LoginPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/')
    }

    return (
        <div className="min-h-screen flex w-full">
            {/* Left Side - Hero/Marketing */}
            <div className="hidden lg:flex w-1/2 bg-zinc-900 relative flex-col justify-between p-12 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex items-center gap-2 text-lg font-medium">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                        <Bookmark className="w-5 h-5" />
                    </div>
                    SmartMarks
                </div>

                <div className="relative z-10 space-y-6 max-w-lg">
                    <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                        Your digital library, <br />
                        <span className="text-indigo-400">reimagined.</span>
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Save, organize, and access your favorite links from anywhere.
                        Experience the bookmark manager built for modern productivity.
                    </p>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-1 rounded-full bg-green-500/10 text-green-400">
                                <CheckCircle2 size={16} />
                            </div>
                            <span className="text-sm text-zinc-300">Real-time synchronization across devices</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-1 rounded-full bg-blue-500/10 text-blue-400">
                                <Zap size={16} />
                            </div>
                            <span className="text-sm text-zinc-300">Instant search and collections</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-1 rounded-full bg-purple-500/10 text-purple-400">
                                <Shield size={16} />
                            </div>
                            <span className="text-sm text-zinc-300">Private & Secure with Row Level Security</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <blockquote className="space-y-2">
                        <p className="text-lg text-zinc-300 italic">
                            &ldquo;Finally, a bookmark manager that feels like it belongs in the modern web stack. Simple, fast, and beautiful.&rdquo;
                        </p>
                        <footer className="text-sm text-zinc-500 font-medium">
                            — Early Adopter
                        </footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950">
                <div className="w-full max-w-sm space-y-6">
                    <div className="flex flex-col space-y-2 text-center lg:text-left">
                        <div className="lg:hidden mx-auto mb-4 p-3 bg-indigo-600 rounded-xl w-fit">
                            <Bookmark className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Sign in to your account to continue
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <GoogleSignInButton />

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-zinc-50 dark:bg-zinc-950 px-2 text-muted-foreground">
                                    Trusted by developers
                                </span>
                            </div>
                        </div>

                        <p className="px-8 text-center text-xs text-muted-foreground">
                            By clicking continue, you agree to our{" "}
                            <a href="#" className="underline underline-offset-4 hover:text-primary">
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a href="#" className="underline underline-offset-4 hover:text-primary">
                                Privacy Policy
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
