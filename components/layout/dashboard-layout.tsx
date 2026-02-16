'use client'

import React from 'react'
import { SidebarProvider, Sidebar, useSidebar } from './sidebar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
    children,
    user
}: {
    children: React.ReactNode
    user: any
}) {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-background flex">
                <Sidebar user={user} />
                <MainContent>{children}</MainContent>
            </div>
        </SidebarProvider>
    )
}

function MainContent({ children }: { children: React.ReactNode }) {
    const { expanded, setIsMobileOpen } = useSidebar()

    return (
        <main
            className={cn(
                "flex-1 min-w-0 transition-all duration-300 ease-in-out flex flex-col bg-gradient-mesh",
                expanded ? "lg:pl-64" : "lg:pl-20"
            )}
        >
            {/* Mobile Header Trigger */}
            <div className="lg:hidden h-16 border-b border-border flex items-center px-4 sticky top-0 bg-background/80 backdrop-blur z-30 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="mr-4">
                    <Menu size={24} />
                </Button>
                <span className="font-bold text-lg">SmartMarks</span>
            </div>

            {/* Main Scrollable Content */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-8">
                    {children}
                </div>
            </div>
        </main>
    )
}
