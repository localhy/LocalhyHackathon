import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Constants
export const REFERRAL_JOB_POSTING_COST = 10

// Helper function to get the current user's ID
export const getCurrentUserId = async () => {
  const { data } = await supabase.auth.getUser()
  return data?.user?.id
}

// Helper function to get the current user's ID from the auth context
export const uid = () => {
  const user = supabase.auth.getUser()
  return user.data?.user?.id
}

// User Profile Types
export interface UserProfile {
  id: string
  name: string
  bio?: string
  location?: string
  user_type?: 'business-owner' | 'referrer' | 'idea-creator' | 'other'
  avatar_url?: string
  newsletter_opt_in?: boolean
  created_at?: string
  updated_at?: string
  credits?: number
  fiat_balance?: number
  phone?: string
  website?: string
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
  paypal_email?: string
  free_credits?: number
  purchased_credits?: number
}

export interface UpdateUserProfileData {
  name?: string
  bio?: string
  location?: string
  user_type?: 'business-owner' | 'referrer' | 'idea-creator' | 'other'
  avatar_url?: string
  newsletter_opt_in?: boolean
  phone?: string
  website?: string
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
  paypal_email?: string
}

// Idea Types
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
  cover_image_url?: string
  problem_summary?: string
  solution_overview?: string
  tags?: string[]
  thumbnail_url?: string
  location?: string
  liked_by_user?: boolean
  bookmarked_by_user?: boolean
  user_profiles?: {
    name: string
    avatar_url?: string
    bio?: string
    user_type?: string
  }
  is_promoted?: boolean
}

export interface UpdateIdeaData {
  title?: string
  description?: string
  category?: string
  price?: number
  status?: 'active' | 'inactive' | 'deleted'
  cover_image_url?: string
  problem_summary?: string
  solution_overview?: string
  tags?: string[]
  thumbnail_url?: string
  location?: string
}

// Referral Job Types
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
  referral_type?: string
  logo_url?: string
  website?: string
  cta_text?: string
  terms?: string
  likes?: number
  liked_by_user?: boolean
  bookmarked_by_user?: boolean
  user_profiles?: {
    name: string
    avatar_url?: string
  }
  is_promoted?: boolean
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
  referral_type?: string
  logo_url?: string
  website?: string
  cta_text?: string
  terms?: string
}

// Tool Types
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
  status: 'active' | 'inactive' | 'pending' | 'deleted'
  created_at: string
  updated_at: string
  location?: string
  user_profiles?: {
    name: string
    avatar_url?: string
  }
  is_promoted?: boolean
}

// Comment Types
export interface Comment {
  id: string
  content_id: string
  user_id: string
  parent_id?: string
  content: string
  likes: number
  created_at: string
  updated_at: string
  content_type: 'idea' | 'referral_job' | 'tool' | 'business' | 'community_post'
  liked_by_user?: boolean
  user_profile?: {
    name: string
    avatar_url?: string
  }
}

export interface CreateCommentData {
  content_id: string
  user_id: string
  parent_id?: string
  content: string
  content_type: 'idea' | 'referral_job' | 'tool' | 'business' | 'community_post'
}

// Message Types
export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
}

export interface CreateMessageData {
  sender_id: string
  recipient_id: string
  content: string
  subject?: string
}

// Notification Types
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

// Business Profile Types
export interface BusinessProfile {
  id: string
  user_id: string
  business_name: string
  category: string
  city?: string
  state?: string
  country?: string
  description: string
  address?: string
  operating_hours?: Record<string, { open?: string, close?: string }>
  thumbnail_url: string
  cover_photo_url?: string
  gallery_urls?: string[]
  youtube_video_url?: string
  referral_reward_amount?: number
  referral_reward_type?: 'percentage' | 'fixed'
  referral_cta_link?: string
  promo_tagline?: string
  email: string
  phone?: string
  website?: string
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
  years_in_business?: number
  certifications_urls?: string[]
  customer_reviews?: Array<{ name: string, rating: number, text: string, date: string }>
  enable_referrals: boolean
  display_earnings_publicly: boolean
  enable_questions_comments: boolean
  status: 'pending' | 'active' | 'inactive'
  created_at: string
  updated_at: string
  user_profile?: {
    name: string
    avatar_url?: string
  }
}

