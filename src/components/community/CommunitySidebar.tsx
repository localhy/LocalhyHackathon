import React, { useState, useEffect } from 'react'
import { Building, Lightbulb, Megaphone, Wrench, ArrowRight, MapPin, ExternalLink, Users, Calendar, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { userHasBusinessProfile, getRecentCommunityOpportunities, type FeaturedOpportunity } from '../../lib/database'

interface CommunitySidebarProps {
  className?: string
}

const CommunitySidebar: React.FC<CommunitySidebarProps> = ({ className = '' }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [hasBusinessPage, setHasBusinessPage] = useState(false)
  const [featuredOpportunities, setFeaturedOpportunities] = useState<FeaturedOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (user) {
      checkBusinessProfile()
      loadFeaturedOpportunities()
    }
  }, [user])
  
  const checkBusinessProfile = async () => {
    if (!user) return
    
    try {
      const hasProfile = await userHasBusinessProfile(user.id)
      setHasBusinessPage(hasProfile)
    } catch (error) {
      console.error('Error checking business profile:', error)
    }
  }
  
  const loadFeaturedOpportunities = async () => {
    try {
      setLoading(true)
      const opportunities = await getRecentCommunityOpportunities(3)
      setFeaturedOpportunities(opportunities)
    } catch (error) {
      console.error('Error loading featured opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  // Upcoming events - This is still mock data since there's no events table in the database
  // In a real implementation, this would fetch from an events table
  const upcomingEvents = [
    {
      title: 'Farmers Market',
      date: 'Sat, Jul 15',
      location: 'Central Park'
    },
    {
      title: 'Community Cleanup',
      date: 'Sun, Jul 16',
      location: 'Riverside'
    }
  ]
  
  const trendingTopics = [
    '#LocalBusiness',
    '#SummerEvents',
    '#HomeServices',
    '#FarmersMarket',
    '#CommunityHelp'
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Localhy Updates */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center space-x-2 mb-3">
          <Bell className="h-5 w-5 text-blue-500" />
          <h3 
            className="font-semibold text-blue-800"
            style={{ fontFamily: 'Montserrat' }}
          >
            Localhy Updates
          </h3>
        </div>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-sm text-blue-800 font-medium mb-1">
              Welcome to the Community Feed!
            </p>
            <p className="text-xs text-blue-600">
              Share updates, ask questions, and connect with your local community.
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-sm text-blue-800 font-medium mb-1">
              New Feature: Business Pages
            </p>
            <p className="text-xs text-blue-600">
              Create a page for your business to connect with the community.
            </p>
          </div>
        </div>
      </div>
      
      {/* Your Next Step */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 
          className="font-semibold text-gray-900 mb-3"
          style={{ fontFamily: 'Montserrat' }}
        >
          Your Next Step
        </h3>
        
        <div className="space-y-3">
          {!hasBusinessPage && user?.user_metadata?.user_type === 'business-owner' && (
            <button
              onClick={() => navigate('/dashboard/create-business-page')}
              className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span className="font-medium">Create Business Page</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => navigate('/dashboard/create-new?tab=idea')}
            className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5" />
              <span className="font-medium">Post an Idea</span>
            </div>
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => navigate('/dashboard/create-new?tab=referral')}
            className="w-full flex items-center justify-between p-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Megaphone className="h-5 w-5" />
              <span className="font-medium">Create Referral Job</span>
            </div>
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => navigate('/dashboard/create-new?tab=tool')}
            className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5" />
              <span className="font-medium">Submit a Tool</span>
            </div>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Featured Local Opportunities */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 
          className="font-semibold text-gray-900 mb-3"
          style={{ fontFamily: 'Montserrat' }}
        >
          Featured Opportunities
        </h3>
        
        <div className="space-y-3">
          {loading ? (
            // Loading skeleton
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="p-3 border border-gray-100 rounded-lg animate-pulse">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : featuredOpportunities.length > 0 ? (
            // Real data
            featuredOpportunities.map((item, index) => (
              <div 
                key={index}
                className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  if (item.type === 'idea') {
                    navigate(`/dashboard/ideas/${item.id}`)
                  } else if (item.type === 'referral') {
                    navigate(`/dashboard/referral-jobs/${item.id}`)
                  } else if (item.type === 'business') {
                    navigate(`/dashboard/business/${item.id}`)
                  }
                }}
              >
                {item.type === 'idea' && (
                  <>
                    <div className="flex items-center space-x-2 mb-1">
                      <Lightbulb className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-900">{item.title}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      {item.author && <span>by {item.author}</span>}
                      {item.author && item.location && <span>•</span>}
                      {item.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {item.type === 'referral' && (
                  <>
                    <div className="flex items-center space-x-2 mb-1">
                      <Megaphone className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900">{item.title}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      {item.business && <span>{item.business}</span>}
                      {item.business && item.commission && <span>•</span>}
                      {item.commission && (
                        <span className="text-green-600 font-medium">
                          {item.commission_type === 'percentage' ? `${item.commission}%` : `$${item.commission}`}
                        </span>
                      )}
                      {(item.business || item.commission) && item.location && <span>•</span>}
                      {item.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {item.type === 'business' && (
                  <>
                    <div className="flex items-center space-x-2 mb-1">
                      <Building className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium text-gray-900">{item.title}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      {item.category && <span>{item.category}</span>}
                      {item.category && item.location && <span>•</span>}
                      {item.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            // No data
            <div className="text-center py-4 text-gray-500 text-sm">
              No opportunities available yet
            </div>
          )}
          
          <button
            onClick={() => navigate('/dashboard/ideas-vault')}
            className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View All Opportunities →
          </button>
        </div>
      </div>
      
      {/* Trending Topics */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 
          className="font-semibold text-gray-900 mb-3"
          style={{ fontFamily: 'Montserrat' }}
        >
          Trending Topics
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {trendingTopics.map((topic, index) => (
            <span 
              key={index}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm cursor-pointer"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
      
      {/* Upcoming Events */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 
            className="font-semibold text-gray-900"
            style={{ fontFamily: 'Montserrat' }}
          >
            Upcoming Events
          </h3>
          <button
            onClick={() => navigate('/dashboard/community?tab=events')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {upcomingEvents.map((event, index) => (
            <div 
              key={index}
              className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-900">{event.title}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{event.date}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CommunitySidebar