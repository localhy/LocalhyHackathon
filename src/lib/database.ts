import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

// --- Type Definitions ---

export interface UserProfile {
  id: string;
  name: string;
  bio?: string;
  location?: string;
  user_type?: string;
  avatar_url?: string;
  newsletter_opt_in?: boolean;
  created_at: string;
  updated_at: string;
  credits: number;
  fiat_balance: number;
  phone?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  paypal_email?: string;
  free_credits: number;
  purchased_credits: number;
}

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  views: number;
  likes: number;
  status: string;
  created_at: string;
  updated_at: string;
  cover_image_url?: string;
  problem_summary?: string;
  solution_overview?: string;
  tags?: string[];
  thumbnail_url?: string;
  location?: string;
  user_profiles?: UserProfile; // Joined user profile
  liked_by_user?: boolean; // Custom field for UI
  bookmarked_by_user?: boolean; // Custom field for UI
  is_promoted?: boolean; // Custom field for UI
}

export interface ReferralJob {
  id: string;
  user_id: string;
  title: string;
  business_name: string;
  description: string;
  commission: number;
  commission_type: 'percentage' | 'fixed';
  location: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  requirements?: string;
  applicants_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  referral_type?: string;
  logo_url?: string;
  website?: string;
  cta_text?: string;
  terms?: string;
  likes?: number;
  user_profiles?: UserProfile; // Joined user profile
  liked_by_user?: boolean; // Custom field for UI
  bookmarked_by_user?: boolean; // Custom field for UI
  is_promoted?: boolean; // Custom field for UI
}

export interface Tool {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  type: 'free' | 'paid' | 'premium';
  price: number;
  download_url?: string;
  downloads_count: number;
  rating: number;
  tags?: string[];
  featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  location?: string;
  user_profiles?: UserProfile; // Joined user profile
  is_promoted?: boolean; // Custom field for UI
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
  city?: string;
  state?: string;
  country?: string;
  description: string;
  address?: string;
  operating_hours?: { [key: string]: { open: string; close: string } };
  thumbnail_url: string;
  cover_photo_url?: string;
  gallery_urls?: string[];
  youtube_video_url?: string;
  referral_reward_amount?: number;
  referral_reward_type?: 'percentage' | 'fixed';
  referral_cta_link?: string;
  promo_tagline?: string;
  email: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  years_in_business?: number;
  certifications_urls?: string[];
  customer_reviews?: { name: string; rating: number; text: string; date: string }[];
  enable_referrals: boolean;
  display_earnings_publicly: boolean;
  enable_questions_comments: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  user_profile?: UserProfile; // Joined user profile
}

export interface Comment {
  id: string;
  content_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  likes: number;
  created_at: string;
  updated_at: string;
  content_type: string;
  user_profile?: UserProfile; // Joined user profile
  liked_by_user?: boolean; // Custom field for UI
}

export interface Group {
  id: string;
  name: string;
  description: string;
  type: 'business_guild' | 'idea_hub' | 'referral_network' | 'general';
  location?: string;
  owner_id: string;
  privacy_setting: 'public' | 'private' | 'hidden';
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
  cover_photo_url?: string;
  member_count?: number; // Custom field for UI
  isMember?: boolean; // Custom field for UI
  owner_profile?: UserProfile; // Joined owner profile
}

export interface GroupPost {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  likes: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  user_profile?: UserProfile; // Joined user profile
  liked_by_user?: boolean; // Custom field for UI
}

export interface GroupComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_profile?: UserProfile; // Joined user profile
  likes: number;
  liked_by_user?: boolean; // Custom field for UI
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  action_url?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  created_at: string;
  other_user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  last_message?: Message;
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string;
  event_date: string;
  location?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  user_profile?: UserProfile;
}

export interface MarketplaceItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category?: string;
  condition?: 'new' | 'used' | 'like new';
  image_url?: string;
  location?: string;
  status?: 'available' | 'sold' | 'pending';
  created_at: string;
  updated_at: string;
  user_profile?: UserProfile;
}

// --- Utility Functions ---

export async function uploadFile(file: File, bucketName: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading file:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  if (!publicUrlData) {
    throw new Error('Could not get public URL for uploaded file.');
  }

  return publicUrlData.publicUrl;
}

