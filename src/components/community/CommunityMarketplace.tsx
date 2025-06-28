import React from 'react'
import { ShoppingBag, Plus, Search } from 'lucide-react'

const CommunityMarketplace = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-yellow-500" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Community Marketplace Coming Soon
          </h3>
          
          <p className="text-gray-600 mb-6">
            Soon you'll be able to buy, sell, and trade items with your neighbors.
            A local marketplace for your community is on its way!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>List an Item</span>
            </button>
            
            <button
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-gray-50"
            >
              <Search className="h-4 w-4" />
              <span>Browse Items</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunityMarketplace