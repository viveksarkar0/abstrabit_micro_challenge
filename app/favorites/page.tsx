import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/helpers'
import BookmarkList from '@/components/bookmarks/bookmark-list'
import DashboardLayout from '@/components/layout/dashboard-layout'
import type { Bookmark as BookmarkType } from '@/types/bookmark.types'
import { Heart } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FavoritesPage() {
    const user = await requireAuth()
    const supabase = await createClient()

    // Fetch only favorites
    const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_favorite', true)
        .order('created_at', { ascending: false })

    const bookmarks: BookmarkType[] = (data as BookmarkType[]) ?? []

    if (error) {
        console.error('Error fetching favorites:', error)
    }

    return (
        <DashboardLayout user={user}>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                        <Heart size={24} fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
                        <p className="text-muted-foreground">Your curated list of top resources.</p>
                    </div>
                </div>

                {bookmarks.length > 0 ? (
                    <BookmarkList initialBookmarks={bookmarks} userId={user.id} />
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/50 rounded-2xl bg-card/30">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground">
                            <Heart size={32} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Click the heart icon on any bookmark to add it to your favorites.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