// --- Auth Related ---

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error fetching user profile:', error);
    throw error;
  }
  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  return data;
}

export async function getUserCredits(userId: string): Promise<{ cashCredits: number; freeCredits: number; purchasedCredits: number }> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('credits, free_credits, purchased_credits')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user credits:', error);
    throw error;
  }
  return {
    cashCredits: data?.credits || 0,
    freeCredits: data?.free_credits || 0,
    purchasedCredits: data?.purchased_credits || 0,
  };
}

export async function hasUserPurchasedContent(userId: string, contentId: string, contentType: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('purchased_content')
    .select('id')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking purchased content:', error);
    throw error;
  }
  return !!data;
}

export async function purchaseContent(
  buyerId: string,
  sellerId: string,
  contentId: string,
  contentType: 'idea' | 'referral_job' | 'tool',
  price: number
): Promise<boolean> {
  const { data, error } = await supabase.rpc('purchase_content_and_transfer_credits', {
    p_buyer_id: buyerId,
    p_seller_id: sellerId,
    p_content_id: contentId,
    p_content_type: contentType,
    p_price: price,
  });

  if (error) {
    console.error('Error purchasing content:', error);
    throw new Error(error.message);
  }
  return data;
}

export function subscribeToUserProfile(userId: string, callback: (payload: any) => void) {
  const subscription = supabase
    .channel(`user_profiles:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_profiles',
        filter: `id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return subscription;
}

// --- Ideas Vault ---

export interface CreateIdeaData {
  user_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  cover_image_url?: string;
  problem_summary?: string;
  solution_overview?: string;
  tags?: string[];
  thumbnail_url?: string;
  location?: string;
}

export interface UpdateIdeaData {
  title?: string;
  description?: string;
  category?: string;
  price?: number;
  cover_image_url?: string;
  problem_summary?: string;
  solution_overview?: string;
  tags?: string[];
  thumbnail_url?: string;
  location?: string;
  status?: string;
}

export async function createIdea(ideaData: CreateIdeaData): Promise<Idea | null> {
  const { data, error } = await supabase
    .from('ideas')
    .insert(ideaData)
    .select()
    .single();

  if (error) {
    console.error('Error creating idea:', error);
    throw error;
  }
  return data;
}

export async function getIdeas(limit: number, offset: number, currentUserId?: string, location?: string): Promise<Idea[]> {
  let query = supabase
    .from('ideas')
    .select(`
      *,
      user_profiles(name, avatar_url)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (location) {
    query = query.ilike('location', `%${location}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching ideas:', error);
    throw error;
  }

  // Check if user has liked/bookmarked each idea
  const ideasWithUserStatus = await Promise.all(data.map(async (idea: Idea) => {
    let likedByUser = false;
    let bookmarkedByUser = false;
    let isPromoted = false;

    if (currentUserId) {
      const { data: likeData, error: likeError } = await supabase
        .from('idea_likes')
        .select('id')
        .eq('idea_id', idea.id)
        .eq('user_id', currentUserId)
        .single();
      likedByUser = !!likeData;

      const { data: bookmarkData, error: bookmarkError } = await supabase
        .from('idea_bookmarks')
        .select('id')
        .eq('idea_id', idea.id)
        .eq('user_id', currentUserId)
        .single();
      bookmarkedByUser = !!bookmarkData;
    }

    // Check for active promotions
    const promotion = await getActivePromotionForContent(idea.id, 'idea');
    isPromoted = !!promotion;

    return { ...idea, liked_by_user: likedByUser, bookmarked_by_user: bookmarkedByUser, is_promoted: isPromoted };
  }));

  return ideasWithUserStatus;
}

export async function getIdeaById(id: string, currentUserId?: string): Promise<Idea | null> {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      user_profiles(id, name, bio, location, user_type, avatar_url)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching idea by ID:', error);
    throw error;
  }

  if (data && currentUserId) {
    // Increment view count if not the owner
    if (data.user_id !== currentUserId) {
      await supabase.rpc('increment_idea_views', { idea_id: id });
      data.views += 1; // Optimistically update view count
    }

    // Check if user has liked/bookmarked
    const { data: likeData } = await supabase
      .from('idea_likes')
      .select('id')
      .eq('idea_id', id)
      .eq('user_id', currentUserId)
      .single();
    data.liked_by_user = !!likeData;

    const { data: bookmarkData } = await supabase
      .from('idea_bookmarks')
      .select('id')
      .eq('idea_id', id)
      .eq('user_id', currentUserId)
      .single();
    data.bookmarked_by_user = !!bookmarkData;
  }

  return data;
}

