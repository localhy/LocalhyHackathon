import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

// Types
export interface UserProfile {
  id: string
  name: string
  bio?: string
  location?: string
  user_type?: string
  avatar_url?: string
  newsletter_opt_in?: boolean
  created_at?: string
  updated_at?: string
  credits?: number
  free_credits?: number
  fiat_balance?: number
  phone?: string
  website?: string
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
  paypal_email?: string
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
  liked_by_user?: boolean
  bookmarked_by_user?: boolean
  is_promoted?: boolean
  user_profiles?: {
    name: string
    avatar_url?: string
    user_type?: string
    bio?: string
  }
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
  likes?: number
  liked_by_user?: boolean
  bookmarked_by_user?: boolean
  is_promoted?: boolean
  user_profiles?: {
    name: string
    avatar_url?: string
    user_type?: string
    bio?: string
  }
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
  is_promoted?: boolean
  user_profiles?: {
    name: string
    avatar_url?: string
    user_type?: string
    bio?: string
  }
}

export interface Comment {
  id: string
  content_id: string
  content_type: string
  user_id: string
  parent_id?: string
  content: string
  likes: number
  created_at: string
  updated_at: string
  liked_by_user?: boolean
  user_profile?: {
    name: string
    avatar_url?: string
    user_type?: string
  }
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
  views_gained: number
  clicks_gained: number
  metadata?: any
  created_at: string
  updated_at: string
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
  metadata?: any
  created_at: string
  updated_at: string
  withdrawal_method?: string
  withdrawal_details?: any
}

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
  customer_reviews?: Array<{
    name: string
    rating: number
    text: string
    date: string
  }>
  enable_referrals: boolean
  display_earnings_publicly: boolean
  enable_questions_comments: boolean
  status: 'pending' | 'active' | 'inactive'
  created_at: string
  updated_at: string
  user_profile?: {
    name: string
    avatar_url?: string
    user_type?: string
  }
}

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
  liked_by_user?: boolean
  user_profiles?: {
    name: string
    avatar_url?: string
    user_type?: string
  }
}

export interface FeaturedOpportunity {
  id: string
  type: 'idea' | 'referral' | 'business'
  title: string
  author?: string
  business?: string
  category?: string
  commission?: number
  commission_type?: string
  location?: string
  created_at: string
  thumbnail_url?: string
}

export interface WalletStats {
  cashCredits: number
  freeCredits: number
  fiatBalance: number
  totalEarnings: number
  totalSpent: number
  pendingWithdrawals: number
  recentTransactions: Transaction[]
}

// Constants
export const REFERRAL_JOB_POSTING_COST = 5

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
    throw error
  }

  return data
}

export const uploadAvatar = async (userId: string, file: File): Promise<string | null> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('user-content')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError)
    throw uploadError
  }

  const { data } = supabase.storage
    .from('user-content')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`
  const filePath = `${bucket}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('user-content')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    throw uploadError
  }

  const { data } = supabase.storage
    .from('user-content')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export const getUserCredits = async (userId: string): Promise<{ cashCredits: number, freeCredits: number }> => {
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
    cashCredits: data.credits || 0,
    freeCredits: data.free_credits || 0
  }
}

// Wallet Functions
export const getWalletStats = async (userId: string): Promise<WalletStats> => {
  try {
    // Get user profile with credits and fiat balance
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits, free_credits, fiat_balance')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile for wallet stats:', profileError)
      throw profileError
    }

    // Get recent transactions (last 10)
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (transactionsError) {
      console.error('Error fetching transactions for wallet stats:', transactionsError)
    }

    // Calculate total earnings (credit_earning, credit_transfer_received)
    const { data: earningsData, error: earningsError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .in('type', ['credit_earning', 'credit_transfer_received'])

    // Calculate total spent (credit_usage, credit_purchase, credit_transfer_sent)
    const { data: spentData, error: spentError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .in('type', ['credit_usage', 'credit_purchase', 'credit_transfer_sent'])

    // Calculate pending withdrawals
    const { data: pendingData, error: pendingError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'withdrawal')
      .eq('status', 'pending')

    const totalEarnings = earningsData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const totalSpent = spentData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const pendingWithdrawals = pendingData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0

    return {
      cashCredits: profile?.credits || 0,
      freeCredits: profile?.free_credits || 0,
      fiatBalance: Number(profile?.fiat_balance) || 0,
      totalEarnings,
      totalSpent,
      pendingWithdrawals,
      recentTransactions: transactions || []
    }
  } catch (error) {
    console.error('Error fetching wallet stats:', error)
    return {
      cashCredits: 0,
      freeCredits: 0,
      fiatBalance: 0,
      totalEarnings: 0,
      totalSpent: 0,
      pendingWithdrawals: 0,
      recentTransactions: []
    }
  }
}

