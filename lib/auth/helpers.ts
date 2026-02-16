

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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


export async function isAuthenticated() {
    const user = await getCurrentUser()
    return !!user
}


export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