export async function updateIdea(id: string, updates: UpdateIdeaData): Promise<Idea | null> {
  const { data, error } = await supabase
    .from('ideas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating idea:', error);
    throw error;
  }
  return data;
}

export async function deleteIdea(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('ideas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting idea:', error);
    throw error;
  }
  return true;
}

export async function likeIdea(ideaId: string, userId: string): Promise<boolean> {
  const { data: existingLike, error: fetchError } = await supabase
    .from('idea_likes')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking existing like:', fetchError);
    throw fetchError;
  }

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('idea_likes')
      .delete()
      .eq('id', existingLike.id);

    if (error) {
      console.error('Error unliking idea:', error);
      throw error;
    }
    return true;
  } else {
    // Like
    const { error } = await supabase
      .from('idea_likes')
      .insert({ idea_id: ideaId, user_id: userId });

    if (error) {
      console.error('Error liking idea:', error);
      throw error;
    }
    return true;
  }
}

export async function bookmarkIdea(ideaId: string, userId: string): Promise<boolean> {
  const { data: existingBookmark, error: fetchError } = await supabase
    .from('idea_bookmarks')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking existing bookmark:', fetchError);
    throw fetchError;
  }

  if (existingBookmark) {
    // Unbookmark
    const { error } = await supabase
      .from('idea_bookmarks')
      .delete()
      .eq('id', existingBookmark.id);

    if (error) {
      console.error('Error unbookmarking idea:', error);
      throw error;
    }
    return true;
  } else {
    // Bookmark
    const { error } = await supabase
      .from('idea_bookmarks')
      .insert({ idea_id: ideaId, user_id: userId });

    if (error) {
      console.error('Error bookmarking idea:', error);
      throw error;
    }
    return true;
  }
}

export async function getUserIdeas(userId: string): Promise<Idea[]> {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      user_profiles(name, avatar_url)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user ideas:', error);
    throw error;
  }
  return data;
}

// --- Referral Jobs ---

export interface CreateReferralJobData {
  user_id: string;
  title: string;
  business_name: string;
  description: string;
  commission: number;
  commission_type: 'percentage' | 'fixed';
  location: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  requirements?: string;
  referral_type?: string;
  logo_url?: string;
  website?: string;
  cta_text?: string;
  terms?: string;
}

export interface UpdateReferralJobData {
  title?: string;
  business_name?: string;
  description?: string;
  commission?: number;
  commission_type?: 'percentage' | 'fixed';
  location?: string;
  category?: string;
  urgency?: 'low' | 'medium' | 'high';
  requirements?: string;
  referral_type?: string;
  logo_url?: string;
  website?: string;
  cta_text?: string;
  terms?: string;
  status?: string;
}

export async function createReferralJob(jobData: CreateReferralJobData): Promise<ReferralJob | null> {
  const { data, error } = await supabase
    .from('referral_jobs')
    .insert(jobData)
    .select()
    .single();

  if (error) {
    console.error('Error creating referral job:', error);
    throw error;
  }
  return data;
}

export async function getReferralJobs(limit: number, offset: number, currentUserId?: string, location?: string): Promise<ReferralJob[]> {
  let query = supabase
    .from('referral_jobs')
    .select(`
      *,
      user_profiles(name, avatar_url)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (location) {
    query = query.ilike('location', `%${location}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching referral jobs:', error);
    throw error;
  }

  const jobsWithUserStatus = await Promise.all(data.map(async (job: ReferralJob) => {
    let likedByUser = false;
    let bookmarkedByUser = false; // Assuming bookmarking for referral jobs is desired
    let isPromoted = false;

    if (currentUserId) {
      const { data: likeData, error: likeError } = await supabase
        .from('referral_job_likes')
        .select('id')
        .eq('referral_job_id', job.id)
        .eq('user_id', currentUserId)
        .single();
      likedByUser = !!likeData;

      // Implement bookmark check if you have a referral_job_bookmarks table
      // const { data: bookmarkData, error: bookmarkError } = await supabase
      //   .from('referral_job_bookmarks')
      //   .select('id')
      //   .eq('referral_job_id', job.id)
      //   .eq('user_id', currentUserId)
      //   .single();
      // bookmarkedByUser = !!bookmarkData;
    }

    // Check for active promotions
    const promotion = await getActivePromotionForContent(job.id, 'referral_job');
    isPromoted = !!promotion;

    return { ...job, liked_by_user: likedByUser, bookmarked_by_user: bookmarkedByUser, is_promoted: isPromoted };
  }));

  return jobsWithUserStatus;
}

