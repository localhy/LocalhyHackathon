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
    <div className="space-y-3 sm:space-y-4">
      <h2 
        className="text-lg sm:text-xl font-bold text-gray-900"
        style={{ fontFamily: 'Montserrat' }}
      >
        Get Started or Keep Earning
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto lg:overflow-visible">
        <div className="flex lg:contents space-x-4 sm:space-x-6 lg:space-x-0">
          {actions.map((action) => (
            <div
              key={action.id}
              className={`${action.bgColor} rounded-xl p-4 sm:p-6 min-w-[280px] lg:min-w-0 flex-shrink-0 border border-gray-200 hover:shadow-lg transition-all duration-200`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${action.bgColor} rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
                <action.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${action.iconColor}`} />
              </div>
              
              <h3 
                className="text-base sm:text-lg font-semibold text-gray-900 mb-2"
                style={{ fontFamily: 'Montserrat' }}
              >
                {action.title}
              </h3>
              
              <p 
                className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm"
                style={{ fontFamily: 'Inter' }}
              >
                {action.description}
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => handleActionClick(action.primaryPage)}
                  className={`w-full ${action.buttonColor} text-white py-2 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center text-sm sm:text-base`}
                  style={{ fontFamily: 'Inter' }}
                >
                  {action.primaryAction}
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                
                <button
                  onClick={() => handleActionClick(action.secondaryPage)}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 hover:bg-gray-50 text-sm sm:text-base"
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