// Transaction Functions
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

  return data
}

// Ideas Functions
export const getIdeas = async (limit: number, offset: number, userId?: string): Promise<Idea[]> => {
  let query = supabase
    .from('ideas')
    .select(`
      *,
      user_profiles (
        name,
        avatar_url,
        user_type
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching ideas:', error)
    return []
  }

  // If userId is provided, check if the user has liked or bookmarked each idea
  if (userId) {
    const ideas = data as Idea[]
    
    // Get all idea IDs
    const ideaIds = ideas.map(idea => idea.id)
    
    // Check likes
    const { data: likes } = await supabase
      .from('idea_likes')
      .select('idea_id')
      .eq('user_id', userId)
      .in('idea_id', ideaIds)
    
    // Check bookmarks
    const { data: bookmarks } = await supabase
      .from('idea_bookmarks')
      .select('idea_id')
      .eq('user_id', userId)
      .in('idea_id', ideaIds)
    
    // Check promotions
    const { data: promotions } = await supabase
      .from('promotions')
      .select('content_id')
      .eq('content_type', 'idea')
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .in('content_id', ideaIds)
    
    // Create sets for faster lookups
    const likedIdeaIds = new Set(likes?.map(like => like.idea_id) || [])
    const bookmarkedIdeaIds = new Set(bookmarks?.map(bookmark => bookmark.idea_id) || [])
    const promotedIdeaIds = new Set(promotions?.map(promo => promo.content_id) || [])
    
    // Add liked_by_user and bookmarked_by_user flags to each idea
    return ideas.map(idea => ({
      ...idea,
      liked_by_user: likedIdeaIds.has(idea.id),
      bookmarked_by_user: bookmarkedIdeaIds.has(idea.id),
      is_promoted: promotedIdeaIds.has(idea.id)
    }))
  }

  return data as Idea[]
}

export const getIdeaById = async (id: string, userId?: string): Promise<Idea | null> => {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      user_profiles (
        name,
        avatar_url,
        user_type,
        bio
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching idea:', error)
    return null
  }

  // Increment view count
  await supabase.rpc('increment_idea_views', { p_idea_id: id })

  // If userId is provided, check if the user has liked or bookmarked the idea
  if (userId) {
    // Check if user has liked the idea
    const { data: like } = await supabase
      .from('idea_likes')
      .select('id')
      .eq('idea_id', id)
      .eq('user_id', userId)
      .maybeSingle()
    
    // Check if user has bookmarked the idea
    const { data: bookmark } = await supabase
      .from('idea_bookmarks')
      .select('id')
      .eq('idea_id', id)
      .eq('user_id', userId)
      .maybeSingle()
    
    // Check if idea is promoted
    const { data: promotion } = await supabase
      .from('promotions')
      .select('id')
      .eq('content_id', id)
      .eq('content_type', 'idea')
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .maybeSingle()
    
    return {
      ...data,
      liked_by_user: !!like,
      bookmarked_by_user: !!bookmark,
      is_promoted: !!promotion
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

export const updateIdea = async (id: string, updates: UpdateIdeaData): Promise<Idea | null> => {
  const { data, error } = await supabase
    .from('ideas')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating idea:', error)
    throw error
  }

  return data
}

export interface UpdateIdeaData {
  title?: string
  description?: string
  category?: string
  price?: number
  status?: string
  cover_image_url?: string
  problem_summary?: string
  solution_overview?: string
  tags?: string[]
  thumbnail_url?: string
  location?: string
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

export const likeIdea = async (ideaId: string, userId: string): Promise<boolean> => {
  // Check if user has already liked the idea
  const { data: existingLike } = await supabase
    .from('idea_likes')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingLike) {
    // Unlike the idea
    const { error } = await supabase
      .from('idea_likes')
      .delete()
      .eq('id', existingLike.id)

    if (error) {
      console.error('Error unliking idea:', error)
      return false
    }

    // Decrement like count
    await supabase.rpc('decrement_idea_likes', { p_idea_id: ideaId })
    
    return true
  } else {
    // Like the idea
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
    await supabase.rpc('increment_idea_likes', { p_idea_id: ideaId })
    
    return true
  }
}

export const bookmarkIdea = async (ideaId: string, userId: string): Promise<boolean> => {
  // Check if user has already bookmarked the idea
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
      .eq('id', existingBookmark.id)

    if (error) {
      console.error('Error removing bookmark:', error)
      return false
    }
    
    return true
  } else {
    // Add bookmark
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

// Referral Jobs Functions
export const getReferralJobs = async (limit: number, offset: number, userId?: string): Promise<ReferralJob[]> => {
  let query = supabase
    .from('referral_jobs')
    .select(`
      *,
      user_profiles (
        name,
        avatar_url,
        user_type
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching referral jobs:', error)
    return []
  }

  // If userId is provided, check if the user has liked or bookmarked each job
  if (userId) {
    const jobs = data as ReferralJob[]
    
    // Get all job IDs
    const jobIds = jobs.map(job => job.id)
    
    // Check likes
    const { data: likes } = await supabase
      .from('referral_job_likes')
      .select('referral_job_id')
      .eq('user_id', userId)
      .in('referral_job_id', jobIds)
    
    // Check promotions
    const { data: promotions } = await supabase
      .from('promotions')
      .select('content_id')
      .eq('content_type', 'referral_job')
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .in('content_id', jobIds)
    
    // Create sets for faster lookups
    const likedJobIds = new Set(likes?.map(like => like.referral_job_id) || [])
    const promotedJobIds = new Set(promotions?.map(promo => promo.content_id) || [])
    
    // Add liked_by_user flag to each job
    return jobs.map(job => ({
      ...job,
      liked_by_user: likedJobIds.has(job.id),
      is_promoted: promotedJobIds.has(job.id)
    }))
  }

  return data as ReferralJob[]
}

export const getReferralJobById = async (id: string, userId?: string): Promise<ReferralJob | null> => {
  const { data, error } = await supabase
    .from('referral_jobs')
    .select(`
      *,
      user_profiles (
        name,
        avatar_url,
        user_type,
        bio
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching referral job:', error)
    return null
  }

  // If userId is provided, check if the user has liked the job
  if (userId) {
    // Check if user has liked the job
    const { data: like } = await supabase
      .from('referral_job_likes')
      .select('id')
      .eq('referral_job_id', id)
      .eq('user_id', userId)
      .maybeSingle()
    
    // Check if job is promoted
    const { data: promotion } = await supabase
      .from('promotions')
      .select('id')
      .eq('content_id', id)
      .eq('content_type', 'referral_job')
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .maybeSingle()
    
    return {
      ...data,
      liked_by_user: !!like,
      is_promoted: !!promotion
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

export const createReferralJobWithPayment = async (jobData: {
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
}): Promise<ReferralJob | null> => {
  // Call the stored procedure to create the job and handle payment
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
    p_requirements: jobData.requirements || null,
    p_referral_type: jobData.referral_type || null,
    p_logo_url: jobData.logo_url || null,
    p_website: jobData.website || null,
    p_cta_text: jobData.cta_text || null,
    p_terms: jobData.terms || null,
    p_cost_credits: REFERRAL_JOB_POSTING_COST
  })

  if (error) {
    console.error('Error creating referral job:', error)
    throw error
  }

  // Fetch the created job
  if (data && data.id) {
    const { data: job } = await supabase
      .from('referral_jobs')
      .select('*')
      .eq('id', data.id)
      .single()
    
    return job
  }

  return null
}

export const updateReferralJob = async (id: string, updates: Partial<ReferralJob>): Promise<ReferralJob | null> => {
  const { data, error } = await supabase
    .from('referral_jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating referral job:', error)
    throw error
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

export const likeReferralJob = async (jobId: string, userId: string): Promise<boolean> => {
  // Check if user has already liked the job
  const { data: existingLike } = await supabase
    .from('referral_job_likes')
    .select('id')
    .eq('referral_job_id', jobId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingLike) {
    // Unlike the job
    const { error } = await supabase
      .from('referral_job_likes')
      .delete()
      .eq('id', existingLike.id)

    if (error) {
      console.error('Error unliking referral job:', error)
      return false
    }

    // Decrement like count
    await supabase.rpc('decrement_referral_job_likes', { p_referral_job_id: jobId })
    
    return true
  } else {
    // Like the job
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
    await supabase.rpc('increment_referral_job_likes', { p_referral_job_id: jobId })
    
    return true
  }
}

// Tools Functions
export const getTools = async (limit: number, offset: number, userId?: string): Promise<Tool[]> => {
  let query = supabase
    .from('tools')
    .select(`
      *,
      user_profiles (
        name,
        avatar_url,
        user_type
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching tools:', error)
    return []
  }

  // If userId is provided, check if the tool is promoted
  if (userId) {
    const tools = data as Tool[]
    
    // Get all tool IDs
    const toolIds = tools.map(tool => tool.id)
    
    // Check promotions
    const { data: promotions } = await supabase
      .from('promotions')
      .select('content_id')
      .eq('content_type', 'tool')
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .in('content_id', toolIds)
    
    // Create set for faster lookups
    const promotedToolIds = new Set(promotions?.map(promo => promo.content_id) || [])
    
    // Add is_promoted flag to each tool
    return tools.map(tool => ({
      ...tool,
      is_promoted: promotedToolIds.has(tool.id)
    }))
  }

  return data as Tool[]
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
export const getCommentsByContent = async (contentId: string, contentType: string, userId?: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user_profile:user_profiles (
        name,
        avatar_url,
        user_type
      )
    `)
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  // If userId is provided, check if the user has liked each comment
  if (userId) {
    const comments = data as Comment[]
    
    // Get all comment IDs
    const commentIds = comments.map(comment => comment.id)
    
    // Check likes
    const { data: likes } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_id', userId)
      .in('comment_id', commentIds)
    
    // Create set for faster lookups
    const likedCommentIds = new Set(likes?.map(like => like.comment_id) || [])
    
    // Add liked_by_user flag to each comment
    return comments.map(comment => ({
      ...comment,
      liked_by_user: likedCommentIds.has(comment.id)
    }))
  }

  return data as Comment[]
}

export const createComment = async (commentData: {
  content_id: string
  content_type: string
  user_id: string
  parent_id?: string
  content: string
}): Promise<Comment | null> => {
  const { data, error } = await supabase
    .from('comments')
    .insert(commentData)
    .select(`
      *,
      user_profile:user_profiles (
        name,
        avatar_url,
        user_type
      )
    `)
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    throw error
  }

  // Increment comment count based on content type
  if (commentData.content_type === 'idea') {
    await supabase.rpc('increment_idea_comments', { p_idea_id: commentData.content_id })
  } else if (commentData.content_type === 'referral_job') {
    // TODO: Implement increment_referral_job_comments RPC
  } else if (commentData.content_type === 'community_post') {
    await supabase.rpc('increment_community_post_comments', { p_post_id: commentData.content_id })
  }

  return {
    ...data,
    liked_by_user: false,
    likes: 0
  }
}

export const likeComment = async (commentId: string, userId: string): Promise<boolean> => {
  // Check if user has already liked the comment
  const { data: existingLike } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingLike) {
    // Unlike the comment
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('id', existingLike.id)

    if (error) {
      console.error('Error unliking comment:', error)
      return false
    }

    // Decrement like count
    await supabase.rpc('decrement_comment_likes', { p_comment_id: commentId })
    
    return true
  } else {
    // Like the comment
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
    await supabase.rpc('increment_comment_likes', { p_comment_id: commentId })
    
    return true
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

// Messages Functions
export const createMessage = async (messageData: {
  sender_id: string
  recipient_id: string
  content: string
  subject?: string
}): Promise<Message | null> => {
  // First, check if a conversation exists between these users
  const { data: existingConversation } = await supabase
    .from('conversations')
    .select('id')
    .or(`participant_1.eq.${messageData.sender_id},participant_2.eq.${messageData.sender_id}`)
    .or(`participant_1.eq.${messageData.recipient_id},participant_2.eq.${messageData.recipient_id}`)
    .maybeSingle()

  let conversationId: string

  if (existingConversation) {
    conversationId = existingConversation.id
  } else {
    // Create a new conversation
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
      throw conversationError
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
    throw error
  }

  // Update the conversation's last_message_at
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)

  // Create a notification for the recipient
  await supabase
    .from('notifications')
    .insert({
      user_id: messageData.recipient_id,
      title: messageData.subject || 'New Message',
      message: `You have a new message from ${messageData.sender_id}`,
      type: 'info',
      action_url: `/dashboard/messages`
    })

  return data
}

// Promotions Functions
export const getActivePromotionForContent = async (contentId: string, contentType: string): Promise<Promotion | null> => {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .eq('status', 'active')
    .gte('end_date', new Date().toISOString())
    .order('created_at', { ascending: false })
    .maybeSingle()

  if (error) {
    console.error('Error fetching promotion:', error)
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

// Purchases Functions
export const hasUserPurchasedContent = async (userId: string, contentId: string, contentType: string): Promise<boolean> => {
  // Check if the user is the content owner (owners don't need to purchase their own content)
  if (contentType === 'idea') {
    const { data: idea } = await supabase
      .from('ideas')
      .select('user_id')
      .eq('id', contentId)
      .single()
    
    if (idea && idea.user_id === userId) {
      return true
    }
  }

  // Check if the user has purchased the content
  const { data, error } = await supabase
    .from('purchased_content')
    .select('id')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .maybeSingle()

  if (error) {
    console.error('Error checking purchase status:', error)
    return false
  }

  return !!data
}

export const purchaseContent = async (
  userId: string,
  contentOwnerId: string,
  contentId: string,
  contentType: string,
  price: number
): Promise<boolean> => {
  // Start a transaction
  const { error } = await supabase.rpc('purchase_content', {
    p_user_id: userId,
    p_content_owner_id: contentOwnerId,
    p_content_id: contentId,
    p_content_type: contentType,
    p_price: price
  })

  if (error) {
    console.error('Error purchasing content:', error)
    throw error
  }

  return true
}

// Business Profile Functions
export const userHasBusinessProfile = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('user_has_business_profile', {
    p_user_id: userId
  })

  if (error) {
    console.error('Error checking business profile:', error)
    return false
  }

  return data
}

export const getBusinessProfileById = async (id: string): Promise<BusinessProfile | null> => {
  const { data, error } = await supabase
    .from('business_profiles')
    .select(`
      *,
      user_profile:user_profiles (
        name,
        avatar_url,
        user_type
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching business profile:', error)
    return null
  }

  return data
}

// Community Posts Functions
export const createCommunityPost = async (postData: {
  user_id: string
  content: string
  image_url?: string
  video_url?: string
  location?: string
}): Promise<CommunityPost | null> => {
  const { data, error } = await supabase
    .from('community_posts')
    .insert(postData)
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
    throw error
  }

  return {
    ...data,
    liked_by_user: false
  }
}

export const getCommunityPosts = async (limit: number, offset: number, userId?: string): Promise<CommunityPost[]> => {
  const { data, error } = await supabase
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

  if (error) {
    console.error('Error fetching community posts:', error)
    return []
  }

  // If userId is provided, check if the user has liked each post
  if (userId) {
    const posts = data as CommunityPost[]
    
    // Get all post IDs
    const postIds = posts.map(post => post.id)
    
    // Check likes
    const { data: likes } = await supabase
      .from('community_post_likes')
      .select('community_post_id')
      .eq('user_id', userId)
      .in('community_post_id', postIds)
    
    // Create set for faster lookups
    const likedPostIds = new Set(likes?.map(like => like.community_post_id) || [])
    
    // Add liked_by_user flag to each post
    return posts.map(post => ({
      ...post,
      liked_by_user: likedPostIds.has(post.id)
    }))
  }

  return data as CommunityPost[]
}

export const likeCommunityPost = async (postId: string, userId: string): Promise<boolean> => {
  // Check if user has already liked the post
  const { data: existingLike } = await supabase
    .from('community_post_likes')
    .select('id')
    .eq('community_post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingLike) {
    // Unlike the post
    const { error } = await supabase
      .from('community_post_likes')
      .delete()
      .eq('id', existingLike.id)

    if (error) {
      console.error('Error unliking community post:', error)
      return false
    }

    // Decrement like count
    await supabase.rpc('decrement_community_post_likes', { p_post_id: postId })
    
    return true
  } else {
    // Like the post
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
    await supabase.rpc('increment_community_post_likes', { p_post_id: postId })
    
    return true
  }
}

// Real-time subscriptions
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

export const subscribeToCommunityPosts = (callback: (payload: any) => void) => {
  return supabase
    .channel('community-posts')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'community_posts'
      },
      callback
    )
    .subscribe()
}