export async function getReferralJobById(id: string, currentUserId?: string): Promise<ReferralJob | null> {
  const { data, error } = await supabase
    .from('referral_jobs')
    .select(`
      *,
      user_profiles(id, name, bio, location, user_type, avatar_url)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching referral job by ID:', error);
    throw error;
  }

  if (data && currentUserId) {
    // Check if user has liked
    const { data: likeData } = await supabase
      .from('referral_job_likes')
      .select('id')
      .eq('referral_job_id', id)
      .eq('user_id', currentUserId)
      .single();
    data.liked_by_user = !!likeData;
  }

  return data;
}

export async function updateReferralJob(id: string, updates: UpdateReferralJobData): Promise<ReferralJob | null> {
  const { data, error } = await supabase
    .from('referral_jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating referral job:', error);
    throw error;
  }
  return data;
}

export async function deleteReferralJob(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('referral_jobs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting referral job:', error);
    throw error;
  }
  return true;
}

export async function likeReferralJob(jobId: string, userId: string): Promise<boolean> {
  const { data: existingLike, error: fetchError } = await supabase
    .from('referral_job_likes')
    .select('id')
    .eq('referral_job_id', jobId)
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking existing like:', fetchError);
    throw fetchError;
  }

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('referral_job_likes')
      .delete()
      .eq('id', existingLike.id);

    if (error) {
      console.error('Error unliking referral job:', error);
      throw error;
    }
    return true;
  } else {
    // Like
    const { error } = await supabase
      .from('referral_job_likes')
      .insert({ referral_job_id: jobId, user_id: userId });

    if (error) {
      console.error('Error liking referral job:', error);
      throw error;
    }
    return true;
  }
}

export async function getUserReferralJobs(userId: string): Promise<ReferralJob[]> {
  const { data, error } = await supabase
    .from('referral_jobs')
    .select(`
      *,
      user_profiles(name, avatar_url)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user referral jobs:', error);
    throw error;
  }
  return data;
}

// --- Starter Tools ---

export interface CreateToolData {
  user_id: string;
  title: string;
  description: string;
  category: string;
  type: 'free' | 'paid' | 'premium';
  price: number;
  download_url?: string;
  tags?: string[];
  location?: string;
}

export interface UpdateToolData {
  title?: string;
  description?: string;
  category?: string;
  type?: 'free' | 'paid' | 'premium';
  price?: number;
  download_url?: string;
  tags?: string[];
  location?: string;
  status?: string;
}

export async function createTool(toolData: CreateToolData): Promise<Tool | null> {
  const { data, error } = await supabase
    .from('tools')
    .insert(toolData)
    .select()
    .single();

  if (error) {
    console.error('Error creating tool:', error);
    throw error;
  }
  return data;
}

export async function getTools(limit: number, offset: number): Promise<Tool[]> {
  const { data, error } = await supabase
    .from('tools')
    .select(`
      *,
      user_profiles(name, avatar_url)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching tools:', error);
    throw error;
  }

  const toolsWithPromotions = await Promise.all(data.map(async (tool: Tool) => {
    const promotion = await getActivePromotionForContent(tool.id, 'tool');
    return { ...tool, is_promoted: !!promotion };
  }));

  return toolsWithPromotions;
}

export async function updateTool(id: string, updates: UpdateToolData): Promise<Tool | null> {
  const { data, error } = await supabase
    .from('tools')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating tool:', error);
    throw error;
  }
  return data;
}

export async function deleteTool(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('tools')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting tool:', error);
    throw error;
  }
  return true;
}

export async function getUserTools(userId: string): Promise<Tool[]> {
  const { data, error } = await supabase
    .from('tools')
    .select(`
      *,
      user_profiles(name, avatar_url)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user tools:', error);
    throw error;
  }
  return data;
}

