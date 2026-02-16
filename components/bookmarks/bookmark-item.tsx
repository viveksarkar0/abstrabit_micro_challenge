'use client'

import { useState, useTransition, useEffect } from 'react'
import { deleteBookmark, toggleFavorite } from '@/app/actions/bookmark-actions'
import { toast } from 'sonner'
import type { Bookmark } from '@/types/bookmark.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Trash2, Loader2, MoreHorizontal, Copy, Share2, Heart, Edit2 } from 'lucide-react'
import EditBookmarkDialog from '@/components/bookmarks/edit-bookmark-dialog'
import { motion } from 'framer-motion'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BookmarkItemProps {
    bookmark: Bookmark
}

export default function BookmarkItem({ bookmark }: BookmarkItemProps) {
    const [isDeleting, startDeletion] = useTransition()
    const [isOptimisticallyDeleted, setIsOptimisticallyDeleted] = useState(false)
    const [isFavorite, setIsFavorite] = useState(bookmark.is_favorite || false)
    const [isEditOpen, setIsEditOpen] = useState(false)

    // Sync state with props when real-time updates occur
    useEffect(() => {
        setIsFavorite(bookmark.is_favorite || false)
    }, [bookmark.is_favorite])

    const handleDelete = () => {
        setIsOptimisticallyDeleted(true)
        startDeletion(async () => {
            const result = await deleteBookmark(bookmark.id)
            if (result.success) {
                toast.success('Bookmark deleted')
            } else {
                setIsOptimisticallyDeleted(false)
                toast.error(result.error || 'Failed to delete')
            }
        })
    }

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const newStatus = !isFavorite
        setIsFavorite(newStatus)
        const result = await toggleFavorite(bookmark.id, newStatus)
        if (!result.success) {
            setIsFavorite(!newStatus)
            toast.error('Failed to update favorite')
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bookmark.url)
        toast.success('URL copied to clipboard')
    }

    const getDomain = (url: string) => {
        try {
            return new URL(url).hostname.replace('www.', '')
        } catch {
            return url
        }
    }

    if (isOptimisticallyDeleted) return null

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="h-full"
            >
                <Card className="h-full group relative overflow-hidden border border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-sm transition-all duration-300">
                    <CardContent className="p-5 flex flex-col h-full">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-secondary/50 shadow-sm border border-border/20">
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=32`}
                                    alt="favicon"
                                    className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>

                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleToggleFavorite}
                                    className={`h-8 w-8 hover:bg-transparent ${isFavorite ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                                >
                                    <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                            <MoreHorizontal size={16} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={copyToClipboard}>
                                            <Copy className="mr-2 h-4 w-4" /> Copy URL
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                {bookmark.title}
                            </h3>
                            <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors w-fit"
                            >
                                <ExternalLink size={12} />
                                {getDomain(bookmark.url)}
                            </a>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                                {new Date(bookmark.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                            {bookmark.collection && (
                                <span className="bg-secondary px-2 py-0.5 rounded-full text-[10px] font-medium">
                                    {bookmark.collection}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <EditBookmarkDialog
                bookmark={bookmark}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        </>
    )
}
