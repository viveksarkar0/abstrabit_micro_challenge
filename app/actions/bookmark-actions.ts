/**
 * Server Actions for Bookmark Operations
 * 
 * These actions handle all bookmark CRUD operations with:
 * - Server-side validation
 * - Authentication verification
 * - Type-safe responses
 * - Error handling
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResponse, CreateBookmarkInput, Bookmark } from '@/types/bookmark.types'

/**
 * Validates a URL string
 */
function isValidUrl(url: string): boolean {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

/**
 * Create a new bookmark
 */
export async function createBookmark(
    input: CreateBookmarkInput
): Promise<ActionResponse> {
    try {
        // Validation
        if (!input.title || input.title.trim().length === 0) {
            return {
                success: false,
                error: 'Title is required',
            }
        }

        if (!input.url || input.url.trim().length === 0) {
            return {
                success: false,
                error: 'URL is required',
            }
        }

        if (!isValidUrl(input.url)) {
            return {
                success: false,
                error: 'Please enter a valid URL (e.g., https://example.com)',
            }
        }

        // Get authenticated user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return {
                success: false,
                error: 'You must be logged in to create bookmarks',
            }
        }

        // Insert bookmark
        const { error: insertError } = await supabase
            .from('bookmarks')
            .insert({
                user_id: user.id,
                title: input.title.trim(),
                url: input.url.trim(),
            })

        if (insertError) {
            console.error('Error creating bookmark:', insertError)
            return {
                success: false,
                error: 'Failed to create bookmark. Please try again.',
            }
        }

        // Revalidate the page to show the new bookmark
        revalidatePath('/')

        return {
            success: true,
        }
    } catch (error) {
        console.error('Unexpected error creating bookmark:', error)
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        }
    }
}

/**
 * Delete a bookmark
 */
export async function deleteBookmark(
    bookmarkId: string
): Promise<ActionResponse> {
    try {
        if (!bookmarkId) {
            return {
                success: false,
                error: 'Bookmark ID is required',
            }
        }

        // Get authenticated user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return {
                success: false,
                error: 'You must be logged in to delete bookmarks',
            }
        }

        // Delete bookmark (RLS ensures user can only delete their own)
        const { error: deleteError } = await supabase
            .from('bookmarks')
            .delete()
            .eq('id', bookmarkId)
            .eq('user_id', user.id) // Extra safety check

        if (deleteError) {
            console.error('Error deleting bookmark:', deleteError)
            return {
                success: false,
                error: 'Failed to delete bookmark. Please try again.',
            }
        }

        // Revalidate the page to reflect the deletion
        revalidatePath('/')

        return {
            success: true,
        }
    } catch (error) {
        console.error('Unexpected error deleting bookmark:', error)
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        }
    }
}

export async function toggleFavorite(id: string, isFavorite: boolean): Promise<ActionResponse<Bookmark>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { data, error } = await supabase
            .from('bookmarks')
            .update({ is_favorite: isFavorite })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) throw error

        revalidatePath('/')
        revalidatePath('/favorites')
        return { success: true, data: data as Bookmark }
    } catch (error) {
        console.error('Error toggling favorite:', error)
        return { success: false, error: 'Failed to update favorite status' }
    }
}

export async function updateCollection(id: string, collection: string | null): Promise<ActionResponse<Bookmark>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { data, error } = await supabase
            .from('bookmarks')
            .update({ collection })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) throw error

        revalidatePath('/')
        revalidatePath('/collections')
        return { success: true, data: data as Bookmark }
    } catch (error) {
        console.error('Error updating collection:', error)
        return { success: false, error: 'Failed to update collection' }
    }
}
// ... existing code ...

export async function updateBookmark(
    id: string,
    data: { title?: string; url?: string; collection?: string | null }
): Promise<ActionResponse<Bookmark>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        // Validate URL if provided
        if (data.url && !isValidUrl(data.url)) {
            return {
                success: false,
                error: 'Please enter a valid URL',
            }
        }

        const updates: any = {}
        if (data.title !== undefined) updates.title = data.title.trim()
        if (data.url !== undefined) updates.url = data.url.trim()
        if (data.collection !== undefined) updates.collection = data.collection

        const { data: updatedBookmark, error } = await supabase
            .from('bookmarks')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) throw error

        revalidatePath('/')
        revalidatePath('/favorites')
        revalidatePath('/collections')

        return { success: true, data: updatedBookmark as Bookmark }
    } catch (error) {
        console.error('Error updating bookmark:', error)
        return { success: false, error: 'Failed to update bookmark' }
    }
}