// Community Post Types
export interface CommunityPost {
  id: string
  user_id: string
  content: string
  image_url?: string
  video_url?: string
  location?: string
  likes: number
  comments_count: number
  created_at: string
  updated_at: string
  user_name?: string
  user_avatar_url?: string
  user_type?: string
  liked_by_user?: boolean
}

// Transaction Types
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
  metadata?: any
  created_at: string
  updated_at: string
  withdrawal_method?: string
  withdrawal_details?: any
}

// Promotion Types
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

export const updateUserProfile = async (userId: string, updates: UpdateUserProfileData): Promise<UserProfile | null> => {
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

export const uploadAvatar = async (userId: string, file: File): Promise<string | null> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('user-avatars')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError)
    return null
  }

  const { data } = supabase.storage
    .from('user-avatars')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export const subscribeToUserProfile = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`user-profile-${userId}`)
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

// Idea Functions
export const getIdeas = async (limit: number, offset: number, userId?: string, location?: string): Promise<Idea[]> => {
  let query = supabase
    .from('ideas')
    .select(`
      *,
      user_profiles (
        name,
        avatar_url,
        bio,
        user_type
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (location) {
    query = query.ilike('location', `%${location}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching ideas:', error)
    return []
  }

  // If user is logged in, check if they've liked or bookmarked each idea
  if (userId) {
    const ideas = await Promise.all(data.map(async (idea) => {
      // Check if user has liked this idea
      const { data: likeData } = await supabase
        .from('idea_likes')
        .select('id')
        .eq('idea_id', idea.id)
        .eq('user_id', userId)
        .single()

      // Check if user has bookmarked this idea
      const { data: bookmarkData } = await supabase
        .from('idea_bookmarks')
        .select('id')
        .eq('idea_id', idea.id)
        .eq('user_id', userId)
        .single()

      // Check if idea has an active promotion
      const { data: promotionData } = await supabase
        .from('promotions')
        .select('id')
        .eq('content_id', idea.id)
        .eq('content_type', 'idea')
        .eq('status', 'active')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .single()

      return {
        ...idea,
        liked_by_user: !!likeData,
        bookmarked_by_user: !!bookmarkData,
        is_promoted: !!promotionData
      }
    }))

    return ideas
  }

  return data
}

