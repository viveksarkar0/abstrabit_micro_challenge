'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createBookmark } from '@/app/actions/bookmark-actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2, Link as LinkIcon, Type } from 'lucide-react'
import { motion } from 'framer-motion'

export default function BookmarkForm() {
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const [isFocused, setIsFocused] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        startTransition(async () => {
            const result = await createBookmark({ title, url })

            if (result.success) {
                toast.success('Bookmark saved to library')
                setTitle('')
                setUrl('')
                router.refresh()
                // Dispatch event only if needed, but router refresh + realtime usually covers it. 
                // Keeping event for immediate feedback if implemented in list.
                window.dispatchEvent(new Event('bookmark-created'))
            } else {
                toast.error(result.error || 'Failed to create bookmark')
            }
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative group"
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    setIsFocused(false)
                }
            }}
        >
            {/* Glow Effect - Subtler for Big Tech look */}
            <div className={`absolute -inset-0.5 bg-foreground/5 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500 ${isFocused ? 'opacity-20' : ''}`} />

            <form onSubmit={handleSubmit} className="relative bg-card border border-border/60 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="url" className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <LinkIcon size={12} /> URL
                        </Label>
                        <Input
                            type="url"
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://site.com"
                            required
                            disabled={isPending}
                            className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Type size={12} /> Title
                        </Label>
                        <Input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Site Name"
                            required
                            disabled={isPending}
                            className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending || !title.trim() || !url.trim()}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" />
                                Save Bookmark
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </motion.div>
    )
}