// --- Business Profiles ---

export interface CreateBusinessProfileData {
  user_id: string;
  business_name: string;
  category: string;
  description: string;
  email: string;
  thumbnail_url: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  operating_hours?: { [key: string]: { open: string; close: string } };
  cover_photo_url?: string;
  gallery_urls?: string[];
  youtube_video_url?: string;
  referral_reward_amount?: number;
  referral_reward_type?: 'percentage' | 'fixed';
  referral_cta_link?: string;
  promo_tagline?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  years_in_business?: number;
  certifications_urls?: string[];
  customer_reviews?: { name: string; rating: number; text: string; date: string }[];
  enable_referrals?: boolean;
  display_earnings_publicly?: boolean;
  enable_questions_comments?: boolean;
}

export interface UpdateBusinessProfileData {
  business_name?: string;
  category?: string;
  description?: string;
  email?: string;
  thumbnail_url?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  operating_hours?: { [key: string]: { open: string; close: string } };
  cover_photo_url?: string;
  gallery_urls?: string[];
  youtube_video_url?: string;
  referral_reward_amount?: number;
  referral_reward_type?: 'percentage' | 'fixed';
  referral_cta_link?: string;
  promo_tagline?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  years_in_business?: number;
  certifications_urls?: string[];
  customer_reviews?: { name: string; rating: number; text: string; date: string }[];
  enable_referrals?: boolean;
  display_earnings_publicly?: boolean;
  enable_questions_comments?: boolean;
  status?: string;
}

export async function createBusinessProfile(profileData: CreateBusinessProfileData): Promise<BusinessProfile | null> {
  const { data, error } = await supabase
    .from('business_profiles')
    .insert(profileData)
    .select()
    .single();

  if (error) {
    console.error('Error creating business profile:', error);
    throw error;
  }
  return data;
}

export async function getBusinessProfileById(id: string): Promise<BusinessProfile | null> {
  const { data, error } = await supabase
    .from('business_profiles')
    .select(`
      *,
      user_profile:user_profiles(id, name, avatar_url)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching business profile by ID:', error);
    throw error;
  }
  return data;
}

export async function updateBusinessProfile(id: string, updates: UpdateBusinessProfileData): Promise<BusinessProfile | null> {
  const { data, error } = await supabase
    .from('business_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating business profile:', error);
    throw error;
  }
  return data;
}

export async function getUserBusinessProfiles(userId: string): Promise<BusinessProfile[]> {
  const { data, error } = await supabase
    .from('business_profiles')
    .select(`
      *,
      user_profile:user_profiles(name, avatar_url)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user business profiles:', error);
    throw error;
  }
  return data;
}

export async function userHasBusinessProfile(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('business_profiles')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (error) {
    console.error('Error checking if user has business profile:', error);
    throw error;
  }
  return data && data.length > 0;
}

// --- Comments ---

export interface CreateCommentData {
  content_id: string;
  content_type: string;
  user_id: string;
  parent_id?: string;
  content: string;
}

export async function createComment(commentData: CreateCommentData): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('comments')
    .insert(commentData)
    .select(`
      *,
      user_profile:user_profiles(name, avatar_url)
    `)
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
  return data;
}

