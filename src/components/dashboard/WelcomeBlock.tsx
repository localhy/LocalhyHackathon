import React, { useState, useEffect } from 'react'
import { TrendingUp, Eye, Target, Share2 } from 'lucide-react'
import { 
  getUserCredits, 
  getUserIdeas, 
  getUserReferralJobs, 
  getUserTools,
  type Idea,
  type ReferralJob,
  type Tool
} from '../../lib/database'
import BusinessPagePrompt from '../BusinessPagePrompt'

interface WelcomeBlockProps {
  user: any
}

const WelcomeBlock: React.FC<WelcomeBlockProps> = ({ user }) => {
  const [stats, setStats] = useState({
    cashCredits: 0,
    purchasedCredits: 0,
    freeCredits: 0,
    views: 0,
    referrals: 0,
    toolsShared: 0
  })

  const [isNewUser, setIsNewUser] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is new (created within last 24 hours) or has any activity
    if (user) {
      const userCreatedAt = new Date(user?.created_at)
      const now = new Date()
      const hoursSinceCreation = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60)
      
      // Load user data
      loadUserData()
      
      // Consider user "new" if account is less than 24 hours old
      setIsNewUser(hoursSinceCreation < 24)
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Fetch all user data in parallel
      const [credits, ideas, referralJobs, tools] = await Promise.all([
        getUserCredits(user.id),
        getUserIdeas(user.id),
        getUserReferralJobs(user.id),
        getUserTools(user.id)
      ])
      
      // Calculate total views from ideas
      const totalViews = ideas.reduce((sum, idea) => sum + (idea.views || 0), 0)
      
      // Calculate total referrals (applicants) from referral jobs
      const totalReferrals = referralJobs.reduce((sum, job) => sum + (job.applicants_count || 0), 0)
      
      // Update stats with real data
      setStats({
        cashCredits: credits.cashCredits,
        purchasedCredits: credits.purchasedCredits,
        freeCredits: credits.freeCredits,
        views: totalViews,
        referrals: totalReferrals,
        toolsShared: tools.length
      })
      
      // Update new user status based on activity
      const hasActivity = totalViews > 0 || totalReferrals > 0 || tools.length > 0
      if (hasActivity) {
        setIsNewUser(false)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 
              className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: 'Montserrat' }}
            >
              {isNewUser ? `Welcome, ${firstName}! 👋` : `Welcome back, ${firstName} 👋`}
            </h1>
            <p 
              className="text-gray-600"
              style={{ fontFamily: 'Inter' }}
            >
              {isNewUser 
                ? "Let's get you started with your local business journey"
                : "Here's your real-time earnings summary"
              }
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600" style={{ fontFamily: 'Inter' }}>
                  Credits
                </span>
              </div>
              <p className="text-xl font-bold text-green-600" style={{ fontFamily: 'Montserrat' }}>
                💰 {stats.cashCredits + stats.purchasedCredits}
                {stats.freeCredits > 0 && (
                  <span className="text-xs ml-1 text-purple-600">+{stats.freeCredits} free</span>
                )}
              </p>
            </div>

            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Eye className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm font-medium text-blue-600" style={{ fontFamily: 'Inter' }}>
                  Views
                </span>
              </div>
              <p className="text-xl font-bold text-blue-600" style={{ fontFamily: 'Montserrat' }}>
                📈 {stats.views}
              </p>
            </div>

            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-sm font-medium text-purple-600" style={{ fontFamily: 'Inter' }}>
                  Referrals
                </span>
              </div>
              <p className="text-xl font-bold text-purple-600" style={{ fontFamily: 'Montserrat' }}>
                🎯 {stats.referrals}
              </p>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Share2 className="h-4 w-4 text-yellow-600 mr-1" />
                <span className="text-sm font-medium text-yellow-600" style={{ fontFamily: 'Inter' }}>
                  Tools
                </span>
              </div>
              <p className="text-xl font-bold text-yellow-600" style={{ fontFamily: 'Montserrat' }}>
                🛠️ {stats.toolsShared}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Page Prompt */}
      <BusinessPagePrompt user={user} />
    </div>
  )
}

export default WelcomeBlock