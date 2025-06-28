import { supabase } from './supabase'

// Types
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
  credits?: number
  fiat_balance?: number
}

export interface Idea {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  price: number
  views: number
  likes: number
  status: string
  created_at: string
  updated_at: string
  cover_image_url?: string
  problem_summary?: string
  solution_overview?: string
  tags?: string[]
  thumbnail_url?: string
  location?: string
  user_profiles?: {
    name: string
    avatar_url?: string
  }
  liked_by_user?: boolean
  bookmarked_by_user?: boolean
  is_promoted?: boolean
}

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
  status: string
  created_at: string
  updated_at: string
  referral_type?: string
  logo_url?: string
  website?: string
  cta_text?: string
  terms?: string
  user_profiles?: {
    name: string
    avatar_url?: string
  }
  liked_by_user?: boolean
  bookmarked_by_user?: boolean
  likes?: number
  is_promoted?: boolean
}

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
  tags?: string[]
  featured: boolean
  status: string
  created_at: string
  updated_at: string
  location?: string
  user_profiles?: {
    name: string
    avatar_url?: string
  }
  is_promoted?: boolean
}

export interface Comment {
  id: string
  idea_id: string
  user_id: string
  parent_id?: string
  content: string
  likes: number
  created_at: string
  updated_at: string
  user_profile?: {
    name: string
    avatar_url?: string
  }
  liked_by_user?: boolean
}

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

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'credit_purchase' | 'credit_usage' | 'withdrawal' | 'refund' | 'credit_earning' | 'credit_to_fiat_conversion'
  amount: number
  credits: number
  currency: string
  description: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  payment_method?: string
  payment_id?: string
  metadata?: any
  created_at: string
  updated_at: string
}

export interface Promotion {
  id: string
  user_id: string
  content_id: string
  content_type: 'idea' | 'referral_job' | 'tool'
  promotion_type: 'featured_homepage' | 'boosted_search' | 'category_spotlight' | 'premium_placement'
  cost_credits: number
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'pending' | 'cancelled'
  views_gained?: number
  clicks_gained?: number
  metadata?: any
  created_at: string
  updated_at: string
}

// Create types for form data
export interface CreateIdeaData {
  user_id: string
  title: string
  description: string
  category: string
  problem_summary?: string
  solution_overview?: string
  price?: number
  tags?: string[]
  location?: string
  cover_image_url?: string
  thumbnail_url?: string
}

export interface CreateToolData {
  user_id: string
  title: string
  description: string
  category: string
  type: 'free' | 'paid' | 'premium'
  price?: number
  download_url: string
  tags?: string[]
  location?: string
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
  urgency?: 'low' | 'medium' | 'high'
  requirements?: string
  referral_type?: string
  logo_url?: string
  website?: string
  cta_text?: string
  terms?: string
}

export interface UpdateIdeaData {
  title?: string
  description?: string
  category?: string
  problem_summary?: string
  solution_overview?: string
  price?: number
  tags?: string[]
  location?: string
  cover_image_url?: string
  thumbnail_url?: string
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
  referral_type?: string
  logo_url?: string
  website?: string
  cta_text?: string
  terms?: string
}

export interface CreateCommentData {
  idea_id: string
  user_id: string
  parent_id?: string
  content: string
}

export interface CreateMessageData {
  sender_id: string
  recipient_id: string
  content: string
  subject?: string
}

export interface CreatePromotionAdData {
  user_id: string
  content_id: string
  content_type: 'idea' | 'referral_job' | 'tool'
  promotion_type: 'featured_homepage' | 'boosted_search' | 'category_spotlight' | 'premium_placement'
  cost_credits: number
  start_date: string
  end_date: string
  metadata?: any
}

// Constants
export const REFERRAL_JOB_POSTING_COST = 10 // Credits required to post a referral job

// Promotion pricing function
export const getPromotionPricing = (
  contentType: 'idea' | 'referral_job' | 'tool',
  promotionType: 'featured_homepage' | 'boosted_search' | 'category_spotlight' | 'premium_placement'
): number => {
  // Define pricing based on promotion type and content type
  const pricingMatrix = {
    featured_homepage: {
      idea: 50,
      referral_job: 75,
      tool: 60
    },
    boosted_search: {
      idea: 25,
      referral_job: 35,
      tool: 30
    },
    category_spotlight: {
      idea: 40,
      referral_job: 50,
      tool: 45
    },
    premium_placement: {
      idea: 80,
      referral_job: 100,
      tool: 90
    }
  }

  return pricingMatrix[promotionType][contentType] || 0
}

