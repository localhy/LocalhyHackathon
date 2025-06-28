import React, { useState, useEffect } from 'react'
import { Building, Megaphone, Lightbulb, Wrench, ArrowRight, MapPin, ExternalLink, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  getIdeas, 
  getReferralJobs, 
  getBusinessProfileById,
  userHasBusinessProfile,
  type Idea,
  type ReferralJob,
  type BusinessProfile
} from '../../lib/database'

const CommunitySidebar: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [featuredItems, setFeaturedItems] = useState<(Idea | ReferralJob)[]>([])
  const [loading, setLoading] = useState(true)
  const [hasBusinessProfile, setHasBusinessProfile] = useState(false)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  
  useEffect(() => {
    loadFeaturedContent()
    
    if (user) {
      checkBusinessProfile()
    }
  }, [user])
  
  const loadFeaturedContent = async () => {
    try {
      setLoading(true)
      
      // Get promoted content
      const [ideas, jobs] = await Promise.all([
        getIdeas(3, 0),
        getReferralJobs(3, 0)
      ])
      
      // Filter for promoted content first
      const promotedIdeas = ideas.filter(idea => idea.is_promoted)
      const promotedJobs = jobs.filter(job => job.is_promoted)
      
      // Combine and sort by creation date
      const allPromoted = [...promotedIdeas, ...promotedJobs]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      // If we don't have enough promoted content, add regular content
      let featured = allPromoted
      
      if (featured.length < 3) {
        const regularContent = [...ideas.filter(idea => !idea.is_promoted), ...jobs.filter(job => !job.is_promoted)]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3 - featured.length)
        
        featured = [...featured, ...regularContent]
      }
      
      setFeaturedItems(featured.slice(0, 3))
    } catch (error) {
      console.error('Error loading featured content:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const checkBusinessProfile = async () => {
    if (!user) return
    
    try {
      const hasProfile = await userHasBusinessProfile(user.id)
      setHasBusinessProfile(hasProfile)
      
      if (hasProfile) {
        // Get the first business profile
        const { data } = await supabase
          .from('business_profiles')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .single()
        
        if (data) {
          const profile = await getBusinessProfileById(data.id)
          setBusinessProfile(profile)
        }
      }
    } catch (error) {
      console.error('Error checking business profile:', error)
    }
  }
  
  const handleCreateBusinessPage = () => {
    navigate('/dashboard/create-business-page')
  }
  
  const handleViewBusinessPage = () => {
    if (businessProfile) {
      navigate(`/dashboard/business/${businessProfile.id}`)
    }
  }
  
  const handleViewItem = (item: Idea | ReferralJob) => {
    if ('title' in item && 'description' in item && 'category' in item && 'price' in item) {
      // It's an idea
      navigate(`/dashboard/ideas/${item.id}`)
    } else {
      // It's a referral job
      navigate(`/dashboard/referral-jobs/${item.id}`)
    }
  }
  
  const isIdea = (item: Idea | ReferralJob): item is Idea => {
    return 'price' in item
  }
  
  return (
    <div className="space-y-6">
      {/* Localhy Updates */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <h3 
          className="text-lg font-semibold text-blue-800 mb-3"
          style={{ fontFamily: 'Montserrat' }}
        >
          Localhy Updates
        </h3>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">New</span>
            <p className="text-sm text-gray-700 mt-1">
              Community feed is now available! Share updates with your local community.
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Coming Soon</span>
            <p className="text-sm text-gray-700 mt-1">
              Local marketplace and community groups are coming soon!
            </p>
          </div>
        </div>
      </div>
      
      {/* Your Next Step */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 
          className="text-lg font-semibold text-gray-900 mb-3"
          style={{ fontFamily: 'Montserrat' }}
        >
          Your Next Step
        </h3>
        
        {user?.user_metadata?.user_type === 'business-owner' && !hasBusinessProfile ? (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-2">Create Your Business Page</h4>
            <p className="text-sm text-blue-700 mb-3">
              As a business owner, you can create a dedicated page to showcase your business and manage referrals.
            </p>
            <button
              onClick={handleCreateBusinessPage}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center"
            >
              Create Business Page
              <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        ) : hasBusinessProfile && businessProfile ? (
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <h4 className="font-medium text-green-800 mb-2">Your Business Page</h4>
            <div className="flex items-center space-x-3 mb-3">
              {businessProfile.thumbnail_url ? (
                <img
                  src={businessProfile.thumbnail_url}
                  alt={businessProfile.business_name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <p className="font-medium text-green-800">{businessProfile.business_name}</p>
                <p className="text-xs text-green-700">{businessProfile.category}</p>
              </div>
            </div>
            <button
              onClick={handleViewBusinessPage}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center"
            >
              View Business Page
              <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard/create-new?tab=idea')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg text-sm font-medium flex items-center"
            >
              <Lightbulb className="h-4 w-4 text-green-500 mr-2" />
              <span>Post a Business Idea</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/create-new?tab=referral')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg text-sm font-medium flex items-center"
            >
              <Megaphone className="h-4 w-4 text-blue-500 mr-2" />
              <span>Create a Referral Job</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/create-new?tab=tool')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg text-sm font-medium flex items-center"
            >
              <Wrench className="h-4 w-4 text-purple-500 mr-2" />
              <span>Submit a Tool</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Featured Local Opportunities */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 
          className="text-lg font-semibold text-gray-900 mb-3"
          style={{ fontFamily: 'Montserrat' }}
        >
          Featured Opportunities
        </h3>
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : featuredItems.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-2">
            No featured content available
          </p>
        ) : (
          <div className="space-y-3">
            {featuredItems.map((item) => (
              <div 
                key={`${isIdea(item) ? 'idea' : 'job'}-${item.id}`}
                className="bg-gray-50 rounded-lg p-3 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleViewItem(item)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    isIdea(item) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isIdea(item) ? 'Idea' : 'Referral Job'}
                  </span>
                  {item.is_promoted && (
                    <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                  {isIdea(item) ? item.title : item.title}
                </h4>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <div className="flex items-center mr-2">
                    {item.user_profiles?.avatar_url ? (
                      <img
                        src={item.user_profiles.avatar_url}
                        alt={item.user_profiles.name}
                        className="w-4 h-4 rounded-full mr-1"
                      />
                    ) : (
                      <User className="w-3 h-3 mr-1" />
                    )}
                    <span>{item.user_profiles?.name}</span>
                  </div>
                  {item.location && (
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <div className="text-center pt-2">
              <button
                onClick={() => navigate('/dashboard/ideas-vault')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View More →
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Trending Topics */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 
          className="text-lg font-semibold text-gray-900 mb-3"
          style={{ fontFamily: 'Montserrat' }}
        >
          Trending Topics
        </h3>
        
        <div className="flex flex-wrap gap-2">
          <span className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors">
            #LocalBusiness
          </span>
          <span className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors">
            #SmallBusiness
          </span>
          <span className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors">
            #Entrepreneurship
          </span>
          <span className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors">
            #LocalMarketing
          </span>
          <span className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors">
            #CommunitySupport
          </span>
        </div>
      </div>
    </div>
  )
}

export default CommunitySidebar