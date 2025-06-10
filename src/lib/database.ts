import { supabase } from './supabase'

// User Profile Types
export interface UserProfile {
  id: string
  name?: string
  bio?: string
  location?: string
  user_type?: 'business-owner' | 'referrer' | 'idea-creator' | 'other'
  avatar_url?: string
  newsletter_opt_in?: boolean
  created_at: string
  updated_at: string
}

export interface UpdateProfileData {
  name?: string
  bio?: string
  location?: string
  user_type?: 'business-owner' | 'referrer' | 'idea-creator' | 'other'
  avatar_url?: string
  newsletter_opt_in?: boolean
}

// User Profile Functions
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      // PGRST116 means no rows found - this is expected for new users
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

export const updateUserProfile = async (userId: string, updates: UpdateProfileData): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updateUserProfile:', error)
    return null
  }
}

export const uploadAvatar = async (userId: string, file: File): Promise<string | null> => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.')
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload an image smaller than 5MB.')
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Delete old avatar if exists
    try {
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list('', {
          search: userId
        })

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles
          .filter(file => file.name.startsWith(userId))
          .map(file => file.name)

        if (filesToDelete.length > 0) {
          await supabase.storage
            .from('avatars')
            .remove(filesToDelete)
        }
      }
    } catch (cleanupError) {
      console.warn('Could not clean up old avatars:', cleanupError)
      // Continue with upload even if cleanup fails
    }

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    if (!data.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image')
    }

    return data.publicUrl
  } catch (error) {
    console.error('Error in uploadAvatar:', error)
    throw error
  }
}

// Generic file upload function
export const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
  try {
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload a file smaller than 10MB.')
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = fileName

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    if (!data.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file')
    }

    return data.publicUrl
  } catch (error) {
    console.error('Error in uploadFile:', error)
    throw error
  }
}

// Ideas Functions
export interface Idea {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  price: number
  views: number
  likes: number
  status: 'active' | 'inactive' | 'deleted'
  created_at: string
  updated_at: string
  cover_image_url?: string | null
  thumbnail_url?: string | null
  problem_summary?: string | null
  solution_overview?: string | null
  tags?: string[] | null
  location?: string | null
  user_profiles?: UserProfile
}

export interface CreateIdeaData {
  user_id: string
  title: string
  description: string
  category: string
  price?: number
  location?: string
  problem_summary?: string
  solution_overview?: string
  cover_image_url?: string | null
  thumbnail_url?: string | null
  tags?: string[]
}

export interface UpdateIdeaData {
  title?: string
  description?: string
  category?: string
  price?: number
  problem_summary?: string
  solution_overview?: string
  cover_image_url?: string | null
  thumbnail_url?: string | null
  tags?: string[]
  status?: 'active' | 'inactive' | 'deleted'
}

