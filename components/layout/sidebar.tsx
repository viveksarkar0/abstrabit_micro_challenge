'use client'

import React, { useState, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard,
    Star,
    FolderOpen,
    Settings,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    PlusCircle,
    Search
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Context for sidebar state
const SidebarContext = createContext<{
    expanded: boolean
    setExpanded: (expanded: boolean) => void
    isMobileOpen: boolean
    setIsMobileOpen: (open: boolean) => void
}>({
    expanded: true,
    setExpanded: () => { },
    isMobileOpen: false,
    setIsMobileOpen: () => { },
})

export const useSidebar = () => useContext(SidebarContext)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [expanded, setExpanded] = useState(true)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    return (
        <SidebarContext.Provider
            value={{ expanded, setExpanded, isMobileOpen, setIsMobileOpen }}
        >
            {children}
        </SidebarContext.Provider>
    )
}

export function Sidebar({ user }: { user: any }) {
    const { expanded, setExpanded, isMobileOpen, setIsMobileOpen } = useContext(SidebarContext)
    const pathname = usePathname()
    const router = useRouter()

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
        { icon: Star, label: 'Favorites', href: '/favorites' },
        { icon: FolderOpen, label: 'Collections', href: '/collections' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ]

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileOpen(false)}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen bg-background border-r border-border transition-all duration-300 ease-in-out flex flex-col",
                    expanded ? "w-64" : "w-20",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="h-16 flex items-center px-4 border-b border-border relative">
                    <div className={cn("flex items-center gap-3 overflow-hidden w-full", !expanded && "justify-center")}>
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="w-5 h-5 text-primary-foreground"
                            >
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <AnimatePresence>
                            {expanded && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="font-bold text-lg whitespace-nowrap overflow-hidden"
                                >
                                    SmartMarks
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Desktop Toggle Button - Absolute Positioned */}
                    <div className="absolute -right-3 top-6 hidden lg:flex z-50">
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => setExpanded(!expanded)}
                            className="h-6 w-6 rounded-full border border-border shadow-md p-0 hover:bg-muted"
                        >
                            {expanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                        </Button>
                    </div>

                    {/* Mobile Close Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileOpen(false)}
                        className="lg:hidden ml-auto"
                    >
                        <X size={20} />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                    <div className="mb-6 px-1">
                        {expanded ? (
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search..." className="pl-9 bg-muted/50 border-none" />
                            </div>
                        ) : (
                            <Button variant="ghost" size="icon" className="w-full">
                                <Search size={20} />
                            </Button>
                        )}
                    </div>

                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon size={20} className="shrink-0" />
                                {expanded && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="whitespace-nowrap font-medium"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                                {!expanded && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none shadow-md z-50 whitespace-nowrap">
                                        {item.label}
                                    </div>
                                )}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-border">
                    <div className={cn("flex items-center gap-3", expanded ? "justify-start" : "justify-center")}>
                        <Avatar className="h-9 w-9 border border-border">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-primary/20 text-primary">
                                {user.email?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {expanded && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate">
                                    {user.user_metadata?.full_name || 'User'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user.email}
                                </p>
                            </div>
                        )}
                        {expanded && (
                            <Button variant="ghost" size="icon" onClick={handleSignOut} className="shrink-0 text-muted-foreground hover:text-destructive">
                                <LogOut size={18} />
                            </Button>
                        )}
                    </div>
                </div>
            </motion.aside>
        </>
    )
}
