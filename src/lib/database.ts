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
  free_credits?: number
  fiat_balance?: number
  paypal_email?: string
  // Contact and social media fields
  phone?: string
  website?: string
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
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
  type: 'credit_purchase' | 'credit_usage' | 'withdrawal' | 'refund' | 'credit_earning' | 'credit_to_fiat_conversion' | 'credit_transfer_sent' | 'credit_transfer_received'
  amount: number
  credits: number
  currency: string
  description: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  payment_method?: string
  payment_id?: string
  withdrawal_method?: string
  withdrawal_details?: any
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

export interface WalletStats {
  currentCredits: number
  freeCredits: number
  fiatBalance: number
  totalEarned: number
  totalSpent: number
  pendingEarnings: number
}

export interface CreditBalance {
  cashCredits: number
  freeCredits: number
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

export interface CreatePromotionData {
  user_id: string
  content_id: string
  content_type: 'idea' | 'referral_job' | 'tool'
  promotion_type: 'featured_homepage' | 'boosted_search' | 'category_spotlight' | 'premium_placement'
  duration_days: number
  cost_credits: number
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
  promotionType: 'featured_homepage' | 'boosted_search' | 'category_spotlight' | 'premium_placement',
  durationDays: number
): number => {
  // Define pricing per day based on promotion type
  const dailyPricing = {
    featured_homepage: 15,
    boosted_search: 5,
    category_spotlight: 7,
    premium_placement: 10
  }

  return dailyPricing[promotionType] * durationDays
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

export const updateUserPayPalEmail = async (userId: string, paypalEmail: string): Promise<boolean> => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ paypal_email: paypalEmail })
    .eq('id', userId)

  if (error) {
    console.error('Error updating PayPal email:', error)
    return false
  }

  return true
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
          .maybeSingle()

        // Check if user bookmarked this idea
        const { data: bookmarkData } = await supabase
          .from('idea_bookmarks')
          .select('id')
          .eq('idea_id', idea.id)
          .eq('user_id', userId)
          .maybeSingle()

        // Check if idea is promoted
        const { data: promotionData } = await supabase
          .from('promotions')
          .select('id')
          .eq('content_id', idea.id)
          .eq('content_type', 'idea')
          .eq('status', 'active')
          .gte('end_date', new Date().toISOString())
          .maybeSingle()

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
    .maybeSingle()

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
    .maybeSingle()

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
          .maybeSingle()

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
  // Check if user has enough credits (combined free and cash)
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('credits, free_credits')
    .eq('id', jobData.user_id)
    .single()

  const totalCredits = (userProfile?.credits || 0) + (userProfile?.free_credits || 0)
  
  if (!userProfile || totalCredits < REFERRAL_JOB_POSTING_COST) {
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
          .maybeSingle()

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
    .maybeSingle()

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
    .maybeSingle()

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

export const subscribeToUserProfile = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('user-profile')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_profiles',
        filter: `id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

// Wallet Functions
export const getUserCredits = async (userId: string): Promise<CreditBalance> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('credits, free_credits')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user credits:', error)
    return { cashCredits: 0, freeCredits: 0 }
  }

  return {
    cashCredits: data?.credits || 0,
    freeCredits: data?.free_credits || 0
  }
}

export const getUserTransactions = async (userId: string, limit = 50): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data || []
}

export const getWalletStats = async (userId: string): Promise<WalletStats> => {
  try {
    // Get user profile for current balances
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits, free_credits, fiat_balance')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile for wallet stats:', profileError)
      throw new Error(profileError.message)
    }

    // Get all transactions for calculations
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (transactionsError) {
      console.error('Error fetching transactions for wallet stats:', transactionsError)
      throw new Error(transactionsError.message)
    }

    // Calculate totals
    const completedTransactions = transactions?.filter(t => t.status === 'completed') || []

    const totalEarned = completedTransactions
      .filter(t => ['credit_earning', 'refund', 'credit_transfer_received'].includes(t.type))
      .reduce((sum, t) => sum + Number(t.credits), 0)

    const totalSpent = completedTransactions
      .filter(t => ['credit_usage', 'credit_purchase', 'credit_transfer_sent'].includes(t.type))
      .reduce((sum, t) => sum + Math.abs(Number(t.amount || t.credits)), 0)

    const pendingEarnings = transactions?.filter(t => t.status === 'pending' && ['credit_earning'].includes(t.type))
      .reduce((sum, t) => sum + Number(t.credits), 0) || 0

    return {
      currentCredits: userProfile?.credits || 0,
      freeCredits: userProfile?.free_credits || 0,
      fiatBalance: Number(userProfile?.fiat_balance) || 0,
      totalEarned,
      totalSpent,
      pendingEarnings
    }
  } catch (error) {
    console.error('Error getting wallet stats:', error)
    // Return default stats in case of error
    return {
      currentCredits: 0,
      freeCredits: 0,
      fiatBalance: 0,
      totalEarned: 0,
      totalSpent: 0,
      pendingEarnings: 0
    }
  }
}

export const transferCreditsToFiatBalance = async (userId: string, credits: number): Promise<boolean> => {
  try {
    // Check if user has enough credits
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('credits, fiat_balance')
      .eq('id', userId)
      .single()

    if (!userProfile || (userProfile.credits || 0) < credits) {
      throw new Error('Insufficient credits for conversion')
    }

    // Convert credits to fiat (1 credit = $1)
    const fiatAmount = credits
    const newCredits = (userProfile.credits || 0) - credits
    const newFiatBalance = Number(userProfile.fiat_balance || 0) + fiatAmount

    // Update user profile
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        credits: newCredits,
        fiat_balance: newFiatBalance
      })
      .eq('id', userId)

    if (updateError) {
      throw new Error(updateError.message)
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'credit_to_fiat_conversion',
        amount: fiatAmount,
        credits: -credits,
        currency: 'USD',
        description: `Converted ${credits} credits to $${fiatAmount.toFixed(2)} cash`,
        status: 'completed'
      })

    if (transactionError) {
      console.error('Error creating transaction record:', transactionError)
      // Don't throw here as the main operation succeeded
    }

    return true
  } catch (error: any) {
    console.error('Error transferring credits to fiat:', error)
    throw new Error(error.message || 'Failed to convert credits to cash')
  }
}

export const processWithdrawal = async (userId: string, amount: number): Promise<boolean> => {
  try {
    // Get user profile to check balance and PayPal email
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('fiat_balance, paypal_email')
      .eq('id', userId)
      .single()

    if (!userProfile) {
      throw new Error('User profile not found')
    }

    if (!userProfile.paypal_email) {
      throw new Error('PayPal email not set. Please add your PayPal email in withdrawal settings.')
    }

    if (Number(userProfile.fiat_balance || 0) < amount) {
      throw new Error('Insufficient balance for withdrawal')
    }

    // Use the database function to process withdrawal with PayPal details
    const { data, error } = await supabase.rpc('process_withdrawal_with_paypal', {
      p_user_id: userId,
      p_amount: amount,
      p_paypal_email: userProfile.paypal_email
    })

    if (error) {
      throw new Error(error.message)
    }

    return true
  } catch (error: any) {
    console.error('Error processing withdrawal:', error)
    throw new Error(error.message || 'Failed to process withdrawal')
  }
}

// Purchase Functions
export const hasUserPurchasedContent = async (userId: string, contentId: string, contentType: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('purchased_content')
    .select('id')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .maybeSingle()

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
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching promotion:', error)
    return null
  }

  return data
}

export const getUserPromotions = async (userId: string): Promise<Promotion[]> => {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user promotions:', error)
    return []
  }

  return data || []
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

export const createPromotionAd = async (promotionData: CreatePromotionData): Promise<Promotion | null> => {
  try {
    // Check if user has enough credits
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('credits')
      .eq('id', promotionData.user_id)
      .single()

    if (!userProfile || (userProfile.credits || 0) < promotionData.cost_credits) {
      throw new Error('Insufficient credits to create promotion')
    }

    // Calculate dates
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + promotionData.duration_days)

    // Create promotion and deduct credits
    const newCredits = (userProfile.credits || 0) - promotionData.cost_credits

    // Update user credits
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ credits: newCredits })
      .eq('id', promotionData.user_id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    // Create promotion
    const { data: promotion, error: promotionError } = await supabase
      .from('promotions')
      .insert({
        user_id: promotionData.user_id,
        content_id: promotionData.content_id,
        content_type: promotionData.content_type,
        promotion_type: promotionData.promotion_type,
        cost_credits: promotionData.cost_credits,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active'
      })
      .select()
      .single()

    if (promotionError) {
      throw new Error(promotionError.message)
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: promotionData.user_id,
        type: 'credit_usage',
        amount: 0,
        credits: -promotionData.cost_credits,
        currency: 'USD',
        description: `Promotion: ${promotionData.promotion_type} for ${promotionData.duration_days} days`,
        status: 'completed',
        metadata: {
          promotion_id: promotion.id,
          content_id: promotionData.content_id,
          content_type: promotionData.content_type
        }
      })

    if (transactionError) {
      console.error('Error creating transaction record:', transactionError)
      // Don't throw here as the main operation succeeded
    }

    return promotion
  } catch (error: any) {
    console.error('Error creating promotion:', error)
    throw new Error(error.message || 'Failed to create promotion')
  }
}

// Credit transfer function
export const transferCredits = async (
  senderId: string, 
  recipientIdentifier: string, 
  amount: number
): Promise<boolean> => {
  try {
    // Validate amount
    if (amount <= 0) {
      throw new Error('Transfer amount must be greater than zero')
    }

    // Check if sender has enough credits
    const { data: senderProfile } = await supabase
      .from('user_profiles')
      .select('credits')
      .eq('id', senderId)
      .single()

    if (!senderProfile || (senderProfile.credits || 0) < amount) {
      throw new Error('Insufficient credits for transfer')
    }

    // Call the RPC function to handle the transfer
    const { data, error } = await supabase.rpc('transfer_user_credits', {
      p_sender_id: senderId,
      p_recipient_identifier: recipientIdentifier,
      p_amount: amount
    })

    if (error) {
      throw new Error(error.message)
    }

    return true
  } catch (error: any) {
    console.error('Error transferring credits:', error)
    throw new Error(error.message || 'Failed to transfer credits')
  }
}