export const createIdea = async (ideaData: CreateIdeaData): Promise<Idea | null> => {
  try {
    const { data, error } = await supabase
      .from('ideas')
      .insert({
        user_id: ideaData.user_id,
        title: ideaData.title,
        description: ideaData.description,
        category: ideaData.category,
        price: ideaData.price || 0,
        location: ideaData.location,
        cover_image_url: ideaData.cover_image_url,
        thumbnail_url: ideaData.thumbnail_url,
        problem_summary: ideaData.problem_summary,
        solution_overview: ideaData.solution_overview,
        tags: ideaData.tags
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating idea:', error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('Error in createIdea:', error)
    throw error
  }
}

export const updateIdea = async (ideaId: string, updates: UpdateIdeaData): Promise<Idea | null> => {
  try {
    const { data, error } = await supabase
      .from('ideas')
      .update(updates)
      .eq('id', ideaId)
      .select()
      .single()

    if (error) {
      console.error('Error updating idea:', error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('Error in updateIdea:', error)
    throw error
  }
}

export const deleteIdea = async (ideaId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('ideas')
      .update({ status: 'deleted' })
      .eq('id', ideaId)

    if (error) {
      console.error('Error deleting idea:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteIdea:', error)
    return false
  }
}

export const getIdeas = async (limit = 10, offset = 0): Promise<Idea[]> => {
  try {
    const { data, error } = await supabase
      .from('ideas')
      .select(`
        *,
        user_profiles (
          id,
          name,
          avatar_url,
          user_type,
          bio
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching ideas:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getIdeas:', error)
    return []
  }
}

export const getIdeaById = async (ideaId: string): Promise<Idea | null> => {
  try {
    const { data, error } = await supabase
      .from('ideas')
      .select(`
        *,
        user_profiles (
          id,
          name,
          avatar_url,
          user_type,
          bio
        )
      `)
      .eq('id', ideaId)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Error fetching idea:', error)
      return null
    }

    // Increment view count
    await supabase
      .from('ideas')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', ideaId)

    return data
  } catch (error) {
    console.error('Error in getIdeaById:', error)
    return null
  }
}

export const getUserIdeas = async (userId: string): Promise<Idea[]> => {
  try {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user ideas:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserIdeas:', error)
    return []
  }
}

// Idea Bookmark Functions
export const bookmarkIdea = async (ideaId: string, userId: string): Promise<boolean> => {
  try {
    // Check if user already bookmarked this idea
    const { data: existingBookmark } = await supabase
      .from('idea_bookmarks')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .single()

    if (existingBookmark) {
      // Remove bookmark
      const { error: deleteError } = await supabase
        .from('idea_bookmarks')
        .delete()
        .eq('idea_id', ideaId)
        .eq('user_id', userId)

      if (deleteError) {
        console.error('Error removing bookmark:', deleteError)
        return false
      }
    } else {
      // Add bookmark
      const { error: insertError } = await supabase
        .from('idea_bookmarks')
        .insert({
          idea_id: ideaId,
          user_id: userId
        })

      if (insertError) {
        console.error('Error adding bookmark:', insertError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error in bookmarkIdea:', error)
    return false
  }
}

export const likeIdea = async (ideaId: string, userId: string): Promise<boolean> => {
  try {
    // Check if user already liked this idea
    const { data: existingLike } = await supabase
      .from('idea_likes')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .single()

    if (existingLike) {
      // Unlike - remove the like
      const { error: deleteError } = await supabase
        .from('idea_likes')
        .delete()
        .eq('idea_id', ideaId)
        .eq('user_id', userId)

      if (deleteError) {
        console.error('Error removing like:', deleteError)
        return false
      }

      // Decrement likes count
      const { error: updateError } = await supabase
        .from('ideas')
        .update({ likes: supabase.sql`likes - 1` })
        .eq('id', ideaId)

      if (updateError) {
        console.error('Error decrementing likes:', updateError)
        return false
      }
    } else {
      // Like - add the like
      const { error: insertError } = await supabase
        .from('idea_likes')
        .insert({
          idea_id: ideaId,
          user_id: userId
        })

      if (insertError) {
        console.error('Error adding like:', insertError)
        return false
      }

      // Increment likes count
      const { error: updateError } = await supabase
        .from('ideas')
        .update({ likes: supabase.sql`likes + 1` })
        .eq('id', ideaId)

      if (updateError) {
        console.error('Error incrementing likes:', updateError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error in likeIdea:', error)
    return false
  }
}

export const getUserBookmarkedIdeas = async (userId: string): Promise<Idea[]> => {
  try {
    const { data, error } = await supabase
      .from('idea_bookmarks')
      .select(`
        ideas (
          *,
          user_profiles (
            id,
            name,
            avatar_url,
            user_type,
            bio
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookmarked ideas:', error)
      return []
    }

    return data?.map(bookmark => bookmark.ideas).filter(Boolean) || []
  } catch (error) {
    console.error('Error in getUserBookmarkedIdeas:', error)
    return []
  }
}

// Messages Functions
export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  subject?: string
  read: boolean
  created_at: string
}

export interface CreateMessageData {
  sender_id: string
  recipient_id: string
  content: string
  subject?: string
}

export const createMessage = async (messageData: CreateMessageData): Promise<Message | null> => {
  try {
    // First, create or get conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .upsert({
        participant_1: messageData.sender_id,
        participant_2: messageData.recipient_id,
        last_message_at: new Date().toISOString()
      }, {
        onConflict: 'participant_1,participant_2'
      })
      .select()
      .single()

    if (convError) {
      console.error('Error creating conversation:', convError)
      throw new Error(convError.message)
    }

    // Then create the message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: messageData.sender_id,
        content: messageData.content
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating message:', error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('Error in createMessage:', error)
    throw error
  }
}

// Comments Functions
export interface Comment {
  id: string
  idea_id: string
  user_id: string
  parent_id?: string | null
  content: string
  likes: number
  created_at: string
  user_profile?: {
    name: string
    avatar_url?: string
    user_type: string
  }
  replies?: Comment[]
  liked_by_user?: boolean
}

export interface CreateCommentData {
  idea_id: string
  user_id: string
  content: string
  parent_id?: string | null
}

export const createComment = async (commentData: CreateCommentData): Promise<Comment | null> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        idea_id: commentData.idea_id,
        user_id: commentData.user_id,
        content: commentData.content,
        parent_id: commentData.parent_id
      })
      .select(`
        *,
        user_profiles (
          name,
          avatar_url,
          user_type
        )
      `)
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('Error in createComment:', error)
    throw error
  }
}

