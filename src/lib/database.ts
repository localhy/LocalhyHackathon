// Add new functions for tools management

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