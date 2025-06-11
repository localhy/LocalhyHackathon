import { supabase } from './supabase'

// Constants
export const REFERRAL_JOB_POSTING_COST = 10

// Types
export interface UserProfile {
  id: string
  name?: string
  bio?: string
  location?: string
  user_type?: string
  avatar_url?: string
  newsletter_opt_in?: boolean
  credits?: number
  fiat_balance?: number
  created_at?: string
  updated_at?: string
}

export interface Idea {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  price?: number
  views?: number
  likes?: number
  status?: string
  cover_image_url?: string
  problem_summary?: string
  solution_overview?: string
  tags?: string[]
  thumbnail_url?: string
  location?: string
  created_at?: string
  updated_at?: string
  user_profiles?: UserProfile
}

export interface ReferralJob {
  id: string
  user_id: string
  title: string
  business_name: string
  description: string
  commission: number
  commission_type?: string
  location: string
  category: string
  urgency?: string
  requirements?: string
  applicants_count?: number
  status?: string
  referral_type?: string
  logo_url?: string
  website?: string
  cta_text?: string
  terms?: string
  created_at?: string
  updated_at?: string
  user_profiles?: UserProfile
}

export interface Tool {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  type?: string
  price?: number
  download_url?: string
  downloads_count?: number
  rating?: number
  tags?: string[]
  featured?: boolean
  status?: string
  location?: string
  created_at?: string
  updated_at?: string
  user_profiles?: UserProfile
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type?: string
  read?: boolean
  action_url?: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read?: boolean
  created_at: string
}

export interface Conversation {
  id: string
  participant_1: string
  participant_2: string
  last_message_at?: string
  created_at?: string
}

export interface Comment {
  id: string
  idea_id: string
  user_id: string
  parent_id?: string
  content: string
  likes?: number
  created_at?: string
  updated_at?: string
  user_profiles?: UserProfile
}

export interface Transaction {
  id: string
  user_id: string
  type: string
  amount: number
  credits: number
  currency?: string
  description: string
  status?: string
  payment_method?: string
  payment_id?: string
  metadata?: any
  created_at?: string
  updated_at?: string
}

export interface Promotion {
  id: string
  user_id: string
  content_id: string
  content_type: string
  promotion_type: string
  cost_credits: number
  start_date: string
  end_date: string
  status: string
  views_gained?: number
  clicks_gained?: number
  metadata?: any
  created_at?: string
  updated_at?: string
}

// Helper function to get current user ID
const getCurrentUserId = () => {
  const { data: { user } } = supabase.auth.getUser()
  return user?.id
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
    .select('*')
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    return null
  }

  return data
}

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

