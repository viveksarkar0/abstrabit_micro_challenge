import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/helpers'
import BookmarkForm from '@/components/bookmarks/bookmark-form'
import BookmarkList from '@/components/bookmarks/bookmark-list'
import DashboardLayout from '@/components/layout/dashboard-layout'
import type { Bookmark as BookmarkType } from '@/types/bookmark.types'
import { Bookmark, Sparkles, TrendingUp, Clock } from 'lucide-react'

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const user = await requireAuth()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

  const bookmarks: BookmarkType[] = (data as BookmarkType[]) ?? []

  if (error) {
    console.error('Error fetching bookmarks:', error)
  }

  // Calculate quick stats
  const totalBookmarks = bookmarks.length
  const recentBookmarks = bookmarks.filter(b => {
    const date = new Date(b.created_at)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    return diff < 1000 * 60 * 60 * 24 * 7 // last 7 days
  }).length

  return (
    <DashboardLayout user={user}>
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your digital library efficiently.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Total Bookmarks"
          value={totalBookmarks}
          icon={Bookmark}
          trend="+2 this week"
          color="primary"
        />
        <StatsCard
          title="Recent Activity"
          value={recentBookmarks}
          icon={Clock}
          trend="Last 7 days"
          color="accent"
        />
        <StatsCard
          title="Productivity"
          value="Top 10%"
          icon={TrendingUp}
          trend="Keep it up!"
          color="secondary"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form (Sticky) */}
        <div className="lg:col-span-1 lg:sticky lg:top-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Quick Add</h2>
            </div>
            <BookmarkForm />
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Library</h2>
            {/* Could add sort/filter controls here */}
          </div>
          <BookmarkList initialBookmarks={bookmarks} userId={user.id} />
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatsCard({ title, value, icon: Icon, trend, color }: any) {
  const colorStyles = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
  }

  return (
    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className={`absolute right-4 top-4 p-2 rounded-lg ${colorStyles[color as keyof typeof colorStyles]}`}>
        <Icon size={20} />
      </div>
      <div className="relative z-10">
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <span className="text-green-500 font-medium">{trend}</span>
        </p>
      </div>
      {/* Decorative glow */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${colorStyles[color as keyof typeof colorStyles].split(' ')[0]}`}></div>
    </div>
  )
}