export const getIdeaById = async (ideaId: string, userId?: string): Promise<Idea | null> => {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      user_profiles (
        name,
        avatar_url,
        bio,
        user_type
      )
    `)
    .eq('id', ideaId)
    .single()

  if (error) {
    console.error('Error fetching idea:', error)
    return null
  }

  // Increment view count
  await supabase.rpc('increment_idea_views', { idea_id: ideaId })

  // If user is logged in, check if they've liked or bookmarked this idea
  if (userId) {
    // Check if user has liked this idea
    const { data: likeData } = await supabase
      .from('idea_likes')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .single()

    // Check if user has bookmarked this idea
    const { data: bookmarkData } = await supabase
      .from('idea_bookmarks')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .single()

    // Check if idea has an active promotion
    const { data: promotionData } = await supabase
      .from('promotions')
      .select('id')
      .eq('content_id', ideaId)
      .eq('content_type', 'idea')
      .eq('status', 'active')
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .single()

    return {
      ...data,
      liked_by_user: !!likeData,
      bookmarked_by_user: !!bookmarkData,
      is_promoted: !!promotionData
    }
  }

  return data
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

  return data
}

export const createIdea = async (idea: Omit<Idea, 'id' | 'views' | 'likes' | 'created_at' | 'updated_at'>): Promise<Idea | null> => {
  const { data, error } = await supabase
    .from('ideas')
    .insert(idea)
    .select()
    .single()

  if (error) {
    console.error('Error creating idea:', error)
    return null
  }

  return data
}

export const updateIdea = async (ideaId: string, updates: UpdateIdeaData): Promise<Idea | null> => {
  const { data, error } = await supabase
    .from('ideas')
    .update(updates)
    .eq('id', ideaId)
    .select()
    .single()

  if (error) {
    console.error('Error updating idea:', error)
    return null
  }

  return data
}

export const deleteIdea = async (ideaId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('ideas')
    .delete()
    .eq('id', ideaId)

  if (error) {
    console.error('Error deleting idea:', error)
    return false
  }

  return true
}

export const likeIdea = async (ideaId: string, userId: string): Promise<boolean> => {
  // Check if user has already liked this idea
  const { data: existingLike } = await supabase
    .from('idea_likes')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', userId)
    .single()

  if (existingLike) {
    // User has already liked this idea, so unlike it
    const { error } = await supabase
      .from('idea_likes')
      .delete()
      .eq('id', existingLike.id)

    if (error) {
      console.error('Error unliking idea:', error)
      return false
    }

    // Decrement like count
    await supabase.rpc('decrement_idea_likes', { idea_id: ideaId })

    return true
  } else {
    // User hasn't liked this idea yet, so like it
    const { error } = await supabase
      .from('idea_likes')
      .insert({
        idea_id: ideaId,
        user_id: userId
      })

    if (error) {
      console.error('Error liking idea:', error)
      return false
    }

    // Increment like count
    await supabase.rpc('increment_idea_likes', { idea_id: ideaId })

    return true
  }
}

export const bookmarkIdea = async (ideaId: string, userId: string): Promise<boolean> => {
  // Check if user has already bookmarked this idea
  const { data: existingBookmark } = await supabase
    .from('idea_bookmarks')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', userId)
    .single()

  if (existingBookmark) {
    // User has already bookmarked this idea, so remove the bookmark
    const { error } = await supabase
      .from('idea_bookmarks')
      .delete()
      .eq('id', existingBookmark.id)

    if (error) {
      console.error('Error removing bookmark:', error)
      return false
    }

    return true
  } else {
    // User hasn't bookmarked this idea yet, so add a bookmark
    const { error } = await supabase
      .from('idea_bookmarks')
      .insert({
        idea_id: ideaId,
        user_id: userId
      })

    if (error) {
      console.error('Error bookmarking idea:', error)
      return false
    }

    return true
  }
}

// Referral Job Functions
export const getReferralJobs = async (limit: number, offset: number, userId?: string, location?: string): Promise<ReferralJob[]> => {
  let query = supabase
    .from('referral_jobs')
    .select(`
      *,
      user_profiles (
        name,
        avatar_url
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (location) {
    query = query.ilike('location', `%${location}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching referral jobs:', error)
    return []
  }

  // If user is logged in, check if they've liked each job
  if (userId) {
    const jobs = await Promise.all(data.map(async (job) => {
      // Check if user has liked this job
      const { data: likeData } = await supabase
        .from('referral_job_likes')
        .select('id')
        .eq('referral_job_id', job.id)
        .eq('user_id', userId)
        .single()

      // Check if job has an active promotion
      const { data: promotionData } = await supabase
        .from('promotions')
        .select('id')
        .eq('content_id', job.id)
        .eq('content_type', 'referral_job')
        .eq('status', 'active')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .single()

      return {
        ...job,
        liked_by_user: !!likeData,
        is_promoted: !!promotionData
      }
    }))

    return jobs
  }

  return data
}

export const getReferralJobById = async (jobId: string, userId?: string): Promise<ReferralJob | null> => {
  const { data, error } = await supabase
    .from('referral_jobs')
    .select(`
      *,
      user_profiles (
        name,
        avatar_url
      )
    `)
    .eq('id', jobId)
    .single()

  if (error) {
    console.error('Error fetching referral job:', error)
    return null
  }

  // If user is logged in, check if they've liked this job
  if (userId) {
    // Check if user has liked this job
    const { data: likeData } = await supabase
      .from('referral_job_likes')
      .select('id')
      .eq('referral_job_id', jobId)
      .eq('user_id', userId)
      .single()

    // Check if job has an active promotion
    const { data: promotionData } = await supabase
      .from('promotions')
      .select('id')
      .eq('content_id', jobId)
      .eq('content_type', 'referral_job')
      .eq('status', 'active')
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .single()

    return {
      ...data,
      liked_by_user: !!likeData,
      is_promoted: !!promotionData
    }
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

  return data
}

export const createReferralJob = async (job: Omit<ReferralJob, 'id' | 'applicants_count' | 'created_at' | 'updated_at'>): Promise<ReferralJob | null> => {
  const { data, error } = await supabase
    .from('referral_jobs')
    .insert(job)
    .select()
    .single()

  if (error) {
    console.error('Error creating referral job:', error)
    return null
  }

  return data
}

export const updateReferralJob = async (jobId: string, updates: UpdateReferralJobData): Promise<ReferralJob | null> => {
  const { data, error } = await supabase
    .from('referral_jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single()

  if (error) {
    console.error('Error updating referral job:', error)
    return null
  }

  return data
}

export const deleteReferralJob = async (jobId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('referral_jobs')
    .delete()
    .eq('id', jobId)

  if (error) {
    console.error('Error deleting referral job:', error)
    return false
  }

  return true
}

export const likeReferralJob = async (jobId: string, userId: string): Promise<boolean> => {
  // Check if user has already liked this job
  const { data: existingLike } = await supabase
    .from('referral_job_likes')
    .select('id')
    .eq('referral_job_id', jobId)
    .eq('user_id', userId)
    .single()

  if (existingLike) {
    // User has already liked this job, so unlike it
    const { error } = await supabase
      .from('referral_job_likes')
      .delete()
      .eq('id', existingLike.id)

    if (error) {
      console.error('Error unliking referral job:', error)
      return false
    }

    // Decrement like count
    await supabase.rpc('decrement_referral_job_likes', { job_id: jobId })

    return true
  } else {
    // User hasn't liked this job yet, so like it
    const { error } = await supabase
      .from('referral_job_likes')
      .insert({
        referral_job_id: jobId,
        user_id: userId
      })

    if (error) {
      console.error('Error liking referral job:', error)
      return false
    }

    // Increment like count
    await supabase.rpc('increment_referral_job_likes', { job_id: jobId })

    return true
  }
}

// Tool Functions
export const getTools = async (limit: number, offset: number): Promise<Tool[]> => {
  const { data, error } = await supabase
    .from('tools')
    .select(`
      *,
      user_profiles (
        name,
        avatar_url
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching tools:', error)
    return []
  }

  // Check if tools have active promotions
  const toolsWithPromotions = await Promise.all(data.map(async (tool) => {
    // Check if tool has an active promotion
    const { data: promotionData } = await supabase
      .from('promotions')
      .select('id')
      .eq('content_id', tool.id)
      .eq('content_type', 'tool')
      .eq('status', 'active')
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .single()

    return {
      ...tool,
      is_promoted: !!promotionData
    }
  }))

  return toolsWithPromotions
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

  return data
}

export const createTool = async (tool: Omit<Tool, 'id' | 'downloads_count' | 'rating' | 'created_at' | 'updated_at'>): Promise<Tool | null> => {
  const { data, error } = await supabase
    .from('tools')
    .insert(tool)
    .select()
    .single()

  if (error) {
    console.error('Error creating tool:', error)
    return null
  }

  return data
}

export const updateTool = async (toolId: string, updates: Partial<Tool>): Promise<Tool | null> => {
  const { data, error } = await supabase
    .from('tools')
    .update(updates)
    .eq('id', toolId)
    .select()
    .single()

  if (error) {
    console.error('Error updating tool:', error)
    return null
  }

  return data
}

export const deleteTool = async (toolId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('tools')
    .delete()
    .eq('id', toolId)

  if (error) {
    console.error('Error deleting tool:', error)
    return false
  }

  return true
}

// Comment Functions
export const getCommentsByContent = async (contentId: string, contentType: string, userId?: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user_profile:user_profiles (
        name,
        avatar_url
      )
    `)
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  // If user is logged in, check if they've liked each comment
  if (userId) {
    const commentsWithLikes = await Promise.all(data.map(async (comment) => {
      // Check if user has liked this comment
      const { data: likeData } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', comment.id)
        .eq('user_id', userId)
        .single()

      return {
        ...comment,
        liked_by_user: !!likeData
      }
    }))

    return commentsWithLikes
  }

  return data
}

export const createComment = async (comment: CreateCommentData): Promise<Comment | null> => {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select(`
      *,
      user_profile:user_profiles (
        name,
        avatar_url
      )
    `)
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    return null
  }

  // Increment comment count on the content
  if (comment.content_type === 'idea') {
    // For ideas, we don't track comment count in the table
  } else if (comment.content_type === 'referral_job') {
    // For referral jobs, we don't track comment count in the table
  } else if (comment.content_type === 'community_post') {
    await supabase.rpc('increment_community_post_comments', { post_id: comment.content_id })
  }

  return {
    ...data,
    liked_by_user: false
  }
}

export const likeComment = async (commentId: string, userId: string): Promise<boolean> => {
  // Check if user has already liked this comment
  const { data: existingLike } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .single()

  if (existingLike) {
    // User has already liked this comment, so unlike it
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('id', existingLike.id)

    if (error) {
      console.error('Error unliking comment:', error)
      return false
    }

    // Decrement like count
    await supabase.rpc('decrement_comment_likes', { comment_id: commentId })

    return true
  } else {
    // User hasn't liked this comment yet, so like it
    const { error } = await supabase
      .from('comment_likes')
      .insert({
        comment_id: commentId,
        user_id: userId
      })

    if (error) {
      console.error('Error liking comment:', error)
      return false
    }

    // Increment like count
    await supabase.rpc('increment_comment_likes', { comment_id: commentId })

    return true
  }
}

// Message Functions
export const createMessage = async (message: CreateMessageData): Promise<Message | null> => {
  // First, check if a conversation exists between these users
  const { data: existingConversation } = await supabase
    .from('conversations')
    .select('id')
    .or(`participant_1.eq.${message.sender_id},participant_2.eq.${message.sender_id}`)
    .or(`participant_1.eq.${message.recipient_id},participant_2.eq.${message.recipient_id}`)
    .single()

  let conversationId: string

  if (existingConversation) {
    // Use existing conversation
    conversationId = existingConversation.id
  } else {
    // Create a new conversation
    const { data: newConversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        participant_1: message.sender_id,
        participant_2: message.recipient_id
      })
      .select()
      .single()

    if (conversationError) {
      console.error('Error creating conversation:', conversationError)
      return null
    }

    conversationId = newConversation.id
  }

  // Now create the message
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: message.sender_id,
      content: message.content
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating message:', error)
    return null
  }

  // Update the conversation's last_message_at timestamp
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)

  // Create a notification for the recipient
  await supabase
    .from('notifications')
    .insert({
      user_id: message.recipient_id,
      title: message.subject || 'New Message',
      message: `You have a new message from ${message.sender_id}`,
      type: 'info',
      action_url: '/dashboard/messages'
    })

  return data
}

export const subscribeToUserMessages = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`user-messages-${userId}`)
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
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participant_1=eq.${userId}`
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participant_2=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

// Notification Functions
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

  return data
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
    .channel(`user-notifications-${userId}`)
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

// Business Profile Functions
export const getBusinessProfileById = async (businessId: string): Promise<BusinessProfile | null> => {
  const { data, error } = await supabase
    .from('business_profiles')
    .select(`
      *,
      user_profile:user_profiles (
        name,
        avatar_url
      )
    `)
    .eq('id', businessId)
    .single()

  if (error) {
    console.error('Error fetching business profile:', error)
    return null
  }

  return data
}

export const getUserBusinessProfiles = async (userId: string): Promise<BusinessProfile[]> => {
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user business profiles:', error)
    return []
  }

  return data
}

export const userHasBusinessProfile = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('business_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (error) {
    return false
  }

  return !!data
}

// Community Post Functions
export const getCommunityPosts = async (limit: number, offset: number, userId?: string, location?: string): Promise<CommunityPost[]> => {
  let query = supabase
    .from('community_posts')
    .select(`
      *,
      user_profiles (
        name,
        avatar_url,
        user_type
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (location) {
    query = query.ilike('location', `%${location}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching community posts:', error)
    return []
  }

  // Format posts with user info
  const formattedPosts = data.map(post => ({
    ...post,
    user_name: post.user_profiles?.name || 'Anonymous',
    user_avatar_url: post.user_profiles?.avatar_url,
    user_type: post.user_profiles?.user_type
  }))

  // If user is logged in, check if they've liked each post
  if (userId) {
    const postsWithLikes = await Promise.all(formattedPosts.map(async (post) => {
      // Check if user has liked this post
      const { data: likeData } = await supabase
        .from('community_post_likes')
        .select('id')
        .eq('community_post_id', post.id)
        .eq('user_id', userId)
        .single()

      return {
        ...post,
        liked_by_user: !!likeData
      }
    }))

    return postsWithLikes
  }

  return formattedPosts
}

export const createCommunityPost = async (post: { user_id: string, content: string, location?: string, image_url?: string, video_url?: string }): Promise<CommunityPost | null> => {
  const { data, error } = await supabase
    .from('community_posts')
    .insert(post)
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
    console.error('Error creating community post:', error)
    return null
  }

  // Format post with user info
  return {
    ...data,
    user_name: data.user_profiles?.name || 'Anonymous',
    user_avatar_url: data.user_profiles?.avatar_url,
    user_type: data.user_profiles?.user_type,
    liked_by_user: false
  }
}

export const likeCommunityPost = async (postId: string, userId: string): Promise<boolean> => {
  // Check if user has already liked this post
  const { data: existingLike } = await supabase
    .from('community_post_likes')
    .select('id')
    .eq('community_post_id', postId)
    .eq('user_id', userId)
    .single()

  if (existingLike) {
    // User has already liked this post, so unlike it
    const { error } = await supabase
      .from('community_post_likes')
      .delete()
      .eq('id', existingLike.id)

    if (error) {
      console.error('Error unliking community post:', error)
      return false
    }

    // Decrement like count
    await supabase.rpc('decrement_community_post_likes', { post_id: postId })

    return true
  } else {
    // User hasn't liked this post yet, so like it
    const { error } = await supabase
      .from('community_post_likes')
      .insert({
        community_post_id: postId,
        user_id: userId
      })

    if (error) {
      console.error('Error liking community post:', error)
      return false
    }

    // Increment like count
    await supabase.rpc('increment_community_post_likes', { post_id: postId })

    return true
  }
}

// File Upload Functions
export const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    return null
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}

