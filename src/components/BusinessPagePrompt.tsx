import React from 'react'
import { Building, ArrowRight, Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface BusinessPagePromptProps {
  user: any
  className?: string
}

const BusinessPagePrompt: React.FC<BusinessPagePromptProps> = ({ user, className = '' }) => {
  const navigate = useNavigate()
  const isBusinessOwner = user?.user_metadata?.user_type === 'business-owner'

  const handleCreateBusinessPage = () => {
    // For now, navigate to profile page as a placeholder
    // In the future, this would navigate to a business page creation flow
    navigate('/dashboard/profile')
  }

  return (
    <div className={`bg-gradient-to-r ${isBusinessOwner ? 'from-blue-50 to-blue-100' : 'from-gray-50 to-gray-100'} rounded-xl p-6 border ${isBusinessOwner ? 'border-blue-200' : 'border-gray-200'} ${className}`}>
      <div className="flex items-start space-x-4">
        <div className={`w-10 h-10 ${isBusinessOwner ? 'bg-blue-500' : 'bg-gray-500'} rounded-lg flex items-center justify-center flex-shrink-0`}>
          {isBusinessOwner ? <Building className="h-5 w-5 text-white" /> : <Briefcase className="h-5 w-5 text-white" />}
        </div>
        
        <div className="flex-1">
          <h3 
            className={`text-lg font-semibold ${isBusinessOwner ? 'text-blue-800' : 'text-gray-800'} mb-2`}
            style={{ fontFamily: 'Montserrat' }}
          >
            {isBusinessOwner 
              ? '🏢 Create Your Business Page' 
              : '🏢 Business Pages on Localhy'}
          </h3>
          <p 
            className={`${isBusinessOwner ? 'text-blue-700' : 'text-gray-700'} mb-4`}
            style={{ fontFamily: 'Inter' }}
          >
            {isBusinessOwner
              ? "As a business owner, you can create a dedicated page to showcase your business, manage referrals, and track performance all in one place."
              : "Discover local businesses or create a page for your own business to connect with the community and manage referrals."}
          </p>
          
          <button
            onClick={handleCreateBusinessPage}
            className={`inline-flex items-center ${
              isBusinessOwner 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            } px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105`}
            style={{ fontFamily: 'Inter' }}
          >
            {isBusinessOwner ? 'Create Business Page' : 'Learn More'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default BusinessPagePrompt