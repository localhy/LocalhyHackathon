import React, { useState, useEffect } from 'react'
import { Check, User, Lightbulb, Megaphone, Wrench } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { 
  getUserIdeas, 
  getUserReferralJobs, 
  getUserTools,
  subscribeToUserProfile,
  type Idea,
  type ReferralJob,
  type Tool
} from '../../lib/database'
import { supabase } from '../../lib/supabase'

interface GoalsMilestonesProps {
  user: any
}

interface Milestone {
  id: string
  title: string
  description: string
  completed: boolean
  icon: React.ComponentType<any>
  action: string
}

interface UserActivity {
  ideas: Idea[]
  referralJobs: ReferralJob[]
  tools: Tool[]
}

const GoalsMilestones: React.FC<GoalsMilestonesProps> = ({ user }) => {
  const navigate = useNavigate()
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Add your bio, location, and profile picture',
      completed: false,
      icon: User,
      action: 'profile'
    },
    {
      id: 'first-idea',
      title: 'Post First Idea',
      description: 'Share your first local business idea',
      completed: false,
      icon: Lightbulb,
      action: 'create-new'
    },
    {
      id: 'first-referral',
      title: 'Create Referral Job',
      description: 'Create your first referral job posting',
      completed: false,
      icon: Megaphone,
      action: 'create-new'
    },
    {
      id: 'submit-tool',
      title: 'Submit a Tool',
      description: 'Share a useful template or resource',
      completed: false,
      icon: Wrench,
      action: 'create-new'
    }
  ])

  const [userActivity, setUserActivity] = useState<UserActivity>({
    ideas: [],
    referralJobs: [],
    tools: []
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserActivity()
      setupRealtimeSubscriptions()
    }
  }, [user])

  useEffect(() => {
    // Update milestones based on user activity and profile
    updateMilestoneCompletion()
  }, [user, userActivity])

  const loadUserActivity = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Fetch all user activity in parallel
      const [ideas, referralJobs, tools] = await Promise.all([
        getUserIdeas(user.id),
        getUserReferralJobs(user.id),
        getUserTools(user.id)
      ])

      setUserActivity({
        ideas,
        referralJobs,
        tools
      })
    } catch (error) {
      console.error('Error loading user activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscriptions = () => {
    if (!user) return

    // Subscribe to user profile changes
    const profileSubscription = subscribeToUserProfile(user.id, (payload) => {
      console.log('Profile updated:', payload)
      // Profile changes will trigger milestone recalculation via user prop changes
    })

    // Subscribe to ideas table changes for this user
    const ideasSubscription = supabase
      .channel('user-ideas')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ideas',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Ideas updated:', payload)
          if (payload.eventType === 'INSERT') {
            setUserActivity(prev => ({
              ...prev,
              ideas: [payload.new as Idea, ...prev.ideas]
            }))
          } else if (payload.eventType === 'DELETE') {
            setUserActivity(prev => ({
              ...prev,
              ideas: prev.ideas.filter(idea => idea.id !== payload.old.id)
            }))
          } else if (payload.eventType === 'UPDATE') {
            setUserActivity(prev => ({
              ...prev,
              ideas: prev.ideas.map(idea => 
                idea.id === payload.new.id ? payload.new as Idea : idea
              )
            }))
          }
        }
      )
      .subscribe()

    // Subscribe to referral_jobs table changes for this user
    const referralJobsSubscription = supabase
      .channel('user-referral-jobs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_jobs',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Referral jobs updated:', payload)
          if (payload.eventType === 'INSERT') {
            setUserActivity(prev => ({
              ...prev,
              referralJobs: [payload.new as ReferralJob, ...prev.referralJobs]
            }))
          } else if (payload.eventType === 'DELETE') {
            setUserActivity(prev => ({
              ...prev,
              referralJobs: prev.referralJobs.filter(job => job.id !== payload.old.id)
            }))
          } else if (payload.eventType === 'UPDATE') {
            setUserActivity(prev => ({
              ...prev,
              referralJobs: prev.referralJobs.map(job => 
                job.id === payload.new.id ? payload.new as ReferralJob : job
              )
            }))
          }
        }
      )
      .subscribe()

    // Subscribe to tools table changes for this user
    const toolsSubscription = supabase
      .channel('user-tools')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tools',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Tools updated:', payload)
          if (payload.eventType === 'INSERT') {
            setUserActivity(prev => ({
              ...prev,
              tools: [payload.new as Tool, ...prev.tools]
            }))
          } else if (payload.eventType === 'DELETE') {
            setUserActivity(prev => ({
              ...prev,
              tools: prev.tools.filter(tool => tool.id !== payload.old.id)
            }))
          } else if (payload.eventType === 'UPDATE') {
            setUserActivity(prev => ({
              ...prev,
              tools: prev.tools.map(tool => 
                tool.id === payload.new.id ? payload.new as Tool : tool
              )
            }))
          }
        }
      )
      .subscribe()

    // Cleanup subscriptions on unmount
    return () => {
      profileSubscription.unsubscribe()
      ideasSubscription.unsubscribe()
      referralJobsSubscription.unsubscribe()
      toolsSubscription.unsubscribe()
    }
  }

  const updateMilestoneCompletion = () => {
    setMilestones(prev => prev.map(milestone => {
      let completed = false

      switch (milestone.id) {
        case 'profile':
          // Check if profile is complete (has name, user_type, and optionally bio/location)
          const hasName = user?.user_metadata?.name
          const hasUserType = user?.user_metadata?.user_type
          completed = !!(hasName && hasUserType)
          break

        case 'first-idea':
          // Check if user has posted at least one idea
          completed = userActivity.ideas.length > 0
          break

        case 'first-referral':
          // Check if user has created at least one referral job
          completed = userActivity.referralJobs.length > 0
          break

        case 'submit-tool':
          // Check if user has submitted at least one tool
          completed = userActivity.tools.length > 0
          break

        default:
          completed = milestone.completed
      }

      return { ...milestone, completed }
    }))
  }

  const handleMilestoneClick = (action: string) => {
    switch (action) {
      case 'profile':
        navigate('/dashboard/profile')
        break
      case 'create-new':
        navigate('/dashboard/create-new')
        break
      default:
        console.log(`Navigate to: ${action}`)
    }
  }

  const completedCount = milestones.filter(m => m.completed).length
  const progressPercentage = (completedCount / milestones.length) * 100

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-2 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 
          className="text-xl font-bold text-gray-900"
          style={{ fontFamily: 'Montserrat' }}
        >
          Goals & Milestones
        </h2>
        <span 
          className="text-sm text-gray-500"
          style={{ fontFamily: 'Inter' }}
        >
          {completedCount}/{milestones.length} completed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        {progressPercentage === 100 && (
          <p className="text-green-600 text-sm font-medium mt-2 text-center">
            🎉 Congratulations! You've completed all milestones!
          </p>
        )}
      </div>

      {/* Milestones */}
      <div className="space-y-3">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            onClick={() => !milestone.completed && handleMilestoneClick(milestone.action)}
            className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-200 ${
              milestone.completed
                ? 'bg-green-50 border-green-200'
                : 'border-gray-200 hover:bg-gray-50 cursor-pointer hover:border-green-300 hover:shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
              milestone.completed
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {milestone.completed ? (
                <Check className="h-5 w-5" />
              ) : (
                <milestone.icon className="h-5 w-5" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 
                className={`font-medium transition-colors ${
                  milestone.completed ? 'text-green-800' : 'text-gray-900'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                {milestone.title}
              </h3>
              <p 
                className={`text-sm transition-colors ${
                  milestone.completed ? 'text-green-600' : 'text-gray-500'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                {milestone.description}
              </p>
            </div>

            {milestone.completed && (
              <div className="text-green-500">
                <Check className="h-5 w-5" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Activity Summary */}
      {completedCount > 1 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3" style={{ fontFamily: 'Inter' }}>
            Your Activity
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">{userActivity.ideas.length}</div>
              <div className="text-xs text-gray-500">Ideas</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{userActivity.referralJobs.length}</div>
              <div className="text-xs text-gray-500">Referral Jobs</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">{userActivity.tools.length}</div>
              <div className="text-xs text-gray-500">Tools</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GoalsMilestones