// User Profile Functions
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
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
}

// Ideas Functions
export const getIdeas = async (limit = 10, offset = 0, userId?: string): Promise<Idea[]> => {
  let query = supabase
    .from('ideas')
    .select(`
      *,
      user_profiles!inner(name, avatar_url)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching ideas:', error)
    return []
  }

  // Add user interaction data if userId is provided
  if (userId && data) {
    const ideasWithInteractions = await Promise.all(
      data.map(async (idea) => {
        // Check if user liked this idea
        const { data: likeData } = await supabase
          .from('idea_likes')
          .select('id')
          .eq('idea_id', idea.id)
          .eq('user_id', userId)
          .single()

        // Check if user bookmarked this idea
        const { data: bookmarkData } = await supabase
          .from('idea_bookmarks')
          .select('id')
          .eq('idea_id', idea.id)
          .eq('user_id', userId)
          .single()

        // Check if idea is promoted
        const { data: promotionData } = await supabase
          .from('promotions')
          .select('id')
          .eq('content_id', idea.id)
          .eq('content_type', 'idea')
          .eq('status', 'active')
          .gte('end_date', new Date().toISOString())
          .single()

        return {
          ...idea,
          liked_by_user: !!likeData,
          bookmarked_by_user: !!bookmarkData,
          is_promoted: !!promotionData
        }
      })
    )
    return ideasWithInteractions
  }

  return data || []
}

export const getIdeaById = async (id: string): Promise<Idea | null> => {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      user_profiles!inner(name, avatar_url, user_type, bio)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching idea:', error)
    return null
  }

  return data
}

export const createIdea = async (ideaData: CreateIdeaData): Promise<Idea | null> => {
  const { data, error } = await supabase
    .from('ideas')
    .insert(ideaData)
    .select()
    .single()

  if (error) {
    console.error('Error creating idea:', error)
    throw new Error(error.message)
  }

  return data
}

export const updateIdea = async (id: string, updates: UpdateIdeaData): Promise<Idea | null> => {
  const { data, error } = await supabase
    .from('ideas')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating idea:', error)
    return null
  }

  return data
}

export const deleteIdea = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('ideas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting idea:', error)
    return false
  }

  return true
}

export const getUserIdeas = async (userId: string): Promise<Idea[]> => {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user ideas:', error)
    return []
  }

  return data || []
}

export const likeIdea = async (ideaId: string, userId: string): Promise<boolean> => {
  // Check if already liked
  const { data: existingLike } = await supabase
    .from('idea_likes')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', userId)
    .single()

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('idea_likes')
      .delete()
      .eq('idea_id', ideaId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error unliking idea:', error)
      return false
    }

    // Decrement likes count
    await supabase.rpc('decrement_idea_likes', { idea_id: ideaId })
  } else {
    // Like
    const { error } = await supabase
      .from('idea_likes')
      .insert({ idea_id: ideaId, user_id: userId })

    if (error) {
      console.error('Error liking idea:', error)
      return false
    }

    // Increment likes count
    await supabase.rpc('increment_idea_likes', { idea_id: ideaId })
  }

  return true
}

export const bookmarkIdea = async (ideaId: string, userId: string): Promise<boolean> => {
  // Check if already bookmarked
  const { data: existingBookmark } = await supabase
    .from('idea_bookmarks')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', userId)
    .single()

  if (existingBookmark) {
    // Remove bookmark
    const { error } = await supabase
      .from('idea_bookmarks')
      .delete()
      .eq('idea_id', ideaId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error removing bookmark:', error)
      return false
    }
  } else {
    // Add bookmark
    const { error } = await supabase
      .from('idea_bookmarks')
      .insert({ idea_id: ideaId, user_id: userId })

    if (error) {
      console.error('Error bookmarking idea:', error)
      return false
    }
  }

  return true
}

// Referral Jobs Functions
export const getReferralJobs = async (limit = 10, offset = 0, userId?: string): Promise<ReferralJob[]> => {
  let query = supabase
    .from('referral_jobs')
    .select(`
      *,
      user_profiles!inner(name, avatar_url)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching referral jobs:', error)
    return []
  }

  // Add promotion status if data exists
  if (data) {
    const jobsWithPromotions = await Promise.all(
      data.map(async (job) => {
        // Check if job is promoted
        const { data: promotionData } = await supabase
          .from('promotions')
          .select('id')
          .eq('content_id', job.id)
          .eq('content_type', 'referral_job')
          .eq('status', 'active')
          .gte('end_date', new Date().toISOString())
          .single()

        return {
          ...job,
          is_promoted: !!promotionData
        }
      })
    )
    return jobsWithPromotions
  }

  return data || []
}