// Function to get recent community opportunities (ideas, referral jobs, businesses)
export const getRecentCommunityOpportunities = async (limit: number = 3): Promise<FeaturedOpportunity[]> => {
  try {
    // Fetch recent ideas
    const { data: ideas } = await supabase
      .from('ideas')
      .select(`
        id,
        title,
        category,
        location,
        thumbnail_url,
        created_at,
        user_profiles (
          name,
          avatar_url
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    // Fetch recent referral jobs
    const { data: referralJobs } = await supabase
      .from('referral_jobs')
      .select(`
        id,
        title,
        business_name,
        category,
        location,
        commission,
        commission_type,
        logo_url,
        created_at,
        user_profiles (
          name,
          avatar_url
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    // Fetch recent business profiles
    const { data: businesses } = await supabase
      .from('business_profiles')
      .select(`
        id,
        business_name,
        category,
        city,
        state,
        country,
        thumbnail_url,
        created_at,
        user_profiles (
          name,
          avatar_url
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    // Transform and combine the results
    const ideaOpportunities: FeaturedOpportunity[] = (ideas || []).map(idea => ({
      id: idea.id,
      type: 'idea',
      title: idea.title,
      author: idea.user_profiles?.name,
      category: idea.category,
      location: idea.location,
      created_at: idea.created_at,
      thumbnail_url: idea.thumbnail_url
    }))
    
    const referralOpportunities: FeaturedOpportunity[] = (referralJobs || []).map(job => ({
      id: job.id,
      type: 'referral',
      title: job.title,
      business: job.business_name,
      category: job.category,
      location: job.location,
      commission: job.commission,
      commission_type: job.commission_type,
      created_at: job.created_at,
      thumbnail_url: job.logo_url
    }))
    
    const businessOpportunities: FeaturedOpportunity[] = (businesses || []).map(business => ({
      id: business.id,
      type: 'business',
      title: business.business_name,
      category: business.category,
      location: [business.city, business.state, business.country].filter(Boolean).join(', '),
      created_at: business.created_at,
      thumbnail_url: business.thumbnail_url
    }))
    
    // Combine all opportunities and sort by creation date (newest first)
    const allOpportunities = [
      ...ideaOpportunities,
      ...referralOpportunities,
      ...businessOpportunities
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    // Return the most recent opportunities (limited to the requested number)
    return allOpportunities.slice(0, limit)
  } catch (error) {
    console.error('Error fetching community opportunities:', error)
    return []
  }
}