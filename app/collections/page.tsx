import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/helpers'
import BookmarkList from '@/components/bookmarks/bookmark-list'
import DashboardLayout from '@/components/layout/dashboard-layout'
import type { Bookmark as BookmarkType } from '@/types/bookmark.types'
import { FolderOpen } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CollectionsPage() {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const bookmarks: BookmarkType[] = (data as BookmarkType[]) ?? []

    if (error) {
        console.error('Error fetching bookmarks for collections:', error)
    }

    // Group bookmarks by collection
    const collections: Record<string, BookmarkType[]> = {}

    bookmarks.forEach(bookmark => {
        const collectionName = bookmark.collection || 'Unorganized'
        if (!collections[collectionName]) {
            collections[collectionName] = []
        }
        collections[collectionName].push(bookmark)
    })

    // Get sorted keys (Unorganized last)
    const collectionNames = Object.keys(collections).sort((a, b) => {
        if (a === 'Unorganized') return 1
        if (b === 'Unorganized') return -1
        return a.localeCompare(b)
    })

    return (
        <DashboardLayout user={user}>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                        <FolderOpen size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
                        <p className="text-muted-foreground">Organize your bookmarks into groups.</p>
                    </div>
                </div>

                {collectionNames.length > 0 ? (
                    <div className="space-y-10">
                        {collectionNames.map(name => (
                            <section key={name} className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                                    <h2 className="text-xl font-semibold">{name}</h2>
                                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                        {collections[name].length}
                                    </span>
                                </div>
                                <BookmarkList initialBookmarks={collections[name]} userId={user.id} />
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/50 rounded-2xl bg-card/30">
                        <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Add collection tags to your bookmarks to see them organized here.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
