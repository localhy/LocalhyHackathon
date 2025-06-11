import React from 'react'
import { Lightbulb, ArrowRight } from 'lucide-react'

interface DailyTipProps {
  onNavigate: (page: string) => void
}

const DailyTip: React.FC<DailyTipProps> = ({ onNavigate }) => {
  const tips = [
    "Post a local business idea and earn $$$ every time it's read.",
    "Refer a local business and earn commission on every successful connection.",
    "Submit useful tools and templates to help your community grow.",
    "Complete your profile to increase trust and earn more referrals."
  ]

  const randomTip = tips[Math.floor(Math.random() * tips.length)]

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 sm:p-6 border border-yellow-200">
      <div className="flex items-start space-x-3 sm:space-x-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
          <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-800" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 
            className="text-base sm:text-lg font-semibold text-yellow-800 mb-2"
            style={{ fontFamily: 'Montserrat' }}
          >
            💡 Daily Tip
          </h3>
          <p 
            className="text-yellow-700 mb-3 sm:mb-4 text-sm sm:text-base"
            style={{ fontFamily: 'Inter' }}
          >
            {randomTip}
          </p>
          
          <button
            onClick={() => onNavigate('create-new')}
            className="inline-flex items-center bg-yellow-400 hover:bg-yellow-500 text-yellow-800 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm sm:text-base"
            style={{ fontFamily: 'Inter' }}
          >
            Start Posting
            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default DailyTip