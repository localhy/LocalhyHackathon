import React from 'react'
import { Lightbulb, Megaphone, Wrench, ArrowRight } from 'lucide-react'

interface MainActionsProps {
  onNavigate: (page: string) => void
}

const MainActions: React.FC<MainActionsProps> = ({ onNavigate }) => {
  const actions = [
    {
      id: 'ideas-vault',
      icon: Lightbulb,
      title: 'Ideas Vault',
      description: 'Discover and post local business ideas. Earn when people read your posts.',
      primaryAction: 'Explore Ideas',
      secondaryAction: 'Post an Idea',
      primaryPage: 'ideas-vault',
      secondaryPage: '/dashboard/create-new?tab=idea',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500',
      buttonColor: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'referral-jobs',
      icon: Megaphone,
      title: 'Referral Jobs',
      description: 'Refer businesses and earn commissions. Post or promote referral opportunities.',
      primaryAction: 'Find Referral Jobs',
      secondaryAction: 'Create Referral Job',
      primaryPage: 'referral-jobs',
      secondaryPage: '/dashboard/create-new?tab=referral',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
      buttonColor: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'starter-tools',
      icon: Wrench,
      title: 'Starter Tools',
      description: 'Browse and submit useful templates, services, or affiliate tools.',
      primaryAction: 'Explore Tools',
      secondaryAction: 'Submit a Tool',
      primaryPage: 'starter-tools',
      secondaryPage: '/dashboard/create-new?tab=tool',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-500',
      buttonColor: 'bg-purple-500 hover:bg-purple-600'
    }
  ]

  const handleActionClick = (page: string) => {
    if (page.startsWith('/dashboard/create-new?tab=')) {
      // Navigate directly to the URL with query parameter
      window.location.href = page
    } else {
      onNavigate(page)
    }
  }

  return (
    <div className="space-y-4">
      <h2 
        className="text-xl font-bold text-gray-900"
        style={{ fontFamily: 'Montserrat' }}
      >
        Get Started or Keep Earning
      </h2>

      <div className="grid lg:grid-cols-3 gap-6 overflow-x-auto lg:overflow-visible">
        <div className="flex lg:contents space-x-6 lg:space-x-0">
          {actions.map((action) => (
            <div
              key={action.id}
              className={`${action.bgColor} rounded-xl p-6 min-w-[280px] lg:min-w-0 flex-shrink-0 border border-gray-200 hover:shadow-lg transition-all duration-200`}
            >
              <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                <action.icon className={`h-6 w-6 ${action.iconColor}`} />
              </div>
              
              <h3 
                className="text-lg font-semibold text-gray-900 mb-2"
                style={{ fontFamily: 'Montserrat' }}
              >
                {action.title}
              </h3>
              
              <p 
                className="text-gray-600 mb-4 text-sm"
                style={{ fontFamily: 'Inter' }}
              >
                {action.description}
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => handleActionClick(action.primaryPage)}
                  className={`w-full ${action.buttonColor} text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center`}
                  style={{ fontFamily: 'Inter' }}
                >
                  {action.primaryAction}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                
                <button
                  onClick={() => handleActionClick(action.secondaryPage)}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:bg-gray-50"
                  style={{ fontFamily: 'Inter' }}
                >
                  {action.secondaryAction}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MainActions