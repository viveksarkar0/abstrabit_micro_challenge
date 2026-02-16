
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GoogleSignInButton from './google-sign-in-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bookmark } from 'lucide-react'

export default async function LoginPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/50">
                        <Bookmark className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Smart Bookmarks
                    </h1>
                    <p className="text-muted-foreground">
                        Save and organize your favorite links
                    </p>
                </div>

                {/* Card */}
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Sign in to continue</CardTitle>
                        <CardDescription className="text-center">
                            Securely access your bookmarks with Google OAuth
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GoogleSignInButton />

                        <p className="mt-6 text-xs text-center text-muted-foreground">
                            By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="mt-8 text-center text-sm text-muted-foreground">
                    🔒 Your bookmarks are private and secured with Row Level Security
                </p>
            </div>
        </div>
    )
}
