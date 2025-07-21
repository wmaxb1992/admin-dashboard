import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    // Find duplicates
    const { data, error } = await supabaseAdmin
      .from('varieties_search')
      .select('id, name, category_name, subcategory_name')
      .order('name, id')
    
    if (error) throw error
    
    const groups = new Map()
    
    data.forEach(variety => {
      const key = `${variety.name}|${variety.category_name}|${variety.subcategory_name}`
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key).push(variety)
    })
    
    const duplicates = Array.from(groups.entries())
      .filter(([key, varieties]) => varieties.length > 1)
      .map(([key, varieties]) => {
        const [name, category_name, subcategory_name] = key.split('|')
        return {
          name,
          category_name,
          subcategory_name,
          count: varieties.length,
          ids: varieties.map((v: any) => v.id),
          keepId: varieties[0].id,
          deleteIds: varieties.slice(1).map((v: any) => v.id)
        }
      })
    
    return NextResponse.json({ duplicates })
  } catch (error) {
    console.error('Error finding duplicates:', error)
    return NextResponse.json(
      { error: 'Failed to find duplicates' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    const { duplicates } = await request.json()
    
    if (!duplicates || !Array.isArray(duplicates)) {
      return NextResponse.json(
        { error: 'Invalid duplicates data' },
        { status: 400 }
      )
    }
    
    const deleteIds = duplicates.flatMap((d: any) => d.deleteIds)
    
    if (deleteIds.length === 0) {
      return NextResponse.json({ deletedCount: 0 })
    }
    
    console.log('Attempting to delete varieties with IDs:', deleteIds)
    
    const { data, error } = await supabaseAdmin
      .from('varieties')
      .delete()
      .in('id', deleteIds)
    
    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json(
        { error: `Delete failed: ${error.message}` },
        { status: 500 }
      )
    }
    
    console.log('Delete successful')
    return NextResponse.json({ deletedCount: deleteIds.length, data })
  } catch (error) {
    console.error('Error removing duplicates:', error)
    return NextResponse.json(
      { error: 'Failed to remove duplicates' },
      { status: 500 }
    )
  }
}
