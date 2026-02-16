/**
 * Application-Level Type Definitions
 * 
 * These types are used throughout the application for bookmark operations.
 */

import { Database } from './database.types'

// Bookmark type from database
export interface Bookmark {
    id: string
    user_id: string
    title: string
    url: string
    is_favorite: boolean
    collection: string | null
    created_at: string
    updated_at: string
}

// Type for creating a new bookmark
export type CreateBookmarkInput = {
    title: string
    url: string
}

// Type for bookmark form state
export type BookmarkFormData = {
    title: string
    url: string
}

// Type for API responses
export type ActionResponse<T = void> = {
    success: boolean
    data?: T
    error?: string
}
