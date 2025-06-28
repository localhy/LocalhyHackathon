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
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      const url = await uploadFile(file, 'community-post-images')
      if (url) {
        setImageUrl(url)
      } else {
        throw new Error('Failed to upload image')
      }
    } catch (error: any) {
      console.error('Error uploading image:', error)
      setError(error.message || 'Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
      // Reset the input
      if (event.target) event.target.value = ''
    }
  }

  const handleRemoveImage = () => {
    setImageUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !content.trim()) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const postData = {
        user_id: user.id,
        content: content.trim(),
        location: location.trim() || undefined,
        image_url: imageUrl || undefined
      }
      
      const newPost = await createCommunityPost(postData)
      
      if (newPost) {
        // Reset form
        setContent('')
        setLocation('')
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

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
      <form onSubmit={handleSubmit}>
        {/* Error message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {/* Text input */}
        <div className="mb-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening in your neighborhood?"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            style={{ fontFamily: 'Inter' }}
            disabled={isSubmitting}
          />
        </div>
        
        {/* Image preview */}
        {imageUrl && (
          <div className="mb-3 relative">
            <div className="relative rounded-lg overflow-hidden max-h-64">
              <img 
                src={imageUrl} 
                alt="Post preview" 
                className="w-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black/90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Location input */}
        <div className="mb-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location (optional)"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ fontFamily: 'Inter' }}
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isSubmitting}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 disabled:text-gray-400"
            >
              {isUploading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Image className="h-4 w-4" />
                  <span>Add Image</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading || isSubmitting}
            />
          </div>
          
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium flex items-center space-x-2"
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