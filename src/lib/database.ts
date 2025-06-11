import { supabase } from './supabase'

// Types
export interface UserProfile {
  id: string
  name: string | null
  bio: string | null
  location: string | null
  user_type: string | null
  avatar_url: string | null
  newsletter_opt_in: boolean | null
  credits: number
  fiat_balance: number
  created_at: string
  updated_at: string
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
    user_type?: string
    bio?: string
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
    user_type?: string
    bio?: string
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
    user_type?: string
    bio?: string
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
  views_gained: number
  clicks_gained: number
  metadata?: any
  created_at: string
  updated_at: string
}

export interface UpdateIdeaData {
  title?: string
  description?: string
  category?: string
  price?: number
  problem_summary?: string
  solution_overview?: string
  tags?: string[]
  cover_image_url?: string
  thumbnail_url?: string
  location?: string
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

// Constants
export const REFERRAL_JOB_POSTING_COST = 10 // Credits required to post a referral job

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = supabase.auth.getUser()
  return user
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
export const getIdeas = async (limit = 10, offset = 0, currentUserId?: string): Promise<Idea[]> => {
  let query = supabase
    .from('ideas')
    .select(`
      *,
      user_profiles!inner(name, avatar_url, user_type, bio)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching ideas:', error)
    return []
  }

  if (!data) return []

  // Get active promotions for these ideas
  const ideaIds = data.map(idea => idea.id)
  const { data: promotions } = await supabase
    .from('promotions')
    .select('content_id')
    .eq('content_type', 'idea')
    .eq('status', 'active')
    .in('content_id', ideaIds)
    .gte('end_date', new Date().toISOString())

  const promotedIds = new Set(promotions?.map(p => p.content_id) || [])

  // Get user interactions if user is logged in
  let likedIds = new Set()
  let bookmarkedIds = new Set()

  if (currentUserId) {
    const [likesResult, bookmarksResult] = await Promise.all([
      supabase
        .from('idea_likes')
        .select('idea_id')
        .eq('user_id', currentUserId)
        .in('idea_id', ideaIds),
      supabase
        .from('idea_bookmarks')
        .select('idea_id')
        .eq('user_id', currentUserId)
        .in('idea_id', ideaIds)
    ])

    likedIds = new Set(likesResult.data?.map(l => l.idea_id) || [])
    bookmarkedIds = new Set(bookmarksResult.data?.map(b => b.idea_id) || [])
  }

  return data.map(idea => ({
    ...idea,
    liked_by_user: likedIds.has(idea.id),
    bookmarked_by_user: bookmarkedIds.has(idea.id),
    is_promoted: promotedIds.has(idea.id)
  }))
}

export const getIdeaById = async (id: string, currentUserId?: string): Promise<Idea | null> => {
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

  if (!data) return null

  // Increment view count
  await supabase
    .from('ideas')
    .update({ views: data.views + 1 })
    .eq('id', id)

  // Check for active promotion and increment views if found
  const activePromotion = await getActivePromotionForContent(id, 'idea')
  if (activePromotion) {
    await incrementPromotionViews(activePromotion.id)
  }

  // Get user interactions if user is logged in
  let liked_by_user = false
  let bookmarked_by_user = false

  if (currentUserId) {
    const [likesResult, bookmarksResult] = await Promise.all([
      supabase
        .from('idea_likes')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('idea_id', id)
        .single(),
      supabase
        .from('idea_bookmarks')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('idea_id', id)
        .single()
    ])

    liked_by_user = !likesResult.error
    bookmarked_by_user = !bookmarksResult.error
  }

  return {
    ...data,
    views: data.views + 1, // Return incremented view count
    liked_by_user,
    bookmarked_by_user
  }
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

export const updateIdea = async (id: string, updates: UpdateIdeaData): Promise<Idea | null> => {
  const { data, error } = await supabase
    .from('ideas')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      user_profiles!inner(name, avatar_url, user_type, bio)
    `)
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

// Referral Jobs Functions
export const getReferralJobs = async (limit = 10, offset = 0, currentUserId?: string): Promise<ReferralJob[]> => {
  let query = supabase
    .from('referral_jobs')
    .select(`
      *,
      user_profiles!inner(name, avatar_url, user_type, bio)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching referral jobs:', error)
    return []
  }

  if (!data) return []

  // Get active promotions for these jobs
  const jobIds = data.map(job => job.id)
  const { data: promotions } = await supabase
    .from('promotions')
    .select('content_id')
    .eq('content_type', 'referral_job')
    .eq('status', 'active')
    .in('content_id', jobIds)
    .gte('end_date', new Date().toISOString())

  const promotedIds = new Set(promotions?.map(p => p.content_id) || [])

  return data.map(job => ({
    ...job,
    is_promoted: promotedIds.has(job.id)
  }))
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

  if (!data) return null

  // Check for active promotion and increment views if found
  const activePromotion = await getActivePromotionForContent(id, 'referral_job')
  if (activePromotion) {
    await incrementPromotionViews(activePromotion.id)
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

export const updateReferralJob = async (id: string, updates: UpdateReferralJobData): Promise<ReferralJob | null> => {
  const { data, error } = await supabase
    .from('referral_jobs')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      user_profiles!inner(name, avatar_url, user_type, bio)
    `)
    .single()

  if (error) {
    console.error('Error updating referral job:', error)
    return null
  }

  return data
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

export const createReferralJobWithPayment = async (jobData: Omit<ReferralJob, 'id' | 'created_at' | 'updated_at' | 'applicants_count' | 'status' | 'user_profiles'>): Promise<ReferralJob | null> => {
  try {
    // First, deduct credits from user
    const { error: deductError } = await supabase.rpc('deduct_credits_from_user', {
      p_user_id: jobData.user_id,
      p_credits: REFERRAL_JOB_POSTING_COST,
      p_description: `Posted referral job: ${jobData.title}`
    })

    if (deductError) {
      throw new Error(deductError.message)
    }

    // Then create the referral job
    const { data, error } = await supabase
      .from('referral_jobs')
      .insert(jobData)
      .select(`
        *,
        user_profiles!inner(name, avatar_url, user_type, bio)
      `)
      .single()

    if (error) {
      // If job creation fails, refund the credits
      await supabase.rpc('add_credits_to_user', {
        p_user_id: jobData.user_id,
        p_credits: REFERRAL_JOB_POSTING_COST,
        p_amount: REFERRAL_JOB_POSTING_COST,
        p_description: `Refund for failed referral job posting: ${jobData.title}`
      })
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('Error creating referral job with payment:', error)
    return null
  }
}

// Tools Functions
export const getTools = async (limit = 10, offset = 0): Promise<Tool[]> => {
  const { data, error } = await supabase
    .from('tools')
    .select(`
      *,
      user_profiles!inner(name, avatar_url, user_type, bio)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching tools:', error)
    return []
  }

  if (!data) return []

  // Get active promotions for these tools
  const toolIds = data.map(tool => tool.id)
  const { data: promotions } = await supabase
    .from('promotions')
    .select('content_id')
    .eq('content_type', 'tool')
    .eq('status', 'active')
    .in('content_id', toolIds)
    .gte('end_date', new Date().toISOString())

  const promotedIds = new Set(promotions?.map(p => p.content_id) || [])

  return data.map(tool => ({
    ...tool,
    is_promoted: promotedIds.has(tool.id)
  }))
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

// Engagement Functions
export const likeIdea = async (ideaId: string, userId: string): Promise<boolean> => {
  try {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('idea_likes')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .single()

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('idea_likes')
        .delete()
        .eq('idea_id', ideaId)
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      // Decrement like count
      await supabase.rpc('decrement_idea_likes', { idea_id: ideaId })
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('idea_likes')
        .insert({ idea_id: ideaId, user_id: userId })

      if (insertError) throw insertError

      // Increment like count
      await supabase.rpc('increment_idea_likes', { idea_id: ideaId })
    }

    return true
  } catch (error) {
    console.error('Error toggling idea like:', error)
    return false
  }
}

export const bookmarkIdea = async (ideaId: string, userId: string): Promise<boolean> => {
  try {
    // Check if already bookmarked
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

      if (deleteError) throw deleteError
    } else {
      // Add bookmark
      const { error: insertError } = await supabase
        .from('idea_bookmarks')
        .insert({ idea_id: ideaId, user_id: userId })

      if (insertError) throw insertError
    }

    return true
  } catch (error) {
    console.error('Error toggling idea bookmark:', error)
    return false
  }
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

  return data?.map(comment => ({
    ...comment,
    user_profile: comment.user_profiles
  })) || []
}

export const createComment = async (commentData: {
  idea_id: string
  user_id: string
  content: string
  parent_id?: string
}): Promise<Comment | null> => {
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

  return {
    ...data,
    user_profile: data.user_profiles
  }
}

export const likeComment = async (commentId: string, userId: string): Promise<boolean> => {
  try {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single()

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      // Decrement like count
      await supabase.rpc('decrement_comment_likes', { comment_id: commentId })
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('comment_likes')
        .insert({ comment_id: commentId, user_id: userId })

      if (insertError) throw insertError

      // Increment like count
      await supabase.rpc('increment_comment_likes', { comment_id: commentId })
    }

    return true
  } catch (error) {
    console.error('Error toggling comment like:', error)
    return false
  }
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
export const createMessage = async (messageData: {
  sender_id: string
  recipient_id: string
  content: string
  subject?: string
}): Promise<Message | null> => {
  try {
    // First, find or create conversation
    let conversationId: string

    // Check if conversation exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1.eq.${messageData.sender_id},participant_2.eq.${messageData.recipient_id}),and(participant_1.eq.${messageData.recipient_id},participant_2.eq.${messageData.sender_id})`)
      .single()

    if (existingConversation) {
      conversationId = existingConversation.id
    } else {
      // Create new conversation
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          participant_1: messageData.sender_id,
          participant_2: messageData.recipient_id
        })
        .select('id')
        .single()

      if (conversationError) throw conversationError
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

    if (error) throw error

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    return data
  } catch (error) {
    console.error('Error creating message:', error)
    return null
  }
}

// File Upload Functions
export const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export const uploadAvatar = async (userId: string, file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`
    const filePath = fileName

    // Upload to avatars bucket (create if doesn't exist)
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error('Error uploading avatar:', error)
    throw error
  }
}

// Real-time Subscriptions
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
    console.error('Error fetching user transactions:', error)
    return []
  }

  return data || []
}

// Paywall Functions
export const hasUserPurchasedContent = async (
  userId: string,
  contentId: string,
  contentType: 'idea' | 'referral_job' | 'tool'
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('purchased_content')
    .select('id')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking content purchase:', error)
    return false
  }

  return !!data
}

export const purchaseContent = async (
  buyerUserId: string,
  creatorUserId: string,
  contentId: string,
  contentType: 'idea' | 'referral_job' | 'tool',
  priceInCredits: number
): Promise<boolean> => {
  try {
    // Use the database function to handle the purchase
    const { data, error } = await supabase.rpc('purchase_content', {
      p_buyer_user_id: buyerUserId,
      p_creator_user_id: creatorUserId,
      p_content_id: contentId,
      p_content_type: contentType,
      p_price_in_credits: priceInCredits
    })

    if (error) throw error

    // Record the purchase
    const { error: purchaseError } = await supabase
      .from('purchased_content')
      .insert({
        user_id: buyerUserId,
        content_id: contentId,
        content_type: contentType,
        price_paid: priceInCredits
      })

    if (purchaseError) throw purchaseError

    return true
  } catch (error) {
    console.error('Error purchasing content:', error)
    throw error
  }
}

// Promotion Management Functions
export const getActivePromotionForContent = async (
  contentId: string,
  contentType: 'idea' | 'referral_job' | 'tool'
): Promise<Promotion | null> => {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .eq('status', 'active')
    .gte('end_date', new Date().toISOString())
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching active promotion:', error)
    return null
  }

  return data
}

export const incrementPromotionViews = async (promotionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('promotions')
      .update({ 
        views_gained: supabase.sql`views_gained + 1` 
      })
      .eq('id', promotionId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error incrementing promotion views:', error)
    return false
  }
}

export const incrementPromotionClicks = async (promotionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('promotions')
      .update({ 
        clicks_gained: supabase.sql`clicks_gained + 1` 
      })
      .eq('id', promotionId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error incrementing promotion clicks:', error)
    return false
  }
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

export const createPromotion = async (promotionData: {
  user_id: string
  content_id: string
  content_type: 'idea' | 'referral_job' | 'tool'
  promotion_type: 'featured_homepage' | 'boosted_search' | 'category_spotlight' | 'premium_placement'
  duration_days: number
  cost_credits: number
}): Promise<Promotion | null> => {
  try {
    const { data, error } = await supabase.rpc('create_promotion', {
      p_user_id: promotionData.user_id,
      p_content_id: promotionData.content_id,
      p_content_type: promotionData.content_type,
      p_promotion_type: promotionData.promotion_type,
      p_duration_days: promotionData.duration_days,
      p_cost_credits: promotionData.cost_credits
    })

    if (error) throw error

    // Fetch the created promotion
    const { data: promotion, error: fetchError } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', data)
      .single()

    if (fetchError) throw fetchError

    return promotion
  } catch (error) {
    console.error('Error creating promotion:', error)
    throw error
  }
}

export const renewPromotion = async (
  promotionId: string,
  additionalDays: number,
  costCredits: number
): Promise<boolean> => {
  try {
    // Get the promotion details
    const { data: promotion, error: fetchError } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', promotionId)
      .single()

    if (fetchError) throw fetchError

    // Check if user has enough credits
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits')
      .eq('id', promotion.user_id)
      .single()

    if (profileError) throw profileError

    if (userProfile.credits < costCredits) {
      throw new Error('Insufficient credits')
    }

    // Calculate new end date
    const currentEndDate = new Date(promotion.end_date)
    const newEndDate = new Date(currentEndDate.getTime() + (additionalDays * 24 * 60 * 60 * 1000))

    // Update promotion
    const { error: updateError } = await supabase
      .from('promotions')
      .update({
        end_date: newEndDate.toISOString(),
        status: 'active',
        cost_credits: promotion.cost_credits + costCredits
      })
      .eq('id', promotionId)

    if (updateError) throw updateError

    // Deduct credits
    const { error: deductError } = await supabase.rpc('deduct_credits_from_user', {
      p_user_id: promotion.user_id,
      p_credits: costCredits,
      p_description: `Renewed promotion: ${promotion.promotion_type} for ${additionalDays} days`
    })

    if (deductError) throw deductError

    return true
  } catch (error) {
    console.error('Error renewing promotion:', error)
    throw error
  }
}

export const getUserContentForPromotion = async (
  userId: string,
  contentType: 'idea' | 'referral_job' | 'tool'
): Promise<{ id: string; title: string }[]> => {
  let tableName = ''
  switch (contentType) {
    case 'idea':
      tableName = 'ideas'
      break
    case 'referral_job':
      tableName = 'referral_jobs'
      break
    case 'tool':
      tableName = 'tools'
      break
  }

  const { data, error } = await supabase
    .from(tableName)
    .select('id, title')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(`Error fetching user ${contentType}:`, error)
    return []
  }

  return data || []
}