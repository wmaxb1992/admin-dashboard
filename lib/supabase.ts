import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Check if we have valid Supabase credentials
const isValidSupabaseConfig = 
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl !== 'your_supabase_url_here' && 
  supabaseKey !== 'your_supabase_anon_key_here' &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('supabase.co')

export const supabase = isValidSupabaseConfig 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Admin client with service role key for destructive operations
export const supabaseAdmin = isValidSupabaseConfig && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

// Database types
export interface Category {
  id: string
  name: string
  image: string | null
  created_at: string
  updated_at: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  image: string | null
  created_at: string
  updated_at: string
}

export interface Variety {
  id: string
  subcategory_id: string
  name: string
  description: string | null
  card_image: string | null
  nutritional_info: any
  taste_profile: any
  created_at: string
  updated_at: string
}

export interface VarietyWithDetails extends Variety {
  subcategory_name: string
  category_name: string
}

// API functions
export async function getAllVarieties() {
  // Get varieties with farm count
  const { data, error } = await supabase
    .rpc('get_varieties_with_farm_count')
  
  if (error) {
    console.error('Error calling get_varieties_with_farm_count:', error)
    // Fallback to basic query if the RPC doesn't exist
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('varieties_search')
      .select('*')
      .order('name')
    
    if (fallbackError) throw fallbackError
    return fallbackData?.map(variety => ({ ...variety, farm_count: 0 })) || []
  }
  
  return data || []
}

export async function searchVarieties(searchTerm: string, categoryFilter?: string) {
  const { data, error } = await supabase
    .rpc('search_varieties', {
      search_term: searchTerm,
      category_filter: categoryFilter || null
    })
  
  if (error) throw error
  return data
}

export async function getVarietySuggestions(searchTerm: string, limit: number = 10) {
  const { data, error } = await supabase
    .rpc('get_variety_suggestions', {
      search_term: searchTerm,
      limit_count: limit
    })
  
  if (error) throw error
  return data
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data
}

export async function getSubcategories(categoryId?: string) {
  let query = supabase
    .from('subcategories')
    .select('*, categories(name)')
    .order('name')
  
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function getVarieties(subcategoryId?: string) {
  let query = supabase
    .from('varieties')
    .select(`
      *,
      subcategories(name, categories(name))
    `)
    .order('name')
  
  if (subcategoryId) {
    query = query.eq('subcategory_id', subcategoryId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function getVarietyStats() {
  const { data, error } = await supabase
    .from('varieties_search')
    .select('category_name')
  
  if (error) throw error
  
  const stats = data.reduce((acc: any, variety: any) => {
    acc[variety.category_name] = (acc[variety.category_name] || 0) + 1
    return acc
  }, {})
  
  return {
    total: data.length,
    byCategory: stats
  }
}

// Add after the existing functions
export async function findDuplicateVarieties() {
  const response = await fetch('/api/duplicates')
  if (!response.ok) {
    throw new Error('Failed to find duplicates')
  }
  const { duplicates } = await response.json()
  return duplicates
}

export async function removeDuplicateVarieties(duplicates: any[]) {
  const response = await fetch('/api/duplicates', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ duplicates }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to remove duplicates')
  }
  
  return await response.json()
}
