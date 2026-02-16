'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BOOKMARK_EVENTS } from '@/lib/events'
import type { Bookmark } from '@/types/bookmark.types'
import BookmarkItem from './bookmark-item'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'
import { Bookmark as BookmarkIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BookmarkListProps {
    initialBookmarks: Bookmark[]
    userId: string
}

export default function BookmarkList({ initialBookmarks, userId }: BookmarkListProps) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
    const [isLoading, setIsLoading] = useState(false)

    // Sync with server-side updates (e.g. after router.refresh())
    useEffect(() => {
        setBookmarks(initialBookmarks)
    }, [initialBookmarks])

    // Function to manually fetch bookmarks
    const fetchBookmarks = async () => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('bookmarks')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setBookmarks(data as Bookmark[])
        }
    }

    useEffect(() => {
        const supabase = createClient()

        // Listen for custom events from the form
        const handleBookmarkCreated = () => {
            fetchBookmarks()
        }

        window.addEventListener(BOOKMARK_EVENTS.CREATED, handleBookmarkCreated)

        // Create unique channel name to avoid interference between tabs
        const channelName = `bookmarks-${userId}-${Math.random().toString(36).substr(2, 9)}`
        console.log('[Realtime] Creating channel:', channelName)

        const channel: RealtimeChannel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookmarks',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('[Realtime] ✅ Received update:', payload.eventType, payload)
                    if (payload.eventType === 'INSERT') {
                        setBookmarks((current) => [payload.new as Bookmark, ...current])
                    } else if (payload.eventType === 'DELETE') {
                        setBookmarks((current) =>
                            current.filter((bookmark) => bookmark.id !== payload.old.id)
                        )
                    } else if (payload.eventType === 'UPDATE') {
                        setBookmarks((current) =>
                            current.map((bookmark) =>
                                bookmark.id === payload.new.id ? (payload.new as Bookmark) : bookmark
                            )
                        )
                    }
                }
            )
            .subscribe((status) => {
                console.log('[Realtime] Subscription status:', status)
                if (status === 'SUBSCRIBED') {
                    console.log('[Realtime] ✅ Successfully subscribed to changes for user:', userId)
                }
            })

        return () => {
            window.removeEventListener(BOOKMARK_EVENTS.CREATED, handleBookmarkCreated)
            supabase.removeChannel(channel)
        }
    }, [userId])

    if (isLoading) {
        return <LoadingSkeleton />
    }

    if (bookmarks.length === 0) {
        return <EmptyState />
    }

    return (
        <motion.div
            layout
            className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
            <AnimatePresence mode="popLayout">
                {bookmarks.map((bookmark) => (
                    <BookmarkItem key={bookmark.id} bookmark={bookmark} />
                ))}
            </AnimatePresence>
        </motion.div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse bg-card/50 border-border/50">
                    <CardContent className="pt-6">
                        <div className="h-4 bg-muted/50 rounded w-3/4 mb-3" />
                        <div className="h-3 bg-muted/50 rounded w-1/2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function EmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-2 border-dashed border-border/50 rounded-2xl p-12 text-center bg-card/30 backdrop-blur-sm"
        >
            <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-bounce-subtle">
                    <BookmarkIcon className="w-8 h-8 text-primary" />
                </div>
            </div>
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                No bookmarks found
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Your library is empty. Add your first bookmark to get started with your collection.
            </p>
        </motion.div>
    )
}