export const getIdeaComments = async (ideaId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user_profiles (
          name,
          avatar_url,
          user_type
        )
      `)
      .eq('idea_id', ideaId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching comments:', error)
      return []
    }

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      (data || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('comments')
          .select(`
            *,
            user_profiles (
              name,
              avatar_url,
              user_type
            )
          `)
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true })

        return {
          ...comment,
          replies: replies || [],
          user_profile: comment.user_profiles,
          liked_by_user: false // TODO: Check if current user liked this comment
        }
      })
    )

    return commentsWithReplies
  } catch (error) {
    console.error('Error in getIdeaComments:', error)
    return []
  }
}

export const likeComment = async (commentId: string, userId: string): Promise<boolean> => {
  try {
    // Check if user already liked this comment
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single()

    if (existingLike) {
      // Unlike - remove the like
      const { error: deleteError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId)

      if (deleteError) {
        console.error('Error removing like:', deleteError)
        return false
      }

      // Decrement likes count
      const { error: updateError } = await supabase.rpc('decrement_comment_likes', {
        comment_id: commentId
      })

      if (updateError) {
        console.error('Error decrementing likes:', updateError)
        return false
      }
    } else {
      // Like - add the like
      const { error: insertError } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: userId
        })

      if (insertError) {
        console.error('Error adding like:', insertError)
        return false
      }

      // Increment likes count
      const { error: updateError } = await supabase.rpc('increment_comment_likes', {
        comment_id: commentId
      })

      if (updateError) {
        console.error('Error incrementing likes:', updateError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error in likeComment:', error)
    return false
  }
}

export const reportComment = async (commentId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('comment_reports')
      .insert({
        comment_id: commentId,
        reported_by: userId,
        reason: 'inappropriate_content'
      })

    if (error) {
      console.error('Error reporting comment:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in reportComment:', error)
    return false
  }
}

// Referral Jobs Functions
export interface ReferralJob {
  id: string
  user_id: string
  title: string
  business_name: string
  description: string
  commission: number
  commission_type: 'percentage' | 'fixed'
  location: string
  category: string
  urgency: 'low' | 'medium' | 'high'
  requirements?: string
  applicants_count: number
  status: 'active' | 'inactive' | 'completed' | 'deleted'
  created_at: string
  updated_at: string
  // New fields from the prompt
  referral_type?: string
  logo_url?: string | null
  website?: string | null
  cta_text?: string | null
  terms?: string | null
  user_profiles?: UserProfile
}

export interface CreateReferralJobData {
  user_id: string
  title: string
  business_name: string
  description: string
  commission: number
  commission_type: 'percentage' | 'fixed'
  location: string
  category: string
  requirements?: string
  // New fields from the prompt
  referral_type?: string
  logo_url?: string | null
  website?: string | null
  cta_text?: string | null
  terms?: string | null
}

export interface UpdateReferralJobData {
  title?: string
  business_name?: string
  description?: string
  commission?: number
  commission_type?: 'percentage' | 'fixed'
  location?: string
  category?: string
  urgency?: 'low' | 'medium' | 'high'
  requirements?: string
  status?: 'active' | 'inactive' | 'completed' | 'deleted'
  // New fields from the prompt
  referral_type?: string
  logo_url?: string | null
  website?: string | null
  cta_text?: string | null
  terms?: string | null
}

export const createReferralJob = async (jobData: CreateReferralJobData): Promise<ReferralJob | null> => {
  try {
    const { data, error } = await supabase
      .from('referral_jobs')
      .insert({
        user_id: jobData.user_id,
        title: jobData.title,
        business_name: jobData.business_name,
        description: jobData.description,
        commission: jobData.commission,
        commission_type: jobData.commission_type,
        location: jobData.location,
        category: jobData.category,
        requirements: jobData.requirements,
        referral_type: jobData.referral_type,
        logo_url: jobData.logo_url,
        website: jobData.website,
        cta_text: jobData.cta_text,
        terms: jobData.terms
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating referral job:', error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('Error in createReferralJob:', error)
    throw error
  }
}

export const updateReferralJob = async (jobId: string, updates: UpdateReferralJobData): Promise<ReferralJob | null> => {
  try {
    const { data, error } = await supabase
      .from('referral_jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single()

    if (error) {
      console.error('Error updating referral job:', error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('Error in updateReferralJob:', error)
    throw error
  }
}

export const deleteReferralJob = async (jobId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('referral_jobs')
      .update({ status: 'deleted' })
      .eq('id', jobId)

    if (error) {
      console.error('Error deleting referral job:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteReferralJob:', error)
    return false
  }
}

export const getReferralJobs = async (limit = 10, offset = 0): Promise<ReferralJob[]> => {
  try {
    const { data, error } = await supabase
      .from('referral_jobs')
      .select(`
        *,
        user_profiles (
          id,
          name,
          avatar_url
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching referral jobs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getReferralJobs:', error)
    return []
  }
}