export const getReferralJobById = async (id: string): Promise<ReferralJob | null> => {
  const { data, error } = await supabase
    .from('referral_jobs')
    .select(`
      *,
      user_profiles!inner(name, avatar_url, user_type, bio)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching referral job:', error)
    return null
  }

  return data
}

export const createReferralJobWithPayment = async (jobData: CreateReferralJobData): Promise<ReferralJob | null> => {
  // Check if user has enough credits
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('credits')
    .eq('id', jobData.user_id)
    .single()

  if (!userProfile || (userProfile.credits || 0) < REFERRAL_JOB_POSTING_COST) {
    throw new Error('Insufficient credits to post referral job')
  }

  // Create the referral job and deduct credits in a transaction
  const { data, error } = await supabase.rpc('create_referral_job_with_payment', {
    p_user_id: jobData.user_id,
    p_title: jobData.title,
    p_business_name: jobData.business_name,
    p_description: jobData.description,
    p_commission: jobData.commission,
    p_commission_type: jobData.commission_type,
    p_location: jobData.location,
    p_category: jobData.category,
    p_urgency: jobData.urgency || 'medium',
    p_requirements: jobData.requirements,
    p_referral_type: jobData.referral_type,
    p_logo_url: jobData.logo_url,
    p_website: jobData.website,
    p_cta_text: jobData.cta_text,
    p_terms: jobData.terms,
    p_cost_credits: REFERRAL_JOB_POSTING_COST
  })

  if (error) {
    console.error('Error creating referral job with payment:', error)
    throw new Error(error.message)
  }

  return data
}

export const updateReferralJob = async (id: string, updates: UpdateReferralJobData): Promise<ReferralJob | null> => {
  const { data, error } = await supabase
    .from('referral_jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating referral job:', error)
    return null
  }

  return data
}

export const getUserReferralJobs = async (userId: string): Promise<ReferralJob[]> => {
  const { data, error } = await supabase
    .from('referral_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user referral jobs:', error)
    return []
  }

  return data || []
}

export const deleteReferralJob = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('referral_jobs')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting referral job:', error)
    return false
  }

  return true
}

// Tools Functions
export const getTools = async (limit = 10, offset = 0): Promise<Tool[]> => {
  const { data, error } = await supabase
    .from('tools')
    .select(`
      *,
      user_profiles!inner(name, avatar_url)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching tools:', error)
    return []
  }

  // Add promotion status if data exists
  if (data) {
    const toolsWithPromotions = await Promise.all(
      data.map(async (tool) => {
        // Check if tool is promoted
        const { data: promotionData } = await supabase
          .from('promotions')
          .select('id')
          .eq('content_id', tool.id)
          .eq('content_type', 'tool')
          .eq('status', 'active')
          .gte('end_date', new Date().toISOString())
          .single()

        return {
          ...tool,
          is_promoted: !!promotionData
        }
      })
    )
    return toolsWithPromotions
  }

  return data || []
}

export const createTool = async (toolData: CreateToolData): Promise<Tool | null> => {
  const { data, error } = await supabase
    .from('tools')
    .insert(toolData)
    .select()
    .single()

  if (error) {
    console.error('Error creating tool:', error)
    throw new Error(error.message)
  }

  return data
}

export const getUserTools = async (userId: string): Promise<Tool[]> => {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user tools:', error)
    return []
  }

  return data || []
}

export const deleteTool = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('tools')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting tool:', error)
    return false
  }

  return true
}

