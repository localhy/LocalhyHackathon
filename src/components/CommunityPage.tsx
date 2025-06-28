import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Users, Newspaper, ShoppingBag, Calendar, UserPlus, MessageCircle, Search, Filter, Plus, User, Heart, Share2, MapPin, Clock, ChevronDown, Image, X, Send, Loader, AlertCircle, Building } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './dashboard/Sidebar'
import TopBar from './dashboard/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { getCommunityPosts, createCommunityPost, getCommentsByContent, createComment, uploadFile, subscribeToCommunityPosts, type CommunityPost, type Comment } from '../lib/database'
import CommunityPostCard from './CommunityPostCard'
import { supabase } from '../lib/supabase'

interface TabProps {
  id: string
  label: string
  icon: React.ComponentType<any>
  count?: number
  isActive: boolean
  onClick: () => void
}

// Rest of the code remains the same...

export default CommunityPage