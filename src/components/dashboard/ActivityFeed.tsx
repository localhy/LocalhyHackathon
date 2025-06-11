import React, { useState, useEffect } from 'react'
import { Lightbulb, Megaphone, Wrench, Eye, User, Building, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { 
  getIdeas, 
  getReferralJobs, 
  getTools,
  subscribeToUserNotifications,
  type Idea,
  type ReferralJob,
  type Tool 
} from '../../lib/database'
import { useAuth } from '../../contexts/AuthContext'

interface ActivityItem {
  id: string
  title: string
  author: string
  type: 'idea' | 'referral' | 'tool'
  thumbnail?: string
  views?: number
  category: string
  location?: string
  price?: number
  commission?: number
  commission_type?: string
  created_at: string
  user_profiles: {
    name: string
    avatar_url?: string
  }
}

const ActivityFeed: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
    
    // Set up real-time subscriptions for new content
    if (user) {
      const subscription = subscribeToUserNotifications(user.id, (payload) => {
        // When new content is created, refresh the activity feed
        if (payload.eventType === 'INSERT' && 
            (payload.new.title?.includes('new idea') || 
             payload.new.title?.includes('new referral') || 
             payload.new.title?.includes('new tool'))) {
          loadActivities()
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const loadActivities = async () => {
    try {
      setLoading(true)
      
      // Fetch recent content from all categories
      const [ideas, referralJobs, tools] = await Promise.all([
        getIdeas(5, 0, user?.id), // Get 5 recent ideas
        getReferralJobs(5, 0, user?.id), // Get 5 recent referral jobs
        getTools(5, 0) // Get 5 recent tools
      ])

      // Combine and format all activities
      const allActivities: ActivityItem[] = [
        ...ideas.map(idea => ({
          id: idea.id,
          title: idea.title,
          author: idea.user_profiles?.name || 'Anonymous',
          type: 'idea' as const,
          thumbnail: idea.thumbnail_url || undefined,
          views: idea.views,
          category: idea.category,
          location: idea.location || undefined,
          price: idea.price,
          created_at: idea.created_at,
          user_profiles: {
            name: idea.user_profiles?.name || 'Anonymous',
            avatar_url: idea.user_profiles?.avatar_url || undefined
          }
        })),
        ...referralJobs.map(job => ({
          id: job.id,
          title: job.title,
          author: job.user_profiles?.name || 'Business Owner',
          type: 'referral' as const,
          thumbnail: job.logo_url || undefined,
          category: job.category,
          location: job.location,
          commission: job.commission,
          commission_type: job.commission_type,
          created_at: job.created_at,
          user_profiles: {
            name: job.user_profiles?.name || 'Business Owner',
            avatar_url: job.user_profiles?.avatar_url || undefined
          }
        })),
        ...tools.map(tool => ({
          id: tool.id,
          title: tool.title,
          author: tool.user_profiles?.name || 'Creator',
          type: 'tool' as const,
          category: tool.category,
          price: tool.price,
          views: tool.downloads_count,
          created_at: tool.created_at,
          user_profiles: {
            name: tool.user_profiles?.name || 'Creator',
            avatar_url: tool.user_profiles?.avatar_url || undefined
          }
        }))
      ]

      // Sort by creation date (newest first) and take top 10
      const sortedActivities = allActivities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)

      setActivities(sortedActivities)
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'idea':
        return <Lightbulb className="h-4 w-4 text-green-500" />
      case 'referral':
        return <Building className="h-4 w-4 text-blue-500" />
      case 'tool':
        return <Wrench className="h-4 w-4 text-purple-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeBadge = (type: string) => {
    const badges = {
      idea: 'bg-green-100 text-green-800',
      referral: 'bg-blue-100 text-blue-800',
      tool: 'bg-purple-100 text-purple-800'
    }
    return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  const handleActivityClick = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'idea':
        navigate(`/dashboard/ideas/${activity.id}`)
        break
      case 'referral':
        navigate(`/dashboard/referral-jobs/${activity.id}`)
        break
      case 'tool':
        // For now, navigate to starter tools page
        // In the future, this would navigate to a tool detail page
        navigate('/dashboard/starter-tools')
        break
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 
          className="text-xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: 'Montserrat' }}
        >
          Latest from Your Community
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 
        className="text-xl font-bold text-gray-900 mb-4"
        style={{ fontFamily: 'Montserrat' }}
      >
        Latest from Your Community
      </h2>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h3 
            className="text-lg font-medium text-gray-900 mb-2"
            style={{ fontFamily: 'Montserrat' }}
          >
            No activity yet
          </h3>
          <p 
            className="text-gray-600 mb-4"
            style={{ fontFamily: 'Inter' }}
          >
            Be the first to post an idea, create a referral job, or submit a tool to see community activity here.
          </p>
          <button
            onClick={() => navigate('/dashboard/create-new')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
            style={{ fontFamily: 'Inter' }}
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={`${activity.type}-${activity.id}`}
              className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleActivityClick(activity)}
            >
              {/* Thumbnail or Icon */}
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {activity.thumbnail ? (
                  <img 
                    src={activity.thumbnail} 
                    alt={activity.title}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`${activity.thumbnail ? 'hidden' : ''}`}>
                  {getTypeIcon(activity.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 
                    className="font-medium text-gray-900 truncate"
                    style={{ fontFamily: 'Inter' }}
                  >
                    {activity.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(activity.type)}`}>
                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    {activity.user_profiles.avatar_url ? (
                      <img
                        src={activity.user_profiles.avatar_url}
                        alt={activity.author}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span>by {activity.author}</span>
                  </div>
                  
                  <span>{activity.category}</span>
                  
                  {activity.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{activity.location}</span>
                    </div>
                  )}
                  
                  <span>{formatTimeAgo(activity.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {activity.views !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{activity.views}</span>
                  </div>
                )}
                
                {activity.price !== undefined && activity.price > 0 && (
                  <div className="text-green-600 font-medium">
                    ${activity.price}
                  </div>
                )}
                
                {activity.commission !== undefined && (
                  <div className="text-blue-600 font-medium">
                    {activity.commission_type === 'percentage' ? `${activity.commission}%` : `$${activity.commission}`}
                  </div>
                )}
                
                <button className="text-green-500 hover:text-green-600 font-medium text-sm">
                  View
                </button>
              </div>
            </div>
          ))}
          
          <div className="text-center pt-4">
            <button
              onClick={() => navigate('/dashboard/ideas-vault')}
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              View All Activity →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityFeed