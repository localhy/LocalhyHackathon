import React from 'react'
import { Users, Plus, Search } from 'lucide-react'

const CommunityGroups = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Community Groups Coming Soon
          </h3>
          
          <p className="text-gray-600 mb-6">
            Soon you'll be able to create and join groups based on your interests, location, and more.
            Connect with neighbors who share your passions!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create a Group</span>
            </button>
            
            <button
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-gray-50"
            >
              <Search className="h-4 w-4" />
              <span>Find Groups</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunityGroups