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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await request.json()
    const { 
      name, 
      description, 
      email, 
      phone, 
      website, 
      address, 
      owner_name, 
      owner_id 
    } = body
    const farmId = params.id
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Farm name and email are required' },
        { status: 400 }
      )
    }
    
    // Check if another farm with this email exists (excluding current farm)
    const { data: existingFarm } = await supabaseAdmin
      .from('farms')
      .select('id')
      .eq('email', email)
      .neq('id', farmId)
      .single()
    
    if (existingFarm) {
      return NextResponse.json(
        { error: 'Another farm with this email already exists' },
        { status: 409 }
      )
    }
    
    // Update farm
    const { data: farm, error } = await supabaseAdmin
      .from('farms')
      .update({ 
        name, 
        description, 
        email, 
        phone, 
        website, 
        address, 
        owner_name, 
        owner_id: owner_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', farmId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating farm:', error)
      return NextResponse.json(
        { error: 'Failed to update farm' },
        { status: 500 }
      )
    }
    
    if (!farm) {
      return NextResponse.json(
        { error: 'Farm not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ farm })
  } catch (error) {
    console.error('Error in PUT /api/farms/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const farmId = params.id
    
    // Delete the farm
    const { data: farm, error } = await supabaseAdmin
      .from('farms')
      .delete()
      .eq('id', farmId)
      .select()
      .single()
    
    if (error) {
      console.error('Error deleting farm:', error)
      return NextResponse.json(
        { error: 'Failed to delete farm' },
        { status: 500 }
      )
    }
    
    if (!farm) {
      return NextResponse.json(
        { error: 'Farm not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Farm deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/farms/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