// Ideas Functions
export const getIdeas = async (filters?: {
  category?: string
  location?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<Idea[]> => {
  let query = supabase
    .from('ideas')
    .select(`
      *,
      user_profiles!inner(name, avatar_url, user_type, bio)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.location) {
    query = query.eq('location', filters.location)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching ideas:', error)
    return []
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

  return {
    ...data,
    views: data.views + 1
  }
}

export const getUserIdeas = async (userId: string): Promise<Idea[]> => {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      user_profiles!inner(name, avatar_url, user_type, bio)
    `)
    .eq('user_id', userId)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user ideas:', error)
    return []
  }

  return data || []
}

export const updateIdea = async (id: string, updates: Partial<Idea>): Promise<Idea | null> => {
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
export const getReferralJobs = async (filters?: {
  category?: string
  location?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<ReferralJob[]> => {
  let query = supabase
    .from('referral_jobs')
    .select(`
      *,
      user_profiles!inner(name, avatar_url, user_type, bio)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.location) {
    query = query.eq('location', filters.location)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching referral jobs:', error)
    return []
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
    .select(`
      *,
      user_profiles!inner(name, avatar_url, user_type, bio)
    `)
    .eq('user_id', userId)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user referral jobs:', error)
    return []
  }

  return data || []
}

export const updateReferralJob = async (id: string, updates: Partial<ReferralJob>): Promise<ReferralJob | null> => {
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

// Tools Functions
export const getTools = async (filters?: {
  category?: string
  location?: string
  search?: string
  type?: string
  limit?: number
  offset?: number
}): Promise<Tool[]> => {
  let query = supabase
    .from('tools')
    .select(`
      *,
      user_profiles!inner(name, avatar_url, user_type, bio)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.location) {
    query = query.eq('location', filters.location)
  }

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching tools:', error)
    return []
  }

  return data || []
}

// Create Tool Function
export const createTool = async (toolData: {
  user_id: string
  title: string
  description: string
  category: string
  type: 'free' | 'paid' | 'premium'
  price: number
  download_url?: string
  tags?: string[]
  location?: string
}): Promise<Tool | null> => {
  const { data, error } = await supabase
    .from('tools')
    .insert(toolData)
    .select(`
      *,
      user_profiles!inner(name, avatar_url, user_type, bio)
    `)
    .single()

  if (error) {
    console.error('Error creating tool:', error)
    return null
  }

  return data
}

// Get Tool by ID Function
export const getToolById = async (id: string): Promise<Tool | null> => {
  const { data, error } = await supabase
    .from('tools')
    .select(`
      *,
      user_profiles!inner(name, avatar_url, user_type, bio)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching tool:', error)
    return null
  }

  if (!data) return null

  // Increment download count
  await supabase
    .from('tools')
    .update({ downloads_count: data.downloads_count + 1 })
    .eq('id', id)

  // Check for active promotion and increment views if found
  const activePromotion = await getActivePromotionForContent(id, 'tool')
  if (activePromotion) {
    await incrementPromotionViews(activePromotion.id)
  }

  return {
    ...data,
    downloads_count: data.downloads_count + 1 // Return incremented count
  }
}

// Update Tool Function
export const updateTool = async (id: string, updates: Partial<Tool>): Promise<Tool | null> => {
  const { data, error } = await supabase
    .from('tools')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      user_profiles!inner(name, avatar_url, user_type, bio)
    `)
    .single()

  if (error) {
    console.error('Error updating tool:', error)
    return null
  }

  return data
}

// Enhanced deleteTool function (mark as deleted instead of hard delete)
export const deleteTool = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('tools')
    .update({ status: 'deleted' })
    .eq('id', id)

  if (error) {
    console.error('Error deleting tool:', error)
    return false
  }

  return true
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

export const subscribeToUserNotifications = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`notifications:${userId}`)
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

// Messages Functions
export const createMessage = async (messageData: {
  conversation_id: string
  sender_id: string
  content: string
}): Promise<Message | null> => {
  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select('*')
    .single()

  if (error) {
    console.error('Error creating message:', error)
    return null
  }

  return data
}

export const subscribeToUserMessages = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`messages:${userId}`)
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

// Comments Functions
export const getIdeaComments = async (ideaId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user_profiles!inner(name, avatar_url, user_type, bio)
    `)
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  return data || []
}

export const createComment = async (commentData: {
  idea_id: string
  user_id: string
  parent_id?: string
  content: string
}): Promise<Comment | null> => {
  const { data, error } = await supabase
    .from('comments')
    .insert(commentData)
    .select(`
      *,
      user_profiles!inner(name, avatar_url, user_type, bio)
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

export const purchaseContent = async (purchaseData: {
  user_id: string
  content_id: string
  content_type: string
  price_paid: number
}): Promise<boolean> => {
  const { error } = await supabase
    .from('purchased_content')
    .insert(purchaseData)

  if (error) {
    console.error('Error purchasing content:', error)
    return false
  }

  return true
}

// File Upload Functions
export const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)

  if (error) {
    console.error('Error uploading file:', error)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return publicUrl
}

export const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}.${fileExt}`
  const filePath = `avatars/${fileName}`

  return uploadFile(file, 'avatars', filePath)
}

// Promotion Functions
export const getActivePromotionForContent = async (contentId: string, contentType: string): Promise<Promotion | null> => {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .eq('status', 'active')
    .lte('start_date', new Date().toISOString())
    .gte('end_date', new Date().toISOString())
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching active promotion:', error)
    return null
  }

  return data
}

export const incrementPromotionViews = async (promotionId: string): Promise<boolean> => {
  const { error } = await supabase.rpc('increment_promotion_views', { promotion_id: promotionId })

  if (error) {
    console.error('Error incrementing promotion views:', error)
    return false
  }

  return true
}

export const incrementPromotionClicks = async (promotionId: string): Promise<boolean> => {
  const { error } = await supabase.rpc('increment_promotion_clicks', { promotion_id: promotionId })

  if (error) {
    console.error('Error incrementing promotion clicks:', error)
    return false
  }

  return true
}