

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Get the current authenticated user
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser() {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
        console.error('Error fetching user:', error)
        return null
    }

    return user
}

export async function requireAuth() {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/login')
    }

    return user
}

/**
 * Check if user is authenticated (without redirecting)
 * @returns boolean indicating if user is authenticated
 */
export async function isAuthenticated() {
    const user = await getCurrentUser()
    return !!user
}

/**
 * Sign out the current user
 */
export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