// Wallet and Transaction Functions
export const getUserCredits = async (userId: string): Promise<{ cashCredits: number, freeCredits: number, purchasedCredits: number, fiatBalance: number }> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('credits, free_credits, purchased_credits, fiat_balance')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user credits:', error)
    return { cashCredits: 0, freeCredits: 0, purchasedCredits: 0, fiatBalance: 0 }
  }

  return {
    cashCredits: data.credits || 0,
    freeCredits: data.free_credits || 0,
    purchasedCredits: data.purchased_credits || 0,
    fiatBalance: data.fiat_balance || 0
  }
}

export const getUserTransactions = async (userId: string, limit: number): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching user transactions:', error)
    return []
  }

  return data
}

export const transferCreditsToFiatBalance = async (userId: string, amount: number): Promise<boolean> => {
  // Check if user has enough credits
  const { data: user } = await supabase
    .from('user_profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  if (!user || user.credits < amount) {
    throw new Error('Insufficient credits')
  }

  // Start a transaction to ensure atomicity
  const { data, error } = await supabase.rpc('convert_credits_to_fiat', {
    p_user_id: userId,
    p_amount: amount
  })

  if (error) {
    console.error('Error converting credits to fiat:', error)
    return false
  }

  return true
}

export const processWithdrawalWithPaypal = async (userId: string, amount: number, paypalEmail: string): Promise<boolean> => {
  // Check if user has enough fiat balance
  const { data: user } = await supabase
    .from('user_profiles')
    .select('fiat_balance')
    .eq('id', userId)
    .single()

  if (!user || user.fiat_balance < amount) {
    throw new Error('Insufficient balance')
  }

  // Create a withdrawal transaction
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'withdrawal',
      amount: amount,
      credits: 0, // No credits involved in withdrawal
      currency: 'USD',
      description: `Withdrawal to PayPal (${paypalEmail})`,
      status: 'pending',
      payment_method: 'PayPal',
      withdrawal_method: 'PayPal',
      withdrawal_details: { email: paypalEmail }
    })

  if (transactionError) {
    console.error('Error creating withdrawal transaction:', transactionError)
    return false
  }

  // Deduct the amount from user's fiat balance
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ fiat_balance: user.fiat_balance - amount })
    .eq('id', userId)

  if (updateError) {
    console.error('Error updating user fiat balance:', updateError)
    return false
  }

  // Create a notification for the user
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: 'Withdrawal Request Received',
      message: `Your withdrawal request for $${amount} to PayPal has been received and is being processed.`,
      type: 'info'
    })

  return true
}

