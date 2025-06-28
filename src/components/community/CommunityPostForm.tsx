import React, { useState, useRef } from 'react'
import { Image, MapPin, X, Loader, Camera, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { createCommunityPost, uploadFile } from '../../lib/database'

interface CommunityPostFormProps {
  onPostCreated: () => void
}

const CommunityPostForm: React.FC<CommunityPostFormProps> = ({ onPostCreated }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [location, setLocation] = useState('')
  const [showLocationInput, setShowLocationInput] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !content.trim()) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const postData = {
        user_id: user.id,
        content: content.trim(),
        image_url: imageUrl || undefined,
        location: location.trim() || undefined
      }
      
      const newPost = await createCommunityPost(postData)
      
      if (newPost) {
        // Reset form
        setContent('')
        setLocation('')
        setShowLocationInput(false)
        setImageUrl(null)
        
        // Notify parent component
        onPostCreated()
      } else {
        throw new Error('Failed to create post')
      }
    } catch (error: any) {
      console.error('Error creating post:', error)
      setError(error.message || 'Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setUploadingImage(true)
    setError('')
    
    try {
      const imageUrl = await uploadFile(file, 'community-posts')
      if (imageUrl) {
        setImageUrl(imageUrl)
      } else {
        throw new Error('Failed to upload image')
      }
    } catch (error: any) {
      console.error('Error uploading image:', error)
      setError(error.message || 'Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    setImageUrl(null)
  }

  const handleToggleLocation = () => {
    setShowLocationInput(!showLocationInput)
    if (!showLocationInput) {
      setLocation('')
    }
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
      <form onSubmit={handleSubmit}>
        {/* User avatar and textarea */}
        <div className="flex space-x-3">
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Your avatar"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium">
                {user?.user_metadata?.name?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
          )}
          
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening in your neighborhood?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              style={{ fontFamily: 'Inter' }}
              disabled={isSubmitting}
            />
            
            {/* Location input (conditionally shown) */}
            {showLocationInput && (
              <div className="mt-2 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add your location"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ fontFamily: 'Inter' }}
                  disabled={isSubmitting}
                />
              </div>
            )}
            
            {/* Image preview */}
            {imageUrl && (
              <div className="mt-3 relative">
                <img
                  src={imageUrl}
                  alt="Post image"
                  className="max-h-64 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black/90"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="mt-2 text-red-600 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isSubmitting || uploadingImage}
            >
              {uploadingImage ? (
                <Loader className="h-5 w-5 animate-spin text-blue-500" />
              ) : (
                <Image className="h-5 w-5" />
              )}
              <span className="text-sm">Photo</span>
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
              disabled={isSubmitting}
            />
            
            <button
              type="button"
              onClick={handleToggleLocation}
              className={`flex items-center space-x-1 p-2 rounded-lg transition-colors ${
                showLocationInput 
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              }`}
              disabled={isSubmitting}
            >
              <MapPin className="h-5 w-5" />
              <span className="text-sm">Location</span>
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <span>Post</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CommunityPostForm