export async function getCommentsByContent(contentId: string, contentType: string, currentUserId?: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user_profile:user_profiles(name, avatar_url)
    `)
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }

  const commentsWithLikeStatus = await Promise.all(data.map(async (comment: Comment) => {
    let likedByUser = false;
    if (currentUserId) {
      const { data: likeData, error: likeError } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', comment.id)
        .eq('user_id', currentUserId)
        .single();
      likedByUser = !!likeData;
    }
    return { ...comment, liked_by_user: likedByUser };
  }));

  return commentsWithLikeStatus;
}

export async function likeComment(commentId: string, userId: string): Promise<boolean> {
  const { data: existingLike, error: fetchError } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking existing comment like:', fetchError);
    throw fetchError;
  }

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('id', existingLike.id);

    if (error) {
      console.error('Error unliking comment:', error);
      throw error;
    }
    return true;
  } else {
    // Like
    const { error } = await supabase
      .from('comment_likes')
      .insert({ comment_id: commentId, user_id: userId });

    if (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
    return true;
  }
}

export async function updateComment(commentId: string, newContent: string): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('comments')
    .update({ content: newContent, updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .select(`
      *,
      user_profile:user_profiles(name, avatar_url)
    `)
    .single();

  if (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
  return data;
}

export async function deleteComment(commentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
  return true;
}

// --- Community Posts (Newsfeed) ---

export interface CreateCommunityPostData {
  user_id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  location?: string;
}

export interface UpdateCommunityPostData {
  content?: string;
  image_url?: string;
  video_url?: string;
  location?: string;
}

export async function createCommunityPost(postData: CreateCommunityPostData): Promise<CommunityPost | null> {
  const { data, error } = await supabase
    .from('community_posts')
    .insert(postData)
    .select()
    .single();

  if (error) {
    console.error('Error creating community post:', error);
    throw error;
  }
  return data;
}

export async function getCommunityPosts(limit: number, offset: number, currentUserId?: string, location?: string): Promise<CommunityPost[]> {
  let query = supabase
    .from('community_posts')
    .select(`
      *,
      user_profile:user_profiles(name, avatar_url, user_type)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (location) {
    query = query.ilike('location', `%${location}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching community posts:', error);
    throw error;
  }

  const postsWithLikeStatus = await Promise.all(data.map(async (post: CommunityPost) => {
    let likedByUser = false;
    if (currentUserId) {
      const { data: likeData, error: likeError } = await supabase
        .from('community_post_likes')
        .select('id')
        .eq('community_post_id', post.id)
        .eq('user_id', currentUserId)
        .single();
      likedByUser = !!likeData;
    }
    return { ...post, liked_by_user: likedByUser };
  }));

  return postsWithLikeStatus;
}

export async function likeCommunityPost(postId: string, userId: string): Promise<boolean> {
  const { data: existingLike, error: fetchError } = await supabase
    .from('community_post_likes')
    .select('id')
    .eq('community_post_id', postId)
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking existing community post like:', fetchError);
    throw fetchError;
  }

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('community_post_likes')
      .delete()
      .eq('id', existingLike.id);

    if (error) {
      console.error('Error unliking community post:', error);
      throw error;
    }
    return true;
  } else {
    // Like
    const { error } = await supabase
      .from('community_post_likes')
      .insert({ community_post_id: postId, user_id: userId });

    if (error) {
      console.error('Error liking community post:', error);
      throw error;
    }
    return true;
  }
}

export async function updateCommunityPost(postId: string, updates: UpdateCommunityPostData): Promise<CommunityPost | null> {
  const { data, error } = await supabase
    .from('community_posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();

  if (error) {
    console.error('Error updating community post:', error);
    throw error;
  }
  return data;
}

export async function deleteCommunityPost(postId: string): Promise<boolean> {
  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error('Error deleting community post:', error);
    throw error;
  }
  return true;
}

// --- Groups ---

export interface CreateGroupData {
  name: string;
  description: string;
  type: 'business_guild' | 'idea_hub' | 'referral_network' | 'general';
  location?: string;
  owner_id: string;
  privacy_setting: 'public' | 'private' | 'hidden';
  thumbnail_url?: string;
  cover_photo_url?: string;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  type?: 'business_guild' | 'idea_hub' | 'referral_network' | 'general';
  location?: string;
  privacy_setting?: 'public' | 'private' | 'hidden';
  thumbnail_url?: string;
  cover_photo_url?: string;
}

export async function createGroup(groupData: CreateGroupData): Promise<Group | null> {
  const { data, error } = await supabase
    .from('groups')
    .insert(groupData)
    .select()
    .single();

  if (error) {
    console.error('Error creating group:', error);
    throw error;
  }
  return data;
}

export async function getGroups(filters: { searchTerm?: string; type?: string; location?: string; privacy?: string; userId?: string }, pagination: { limit: number; offset: number }): Promise<Group[]> {
  let query = supabase
    .from('groups')
    .select(`
      *,
      member_count:group_members(count),
      isMember:group_members(user_id)
    `);

  if (filters.searchTerm) {
    query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
  }
  if (filters.type) {
    query = query.eq('type', filters.type);
  }
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters.privacy) {
    query = query.eq('privacy_setting', filters.privacy);
  }
  if (filters.userId) {
    // If userId is provided, filter groups where the user is a member
    query = query.in('id', supabase.from('group_members').select('group_id').eq('user_id', filters.userId));
  }

  query = query
    .order('created_at', { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }

  return data.map((group: any) => ({
    ...group,
    member_count: group.member_count[0]?.count || 0,
    isMember: group.isMember.some((member: any) => member.user_id === filters.userId),
  }));
}

export async function getGroupById(id: string): Promise<Group | null> {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      owner_profile:user_profiles(id, name, avatar_url)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching group by ID:', error);
    throw error;
  }
  return data;
}

export async function updateGroup(id: string, updates: UpdateGroupData): Promise<Group | null> {
  const { data, error } = await supabase
    .from('groups')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating group:', error);
    throw error;
  }
  return data;
}

export async function deleteGroup(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
  return true;
}

export async function getGroupMembers(groupId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      *,
      user_profile:user_profiles(name, avatar_url)
    `)
    .eq('group_id', groupId);

  if (error) {
    console.error('Error fetching group members:', error);
    throw error;
  }
  return data;
}

export async function joinGroup(groupId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId });

  if (error) {
    console.error('Error joining group:', error);
    throw error;
  }
  return true;
}

export async function leaveGroup(groupId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
  return true;
}

export interface CreateGroupPostData {
  group_id: string;
  user_id: string;
  content: string;
  image_url?: string;
  video_url?: string;
}

export interface UpdateGroupPostData {
  content?: string;
  image_url?: string;
  video_url?: string;
}

export async function createGroupPost(postData: CreateGroupPostData): Promise<GroupPost | null> {
  const { data, error } = await supabase
    .from('group_posts')
    .insert(postData)
    .select()
    .single();

  if (error) {
    console.error('Error creating group post:', error);
    throw error;
  }
  return data;
}

export async function getGroupPosts(groupId: string, currentUserId?: string): Promise<GroupPost[]> {
  const { data, error } = await supabase
    .from('group_posts')
    .select(`
      *,
      user_profile:user_profiles(name, avatar_url)
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching group posts:', error);
    throw error;
  }

  const postsWithLikeStatus = await Promise.all(data.map(async (post: GroupPost) => {
    let likedByUser = false;
    if (currentUserId) {
      const { data: likeData, error: likeError } = await supabase
        .from('group_post_likes')
        .select('post_id')
        .eq('post_id', post.id)
        .eq('user_id', currentUserId)
        .single();
      likedByUser = !!likeData;
    }
    return { ...post, liked_by_user: likedByUser };
  }));

  return postsWithLikeStatus;
}

export async function likeGroupPost(postId: string, userId: string): Promise<boolean> {
  const { data: existingLike, error: fetchError } = await supabase
    .from('group_post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking existing group post like:', fetchError);
    throw fetchError;
  }

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('group_post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error unliking group post:', error);
      throw error;
    }
    return true;
  } else {
    // Like
    const { error } = await supabase
      .from('group_post_likes')
      .insert({ post_id: postId, user_id: userId });

    if (error) {
      console.error('Error liking group post:', error);
      throw error;
    }
    return true;
  }
}

export async function updateGroupPost(postId: string, updates: UpdateGroupPostData): Promise<GroupPost | null> {
  const { data, error } = await supabase
    .from('group_posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();

  if (error) {
    console.error('Error updating group post:', error);
    throw error;
  }
  return data;
}

export async function deleteGroupPost(postId: string): Promise<boolean> {
  const { error } = await supabase
    .from('group_posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error('Error deleting group post:', error);
    throw error;
  }
  return true;
}

// --- Notifications ---

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
  return data;
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
  return true;
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
  return true;
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
  return true;
}

export function subscribeToUserNotifications(userId: string, callback: (payload: any) => void) {
  const subscription = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return subscription;
}

// --- Messages ---

export async function getConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participant_1_profile:user_profiles!participant_1(id, name, avatar_url),
      participant_2_profile:user_profiles!participant_2(id, name, avatar_url)
    `)
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }

  const conversationsWithDetails = await Promise.all(data.map(async (conv: any) => {
    const otherUser = conv.participant_1 === userId ? conv.participant_2_profile : conv.participant_1_profile;

    // Fetch last message
    const { data: lastMessageData, error: lastMessageError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastMessageError && lastMessageError.code !== 'PGRST116') {
      console.error('Error fetching last message:', lastMessageError);
    }

    // Fetch unread count for the current user
    const { count: unreadCount, error: unreadError } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('conversation_id', conv.id)
      .eq('read', false)
      .neq('sender_id', userId); // Messages sent by the current user are considered read

    if (unreadError) {
      console.error('Error fetching unread count:', unreadError);
    }

    return {
      ...conv,
      other_user: otherUser,
      last_message: lastMessageData,
      unread_count: unreadCount || 0,
    };
  }));

  return conversationsWithDetails;
}