export const hasUserPurchasedContent = async (userId: string, contentId: string, contentType: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('purchased_content')
    .select('id')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .single()

  if (error) {
    // If error is not found, user hasn't purchased
    if (error.code === 'PGRST116') {
      return false
    }
    console.error('Error checking purchase status:', error)
    return false
  }

  return !!data
}

export const purchaseContent = async (
  userId: string,
  creatorId: string,
  contentId: string,
  contentType: string,
  price: number
): Promise<boolean> => {
  // Check if user has already purchased this content
  const alreadyPurchased = await hasUserPurchasedContent(userId, contentId, contentType)
  if (alreadyPurchased) {
    throw new Error('You have already purchased this content')
  }

  // Check if user has enough credits
  const { data: user } = await supabase
    .from('user_profiles')
    .select('credits, purchased_credits')
    .eq('id', userId)
    .single()

  if (!user) {
    throw new Error('User not found')
  }

  const totalCredits = user.credits + user.purchased_credits
  if (totalCredits < price) {
    throw new Error('Insufficient credits')
  }

  // Determine which credits to use (purchased first, then earned)
  let purchasedCreditsToUse = Math.min(user.purchased_credits, price)
  let earnedCreditsToUse = price - purchasedCreditsToUse

  // Start a transaction to ensure atomicity
  const { data, error } = await supabase.rpc('purchase_content', {
    p_user_id: userId,
    p_creator_id: creatorId,
    p_content_id: contentId,
    p_content_type: contentType,
    p_price: price,
    p_purchased_credits_to_use: purchasedCreditsToUse,
    p_earned_credits_to_use: earnedCreditsToUse
  })

  if (error) {
    console.error('Error purchasing content:', error)
    return false
  }

  return true
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

  if (error) {
    if (error.code !== 'PGRST116') { // Not found error
      console.error('Error fetching promotion:', error)
    }
    return null
  }

  return data
}

