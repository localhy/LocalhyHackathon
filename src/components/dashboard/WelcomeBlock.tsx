import React, { useState, useEffect } from 'react'
import { TrendingUp, Eye, Target, Share2 } from 'lucide-react'
import { getUserCredits } from '../../lib/database'

interface WelcomeBlockProps {
  user: any
}

const WelcomeBlock: React.FC<WelcomeBlockProps> = ({ user }) => {
  const [stats, setStats] = useState({
    cashCredits: 0,
    freeCredits: 0,
    views: 0,
    referrals: 0,
    toolsShared: 0
  })

  const [isNewUser, setIsNewUser] = useState(true)

  // In a real app, this would fetch from your database
  useEffect(() => {
    // Check if user is new (created within last 24 hours) or has any activity
    const userCreatedAt = new Date(user?.created_at)
    const now = new Date()
    const hoursSinceCreation = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60)
    
    // Consider user "new" if account is less than 24 hours old AND has no activity
    const hasActivity = stats.views > 0 || stats.referrals > 0 || stats.toolsShared > 0
    setIsNewUser(hoursSinceCreation < 24 && !hasActivity)

    // Load user credits
    if (user) {
      loadUserCredits()
    }
  }, [user])

  const loadUserCredits = async () => {
    if (!user) return
    
    try {
      const credits = await getUserCredits(user.id)
      setStats(prev => ({
        ...prev,
        cashCredits: credits.cashCredits,
        freeCredits: credits.freeCredits
      }))
    } catch (error) {
      console.error('Error loading user credits:', error)
    }
  }

  const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'

  return (
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
              💰 {stats.cashCredits}
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
  )
}

export default WelcomeBlock