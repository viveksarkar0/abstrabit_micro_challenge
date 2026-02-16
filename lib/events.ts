

export const BOOKMARK_EVENTS = {
    CREATED: 'bookmark:created',
    DELETED: 'bookmark:deleted',
} as const

export function emitBookmarkCreated() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(BOOKMARK_EVENTS.CREATED))
    }
}

export function emitBookmarkDeleted() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(BOOKMARK_EVENTS.DELETED))
    }
}
