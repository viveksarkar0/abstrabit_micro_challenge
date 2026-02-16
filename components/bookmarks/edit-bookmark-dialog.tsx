'use client'

import { useState, useTransition } from 'react'
import { updateBookmark } from '@/app/actions/bookmark-actions'
import { toast } from 'sonner'
import type { Bookmark } from '@/types/bookmark.types'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EditBookmarkDialogProps {
    bookmark: Bookmark
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function EditBookmarkDialog({
    bookmark,
    open,
    onOpenChange,
}: EditBookmarkDialogProps) {
    const [title, setTitle] = useState(bookmark.title)
    const [url, setUrl] = useState(bookmark.url)
    const [collection, setCollection] = useState(bookmark.collection || '')
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        startTransition(async () => {
            const result = await updateBookmark(bookmark.id, {
                title,
                url,
                collection: collection || null, // Convert empty string to null
            })

            if (result.success) {
                toast.success('Bookmark updated')
                onOpenChange(false)
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to update bookmark')
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Bookmark</DialogTitle>
                    <DialogDescription>
                        Make changes to your bookmark here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="url" className="text-right">
                                URL
                            </Label>
                            <Input
                                id="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="col-span-3"
                                type="url"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="collection" className="text-right">
                                Collection
                            </Label>
                            <Input
                                id="collection"
                                value={collection}
                                onChange={(e) => setCollection(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g. Work, Design, News"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
