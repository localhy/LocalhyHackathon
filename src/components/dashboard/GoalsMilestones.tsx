import React, { useState, useEffect } from 'react'
import { Check, User, Lightbulb, Megaphone, Wrench } from 'lucide-react'

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

const GoalsMilestones: React.FC<GoalsMilestonesProps> = ({ user }) => {
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
      title: 'Refer a Business',
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
      action: 'tool-submission'
    }
  ])

  useEffect(() => {
    // In a real app, this would check user's actual progress
    // For now, we'll simulate checking if profile is complete
    const hasName = user?.user_metadata?.name
    const hasUserType = user?.user_metadata?.user_type
    
    if (hasName && hasUserType) {
      setMilestones(prev => 
        prev.map(milestone => 
          milestone.id === 'profile' 
            ? { ...milestone, completed: true }
            : milestone
        )
      )
    }
  }, [user])

  const completedCount = milestones.filter(m => m.completed).length
  const progressPercentage = (completedCount / milestones.length) * 100

  const handleMilestoneClick = (action: string) => {
    // This would navigate to the appropriate page/action
    console.log(`Navigate to: ${action}`)
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
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
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
                : 'border-gray-200 hover:bg-gray-50 cursor-pointer hover:border-green-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
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
                className={`font-medium ${
                  milestone.completed ? 'text-green-800' : 'text-gray-900'
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                {milestone.title}
              </h3>
              <p 
                className={`text-sm ${
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
    </div>
  )
}

export default GoalsMilestones