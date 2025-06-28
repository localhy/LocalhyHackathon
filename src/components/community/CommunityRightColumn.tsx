import React, { useState, useEffect } from 'react'
import { 
  Lightbulb, 
  Megaphone, 
  Wrench, 
  Building, 
  MapPin, 
  DollarSign, 
  Star, 
  Download, 
  Crown, 
  ArrowRight, 
  UserPlus, 
  Users 
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { 
  getIdeas, 
  getReferralJobs, 
  getTools, 
  getActivePromotionForContent,
  incrementPromotionClicks,
  type Idea,
  type ReferralJob,
  type Tool
} from '../../lib/database'

interface CommunityRightColumnProps {
  userId?: string
}

const CommunityRightColumn: React.FC<CommunityRightColumnProps> = ({ userId }) => {
  const navigate = useNavigate()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [referralJobs, setReferralJobs] = useState<ReferralJob[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [promotedContent, setPromotedContent] = useState<(Idea | ReferralJob | Tool)[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [userId])

  const loadContent = async () => {
    try {
      setLoading(true)
      
      // Fetch data in parallel
      const [fetchedIdeas, fetchedJobs, fetchedTools] = await Promise.all([
        getIdeas(3, 0, userId),
        getReferralJobs(3, 0, userId),
        getTools(3, 0)
      ])
      
      // Get promoted content
      const promotedItems = [
        ...fetchedIdeas.filter(idea => idea.is_promoted),
        ...fetchedJobs.filter(job => job.is_promoted),
        ...fetchedTools.filter(tool => tool.is_promoted)
      ]
      
      // If we don't have enough promoted items, add some regular items
      if (promotedItems.length < 2) {
        const regularItems = [
          ...fetchedIdeas.filter(idea => !idea.is_promoted),
          ...fetchedJobs.filter(job => !job.is_promoted),
          ...fetchedTools.filter(tool => !tool.is_promoted)
        ]
        
        // Shuffle and take enough to have 2 total items
        const shuffled = regularItems.sort(() => 0.5 - Math.random())
        const additional = shuffled.slice(0, 2 - promotedItems.length)
        
        setPromotedContent([...promotedItems, ...additional])
      } else {
        // If we have enough promoted items, just use those (max 2)
        setPromotedContent(promotedItems.slice(0, 2))
      }
      
      setIdeas(fetchedIdeas)
      setReferralJobs(fetchedJobs)
      setTools(fetchedTools)
    } catch (error) {
      console.error('Error loading content for right column:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePromotedItemClick = async (item: any, type: 'idea' | 'referral_job' | 'tool') => {
    if (item.is_promoted) {
      try {
        const promotion = await getActivePromotionForContent(item.id, type)
        if (promotion) {
          await incrementPromotionClicks(promotion.id)
        }
      } catch (error) {
        console.error('Error tracking promotion click:', error)
      }
    }
    
    // Navigate to the appropriate page
    if (type === 'idea') {
      navigate(`/dashboard/ideas/${item.id}`)
    } else if (type === 'referral_job') {
      navigate(`/dashboard/referral-jobs/${item.id}`)
    } else if (type === 'tool') {
      if (item.download_url) {
        window.open(item.download_url, '_blank')
      }
    }
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

  return (
    <div className="space-y-6">
      {/* Invite Neighbors */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Invite nearby neighbors
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Your invitation will include your first name, your neighborhood, and helpful information about Localhy.
        </p>
        
        <div className="space-y-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Neighbor {i}</span>
              </div>
              <div className="w-5 h-5 border border-green-500 rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => navigate('/dashboard/community?tab=invite')}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Send 3 invitations</span>
        </button>
      </div>
      
      {/* Business Pages */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Own a local business?
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Create a business page to connect with neighbors, post updates in the feed, and gain new customers.
        </p>
        
        <button 
          onClick={() => navigate('/dashboard/create-business-page')}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium"
        >
          Create page
        </button>
      </div>
      
      {/* Promoted Content */}
      {promotedContent.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Featured
          </h3>
          
          <div className="space-y-4">
            {promotedContent.map((item: any) => {
              // Determine item type
              const isIdea = 'problem_summary' in item || 'solution_overview' in item
              const isReferralJob = 'business_name' in item && 'commission' in item
              const isTool = 'download_url' in item || 'downloads_count' in item
              
              const type = isIdea ? 'idea' : isReferralJob ? 'referral_job' : 'tool'
              
              return (
                <div 
                  key={`${type}-${item.id}`}
                  className="border border-yellow-200 bg-yellow-50 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handlePromotedItemClick(item, type)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex-shrink-0">
                      {isIdea && item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : isReferralJob && item.logo_url ? (
                        <img src={item.logo_url} alt={item.business_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {isIdea ? (
                            <Lightbulb className="h-5 w-5 text-green-500" />
                          ) : isReferralJob ? (
                            <Megaphone className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Wrench className="h-5 w-5 text-purple-500" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="text-xs px-1.5 py-0.5 bg-yellow-200 text-yellow-800 rounded-full font-medium flex items-center">
                          <Crown className="h-3 w-3 mr-0.5" />
                          Sponsored
                        </span>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {isIdea ? item.title : isReferralJob ? item.business_name : item.title}
                      </h4>
                      
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        {item.location && (
                          <div className="flex items-center mr-2">
                            <MapPin className="h-3 w-3 mr-0.5" />
                            <span className="truncate">{item.location}</span>
                          </div>
                        )}
                        
                        {isReferralJob && (
                          <div className="flex items-center text-blue-600 font-medium">
                            <DollarSign className="h-3 w-3" />
                            <span>
                              {item.commission_type === 'percentage' ? `${item.commission}%` : `$${item.commission}`}
                            </span>
                          </div>
                        )}
                        
                        {isTool && item.price > 0 && (
                          <div className="flex items-center text-green-600 font-medium">
                            <DollarSign className="h-3 w-3" />
                            <span>${item.price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Ideas Vault Highlights */}
      {ideas.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Ideas Vault
            </h3>
            <button 
              onClick={() => navigate('/dashboard/ideas-vault')}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              View all
            </button>
          </div>
          
          <div className="space-y-3">
            {ideas.slice(0, 3).map((idea) => (
              <div 
                key={idea.id}
                className="border border-gray-100 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => navigate(`/dashboard/ideas/${idea.id}`)}
              >
                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                  {idea.title}
                </h4>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Lightbulb className="h-3 w-3 text-green-500 mr-1" />
                  <span>{idea.category}</span>
                  {idea.location && (
                    <>
                      <span className="mx-1">•</span>
                      <MapPin className="h-3 w-3 mr-0.5" />
                      <span>{idea.location}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Referral Jobs Highlights */}
      {referralJobs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Referral Jobs
            </h3>
            <button 
              onClick={() => navigate('/dashboard/referral-jobs')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all
            </button>
          </div>
          
          <div className="space-y-3">
            {referralJobs.slice(0, 3).map((job) => (
              <div 
                key={job.id}
                className="border border-gray-100 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => navigate(`/dashboard/referral-jobs/${job.id}`)}
              >
                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                  {job.business_name}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                  {job.title}
                </p>
                <div className="flex items-center justify-between text-xs mt-1">
                  <div className="flex items-center text-gray-500">
                    <Megaphone className="h-3 w-3 text-blue-500 mr-1" />
                    <span>{job.category}</span>
                  </div>
                  <div className="text-blue-600 font-medium">
                    {job.commission_type === 'percentage' ? `${job.commission}%` : `$${job.commission}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Starter Tools Highlights */}
      {tools.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Starter Tools
            </h3>
            <button 
              onClick={() => navigate('/dashboard/starter-tools')}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View all
            </button>
          </div>
          
          <div className="space-y-3">
            {tools.slice(0, 3).map((tool) => (
              <div 
                key={tool.id}
                className="border border-gray-100 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => navigate('/dashboard/starter-tools')}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                    {tool.title}
                  </h4>
                  {tool.price > 0 ? (
                    <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                      ${tool.price}
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded">
                      Free
                    </span>
                  )}
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Wrench className="h-3 w-3 text-purple-500 mr-1" />
                  <span>{tool.category}</span>
                  <span className="mx-1">•</span>
                  <div className="flex items-center">
                    <Download className="h-3 w-3 mr-0.5" />
                    <span>{tool.downloads_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CommunityRightColumn