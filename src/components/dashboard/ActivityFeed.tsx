import React, { useState, useEffect } from 'react'
import { Lightbulb, Megaphone, Wrench, Eye, User } from 'lucide-react'

interface ActivityItem {
  id: string
  title: string
  author: string
  type: 'idea' | 'referral' | 'tool'
  thumbnail?: string
  views?: number
}

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading real data
    const timer = setTimeout(() => {
      // For MVP, show empty state as this would pull from real database
      setActivities([])
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'idea':
        return <Lightbulb className="h-4 w-4 text-green-500" />
      case 'referral':
        return <Megaphone className="h-4 w-4 text-blue-500" />
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
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                {getTypeIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 
                  className="font-medium text-gray-900 truncate"
                  style={{ fontFamily: 'Inter' }}
                >
                  {activity.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500" style={{ fontFamily: 'Inter' }}>
                    by {activity.author}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(activity.type)}`}>
                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {activity.views && (
                  <div className="flex items-center text-gray-500">
                    <Eye className="h-4 w-4 mr-1" />
                    <span className="text-sm">{activity.views}</span>
                  </div>
                )}
                <button className="text-green-500 hover:text-green-600 font-medium text-sm">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ActivityFeed