export const incrementPromotionViews = async (promotionId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('promotions')
    .update({ views_gained: supabase.rpc('increment', { row_id: promotionId, column_name: 'views_gained' }) })
    .eq('id', promotionId)

  if (error) {
    console.error('Error incrementing promotion views:', error)
    return false
  }

  return true
}

export const incrementPromotionClicks = async (promotionId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('promotions')
    .update({ clicks_gained: supabase.rpc('increment', { row_id: promotionId, column_name: 'clicks_gained' }) })
    .eq('id', promotionId)

  if (error) {
    console.error('Error incrementing promotion clicks:', error)
    return false
  }

  return true
}

// Credit transfer function
export const transferUserCredits = async (
  senderId: string,
  recipientIdentifier: string, // Can be email or user ID
  amount: number
): Promise<boolean> => {
  // Check if sender has enough credits
  const { data: sender } = await supabase
    .from('user_profiles')
    .select('credits')
    .eq('id', senderId)
    .single()

  if (!sender || sender.credits < amount) {
    throw new Error('Insufficient credits')
  }

  // Find recipient by email or ID
  let recipientId: string
  
  // Check if recipientIdentifier is an email
  if (recipientIdentifier.includes('@')) {
    // Look up user by email
    const { data: userData } = await supabase.auth.admin.getUserByEmail(recipientIdentifier)
    
    if (!userData || !userData.user) {
      throw new Error('Recipient not found')
    }
    
    recipientId = userData.user.id
  } else {
    // Assume it's a user ID
    const { data: recipient } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', recipientIdentifier)
      .single()
      
    if (!recipient) {
      throw new Error('Recipient not found')
    }
    
    recipientId = recipient.id
  }
  
  // Don't allow transfers to self
  if (senderId === recipientId) {
    throw new Error('Cannot transfer credits to yourself')
  }

  // Start a transaction to ensure atomicity
  const { data, error } = await supabase.rpc('transfer_credits', {
    p_sender_id: senderId,
    p_recipient_id: recipientId,
    p_amount: amount
  })

  if (error) {
    console.error('Error transferring credits:', error)
    return false
  }

  return true
}