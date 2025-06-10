import React, { useState, useEffect } from 'react'
import { User, Mail, MapPin, Calendar, Edit, Camera, Save, Loader, AlertCircle, Phone, ExternalLink, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getUserProfile, updateUserProfile, uploadAvatar } from '../lib/database'

const Profile = () => {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    userType: '',
    bio: '',
    location: '',
    joinedDate: '',
    newsletterOptIn: false,
    avatarUrl: '',
    // New social media fields
    phone: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    website: ''
  })

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      try {
        // Try to get profile from database first
        const dbProfile = await getUserProfile(user.id)
        
        if (dbProfile) {
          // Use database profile data
          setProfileData({
            name: dbProfile.name || '',
            email: user.email || '',
            userType: dbProfile.user_type || '',
            bio: dbProfile.bio || '',
            location: dbProfile.location || '',
            joinedDate: new Date(dbProfile.created_at).toLocaleDateString(),
            newsletterOptIn: dbProfile.newsletter_opt_in || false,
            avatarUrl: dbProfile.avatar_url || '',
            // Social media fields - these would come from extended profile
            phone: '',
            linkedin: '',
            twitter: '',
            facebook: '',
            instagram: '',
            website: ''
          })
        } else {
          // Fallback to user metadata if no database profile
          setProfileData({
            name: user.user_metadata?.name || '',
            email: user.email || '',
            userType: user.user_metadata?.user_type || '',
            bio: user.user_metadata?.bio || '',
            location: user.user_metadata?.location || '',
            joinedDate: new Date(user.created_at).toLocaleDateString(),
            newsletterOptIn: user.user_metadata?.newsletter_opt_in || false,
            avatarUrl: user.user_metadata?.avatar_url || '',
            phone: '',
            linkedin: '',
            twitter: '',
            facebook: '',
            instagram: '',
            website: ''
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        setError('Failed to load profile data')
        // Fallback to user metadata on error
        setProfileData({
          name: user.user_metadata?.name || '',
          email: user.email || '',
          userType: user.user_metadata?.user_type || '',
          bio: user.user_metadata?.bio || '',
          location: user.user_metadata?.location || '',
          joinedDate: new Date(user.created_at).toLocaleDateString(),
          newsletterOptIn: user.user_metadata?.newsletter_opt_in || false,
          avatarUrl: user.user_metadata?.avatar_url || '',
          phone: '',
          linkedin: '',
          twitter: '',
          facebook: '',
          instagram: '',
          website: ''
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleNavigation = (page: string) => {
    setSidebarOpen(false)
    
    switch(page) {
      case 'dashboard':
        navigate('/dashboard')
        break
      case 'ideas-vault':
        navigate('/dashboard/ideas-vault')
        break
      case 'referral-jobs':
        navigate('/dashboard/referral-jobs')
        break
      case 'starter-tools':
        navigate('/dashboard/starter-tools')
        break
      case 'create-new':
        navigate('/dashboard/create-new')
        break
      case 'tool-submission':
        navigate('/dashboard/tool-submission')
        break
      case 'my-posts':
        navigate('/dashboard/my-posts')
        break
      case 'vault-stats':
        navigate('/dashboard/vault-stats')
        break
      case 'wallet':
        navigate('/dashboard/wallet')
        break
      case 'profile':
        // Stay on current page
        break
      case 'settings':
        navigate('/dashboard/settings')
        break
      default:
        break
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      // Update profile in database
      const updatedProfile = await updateUserProfile(user.id, {
        name: profileData.name,
        bio: profileData.bio,
        location: profileData.location,
        user_type: profileData.userType as any,
        newsletter_opt_in: profileData.newsletterOptIn,
        avatar_url: profileData.avatarUrl
      })

      if (updatedProfile) {
        setIsEditing(false)
        setSuccess('Profile updated successfully!')
        
        // Refresh user data to sync everywhere
        await refreshUser()
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setError('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    setError('')
    setSuccess('')
    
    try {
      // Upload to Supabase Storage
      const avatarUrl = await uploadAvatar(user.id, file)
      
      if (avatarUrl) {
        // Update local state immediately for preview
        setProfileData(prev => ({ ...prev, avatarUrl }))
        
        // Auto-save the avatar URL to database
        const updatedProfile = await updateUserProfile(user.id, {
          avatar_url: avatarUrl
        })

        if (updatedProfile) {
          setSuccess('Avatar uploaded successfully!')
          
          // Refresh user data to sync everywhere
          await refreshUser()
          
          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(''), 3000)
        }
      } else {
        throw new Error('Failed to upload avatar')
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      setError(error.message || 'Failed to upload avatar. Please try again.')
    } finally {
      setUploading(false)
      // Reset the input
      event.target.value = ''
    }
  }

  const getUserTypeDisplay = (type: string) => {
    const types = {
      'business-owner': 'Business Owner',
      'referrer': 'Referrer',
      'idea-creator': 'Idea Creator',
      'other': 'Other'
    }
    return types[type as keyof typeof types] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentPage="profile"
          onNavigate={handleNavigation}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col">
          <TopBar 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            user={user}
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen}
        currentPage="profile"
        onNavigate={handleNavigation}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <TopBar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />

        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Montserrat' }}
            >
              Profile
            </h1>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              disabled={saving}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              style={{ fontFamily: 'Inter' }}
            >
              <Edit className="h-4 w-4" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700\" style={{ fontFamily: 'Inter' }}>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-green-700" style={{ fontFamily: 'Inter' }}>{success}</p>
              </div>
            )}

            {/* Profile Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  {profileData.avatarUrl ? (
                    <img
                      src={profileData.avatarUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                      onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  
                  <div className={`w-24 h-24 bg-green-500 rounded-full flex items-center justify-center ${profileData.avatarUrl ? 'hidden' : ''}`}>
                    <User className="h-12 w-12 text-white" />
                  </div>
                  
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 cursor-pointer transition-colors">
                      {uploading ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                <div className="text-center sm:text-left flex-1">
                  <h2 
                    className="text-2xl font-bold text-gray-900"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    {profileData.name || 'User'}
                  </h2>
                  <p 
                    className="text-green-600 font-medium"
                    style={{ fontFamily: 'Inter' }}
                  >
                    {getUserTypeDisplay(profileData.userType)}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{profileData.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {profileData.joinedDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 
                className="text-lg font-semibold text-gray-900 mb-6"
                style={{ fontFamily: 'Montserrat' }}
              >
                Profile Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      style={{ fontFamily: 'Inter' }}
                    />
                  ) : (
                    <p className="text-gray-900" style={{ fontFamily: 'Inter' }}>
                      {profileData.name || 'Not set'}
                    </p>
                  )}
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Email
                  </label>
                  <p className="text-gray-900" style={{ fontFamily: 'Inter' }}>
                    {profileData.email}
                  </p>
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    User Type
                  </label>
                  {isEditing ? (
                    <select
                      value={profileData.userType}
                      onChange={(e) => setProfileData({ ...profileData, userType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      style={{ fontFamily: 'Inter' }}
                    >
                      <option value="business-owner">Business Owner</option>
                      <option value="referrer">Referrer</option>
                      <option value="idea-creator">Idea Creator</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-900" style={{ fontFamily: 'Inter' }}>
                      {getUserTypeDisplay(profileData.userType)}
                    </p>
                  )}
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      placeholder="City, State"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      style={{ fontFamily: 'Inter' }}
                    />
                  ) : (
                    <p className="text-gray-900" style={{ fontFamily: 'Inter' }}>
                      {profileData.location || 'Not set'}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label 
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: 'Inter' }}
                >
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    style={{ fontFamily: 'Inter' }}
                  />
                ) : (
                  <p className="text-gray-900" style={{ fontFamily: 'Inter' }}>
                    {profileData.bio || 'No bio added yet'}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileData.newsletterOptIn}
                      onChange={(e) => setProfileData({ ...profileData, newsletterOptIn: e.target.checked })}
                      className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700" style={{ fontFamily: 'Inter' }}>
                      Subscribe to newsletter for updates
                    </span>
                  </label>
                </div>
              )}

              {isEditing && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setError('')
                      setSuccess('')
                    }}
                    disabled={saving}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg flex items-center space-x-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    {saving ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Contact & Social Media Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 
                className="text-lg font-semibold text-gray-900 mb-6"
                style={{ fontFamily: 'Montserrat' }}
              >
                Contact & Social Media
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Phone Number
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900" style={{ fontFamily: 'Inter' }}>
                        {profileData.phone || 'Not provided'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Website
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                        placeholder="https://yourwebsite.com"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                      {profileData.website ? (
                        <a 
                          href={profileData.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                          style={{ fontFamily: 'Inter' }}
                        >
                          {profileData.website}
                        </a>
                      ) : (
                        <span className="text-gray-900" style={{ fontFamily: 'Inter' }}>
                          Not provided
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    LinkedIn
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        value={profileData.linkedin}
                        onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Linkedin className="h-4 w-4 text-gray-400" />
                      {profileData.linkedin ? (
                        <a 
                          href={profileData.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                          style={{ fontFamily: 'Inter' }}
                        >
                          LinkedIn Profile
                        </a>
                      ) : (
                        <span className="text-gray-900" style={{ fontFamily: 'Inter' }}>
                          Not provided
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Twitter
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        value={profileData.twitter}
                        onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                        placeholder="https://twitter.com/yourusername"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Twitter className="h-4 w-4 text-gray-400" />
                      {profileData.twitter ? (
                        <a 
                          href={profileData.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                          style={{ fontFamily: 'Inter' }}
                        >
                          Twitter Profile
                        </a>
                      ) : (
                        <span className="text-gray-900" style={{ fontFamily: 'Inter' }}>
                          Not provided
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2" style={{ fontFamily: 'Inter' }}>
                  💡 Why add contact information?
                </h4>
                <p className="text-blue-700 text-sm" style={{ fontFamily: 'Inter' }}>
                  Adding your contact details makes it easier for other community members to connect with you for business opportunities, collaborations, and networking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Profile