export const getReferralJobById = async (jobId: string): Promise<ReferralJob | null> => {
  try {
    const { data, error } = await supabase
      .from('referral_jobs')
      .select(`
        *,
        user_profiles (
          id,
          name,
          avatar_url,
          user_type,
          bio
        )
      `)
      .eq('id', jobId)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Error fetching referral job:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getReferralJobById:', error)
    return null
  }
}

export const getUserReferralJobs = async (userId: string): Promise<ReferralJob[]> => {
  try {
    const { data, error } = await supabase
      .from('referral_jobs')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user referral jobs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserReferralJobs:', error)
    return []
  }
}

// Tools Functions
export interface Tool {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  type: 'free' | 'paid' | 'premium'
  price: number
  download_url?: string
  downloads_count: number
  rating: number
  tags: string[]
  featured: boolean
  status: 'active' | 'inactive' | 'pending' | 'deleted'
  created_at: string
  updated_at: string
  location?: string
  user_profiles?: UserProfile
}

export interface CreateToolData {
  user_id: string
  title: string
  description: string
  category: string
  type: 'free' | 'paid' | 'premium'
  price?: number
  download_url?: string | null
  who_its_for?: string
  tool_type?: string
}

export interface UpdateToolData {
  title?: string
  description?: string
  category?: string
  type?: 'free' | 'paid' | 'premium'
  price?: number
  download_url?: string | null
  tags?: string[]
  status?: 'active' | 'inactive' | 'pending' | 'deleted'
}

export const createTool = async (toolData: CreateToolData): Promise<Tool | null> => {
  try {
    const { data, error } = await supabase
      .from('tools')
      .insert({
        user_id: toolData.user_id,
        title: toolData.title,
        description: toolData.description,
        category: toolData.category,
        type: toolData.type,
        price: toolData.price || 0,
        download_url: toolData.download_url
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating tool:', error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('Error in createTool:', error)
    throw error
  }
}

export const updateTool = async (toolId: string, updates: UpdateToolData): Promise<Tool | null> => {
  try {
    const { data, error } = await supabase
      .from('tools')
      .update(updates)
      .eq('id', toolId)
      .select()
      .single()

    if (error) {
      console.error('Error updating tool:', error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('Error in updateTool:', error)
    throw error
  }
}

export const deleteTool = async (toolId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tools')
      .update({ status: 'deleted' })
      .eq('id', toolId)

    if (error) {
      console.error('Error deleting tool:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteTool:', error)
    return false
  }
}

export const getTools = async (limit = 10, offset = 0): Promise<Tool[]> => {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select(`
        *,
        user_profiles (
          id,
          name,
          avatar_url
        )
      `)
      .eq('status', 'active')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching tools:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getTools:', error)
    return []
  }
}

export const getToolById = async (toolId: string): Promise<Tool | null> => {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select(`
        *,
        user_profiles (
          id,
          name,
          avatar_url,
          user_type,
          bio
        )
      `)
      .eq('id', toolId)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Error fetching tool:', error)
      return null
    }

    // Increment downloads count when tool is viewed
    await supabase
      .from('tools')
      .update({ downloads_count: (data.downloads_count || 0) + 1 })
      .eq('id', toolId)

    return data
  } catch (error) {
    console.error('Error in getToolById:', error)
    return null
  }
}

export const getUserTools = async (userId: string): Promise<Tool[]> => {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user tools:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserTools:', error)
    return []
  }
}

// Notifications Functions
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  action_url?: string
  created_at: string
}

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserNotifications:', error)
    return []
  }
}

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error)
    return false
  }
}

export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error)
    return false
  }
}

export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      console.error('Error deleting notification:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteNotification:', error)
    return false
  }
}

// Real-time subscriptions
export const subscribeToUserNotifications = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('user-notifications')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToUserMessages = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('user-messages')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}