// Comments Functions
export const getIdeaComments = async (ideaId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user_profiles!inner(name, avatar_url)
    `)
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  return data || []
}

export const createComment = async (commentData: CreateCommentData): Promise<Comment | null> => {
  const { data, error } = await supabase
    .from('comments')
    .insert(commentData)
    .select(`
      *,
      user_profiles!inner(name, avatar_url)
    `)
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    return null
  }

  return data
}

export const likeComment = async (commentId: string, userId: string): Promise<boolean> => {
  // Check if already liked
  const { data: existingLike } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .single()

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error unliking comment:', error)
      return false
    }

    // Decrement likes count
    await supabase.rpc('decrement_comment_likes', { comment_id: commentId })
  } else {
    // Like
    const { error } = await supabase
      .from('comment_likes')
      .insert({ comment_id: commentId, user_id: userId })

    if (error) {
      console.error('Error liking comment:', error)
      return false
    }

    // Increment likes count
    await supabase.rpc('increment_comment_likes', { comment_id: commentId })
  }

  return true
}

// File Upload Functions
export const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}

export const uploadAvatar = async (userId: string, file: File): Promise<string | null> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError)
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return data.publicUrl
}

// Notifications Functions
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
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
}

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('Error marking notification as read:', error)
    return false
  }

  return true
}

export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
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
}

export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) {
    console.error('Error deleting notification:', error)
    return false
  }

  return true
}

// Messages Functions
export const createMessage = async (messageData: CreateMessageData): Promise<Message | null> => {
  // First, find or create a conversation between the two users
  const { data: existingConversation } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(participant_1.eq.${messageData.sender_id},participant_2.eq.${messageData.recipient_id}),and(participant_1.eq.${messageData.recipient_id},participant_2.eq.${messageData.sender_id})`)
    .single()

  let conversationId = existingConversation?.id

  if (!conversationId) {
    // Create new conversation
    const { data: newConversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        participant_1: messageData.sender_id,
        participant_2: messageData.recipient_id
      })
      .select('id')
      .single()

    if (conversationError) {
      console.error('Error creating conversation:', conversationError)
      return null
    }

    conversationId = newConversation.id
  }

  // Create the message
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: messageData.sender_id,
      content: messageData.content
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating message:', error)
    return null
  }

  // Update conversation's last_message_at
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)

  return data
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

// Wallet Functions
export const getUserCredits = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user credits:', error)
    return 0
  }

  return data?.credits || 0
}

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data || []
}

// Purchase Functions
export const hasUserPurchasedContent = async (userId: string, contentId: string, contentType: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('purchased_content')
    .select('id')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking purchase status:', error)
    return false
  }

  return !!data
}

export const purchaseContent = async (
  buyerId: string,
  sellerId: string,
  contentId: string,
  contentType: string,
  price: number
): Promise<boolean> => {
  const { data, error } = await supabase.rpc('purchase_content', {
    p_buyer_id: buyerId,
    p_seller_id: sellerId,
    p_content_id: contentId,
    p_content_type: contentType,
    p_price: price
  })

  if (error) {
    console.error('Error purchasing content:', error)
    throw new Error(error.message)
  }

  return !!data
}

// Promotion Functions
export const getActivePromotionForContent = async (contentId: string, contentType: string): Promise<Promotion | null> => {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .eq('status', 'active')
    .gte('end_date', new Date().toISOString())
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching promotion:', error)
    return null
  }

  return data
}

export const incrementPromotionClicks = async (promotionId: string): Promise<boolean> => {
  const { error } = await supabase.rpc('increment_promotion_clicks', {
    p_promotion_id: promotionId
  })

  if (error) {
    console.error('Error incrementing promotion clicks:', error)
    return false
  }

  return true
}

export const createPromotionAd = async (promotionData: CreatePromotionAdData): Promise<Promotion | null> => {
  // Check if user has enough credits
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('credits')
    .eq('id', promotionData.user_id)
    .single()

  if (!userProfile || (userProfile.credits || 0) < promotionData.cost_credits) {
    throw new Error('Insufficient credits to create promotion')
  }

  // Create the promotion and deduct credits in a transaction
  const { data, error } = await supabase.rpc('create_promotion_with_payment', {
    p_user_id: promotionData.user_id,
    p_content_id: promotionData.content_id,
    p_content_type: promotionData.content_type,
    p_promotion_type: promotionData.promotion_type,
    p_cost_credits: promotionData.cost_credits,
    p_start_date: promotionData.start_date,
    p_end_date: promotionData.end_date,
    p_metadata: promotionData.metadata || {}
  })

  if (error) {
    console.error('Error creating promotion:', error)
    throw new Error(error.message)
  }

  return data
}