export async function getMessagesByConversationId(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
  return data;
}

export async function createMessage(messageData: { sender_id: string; recipient_id: string; content: string; subject?: string }): Promise<Message | null> {
  const { sender_id, recipient_id, content, subject } = messageData;

  // Find or create conversation
  let conversationId: string | null = null;

  const { data: existingConversation, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(participant_1.eq.${sender_id},participant_2.eq.${recipient_id}),and(participant_1.eq.${recipient_id},participant_2.eq.${sender_id})`)
    .single();

  if (convError && convError.code !== 'PGRST116') {
    console.error('Error checking existing conversation:', convError);
    throw convError;
  }

  if (existingConversation) {
    conversationId = existingConversation.id;
  } else {
    const { data: newConversation, error: createConvError } = await supabase
      .from('conversations')
      .insert({ participant_1: sender_id, participant_2: recipient_id })
      .select('id')
      .single();

    if (createConvError) {
      console.error('Error creating new conversation:', createConvError);
      throw createConvError;
    }
    conversationId = newConversation.id;
  }

  // Insert message
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: sender_id,
      content: content,
    })
    .select()
    .single();

  if (messageError) {
    console.error('Error creating message:', messageError);
    throw messageError;
  }

  // Update last_message_at for the conversation
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return message;
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .eq('read', false)
    .neq('sender_id', userId); // Only mark messages as read that were sent by the other party

  if (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
  return true;
}

// --- Events ---

export async function createEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'user_profile'>): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .insert(eventData)
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }
  return data;
}

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      user_profile:user_profiles(name, avatar_url)
    `)
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
  return data;
}

// --- Marketplace ---

export async function createMarketplaceItem(itemData: Omit<MarketplaceItem, 'id' | 'created_at' | 'updated_at' | 'user_profile'>): Promise<MarketplaceItem | null> {
  const { data, error } = await supabase
    .from('marketplace_items')
    .insert(itemData)
    .select()
    .single();

  if (error) {
    console.error('Error creating marketplace item:', error);
    throw error;
  }
  return data;
}

export async function getMarketplaceItems(): Promise<MarketplaceItem[]> {
  const { data, error } = await supabase
    .from('marketplace_items')
    .select(`
      *,
      user_profile:user_profiles(name, avatar_url)
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching marketplace items:', error);
    throw error;
  }
  return data;
}

// --- Promotions ---

export async function getActivePromotionForContent(contentId: string, contentType: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .eq('status', 'active')
    .gte('end_date', new Date().toISOString())
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching active promotion:', error);
    throw error;
  }
  return data;
}

export async function incrementPromotionViews(promotionId: string): Promise<boolean> {
  const { error } = await supabase.rpc('increment_promotion_views', { p_promotion_id: promotionId });
  if (error) {
    console.error('Error incrementing promotion views:', error);
    throw error;
  }
  return true;
}

export async function incrementPromotionClicks(promotionId: string): Promise<boolean> {
  const { error } = await supabase.rpc('increment_promotion_clicks', { p_promotion_id: promotionId });
  if (error) {
    console.error('Error incrementing promotion clicks:', error);
    throw error;
  }
  return true;
}