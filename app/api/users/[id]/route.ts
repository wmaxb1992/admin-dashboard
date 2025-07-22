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
    const { name, email, phone } = body
    const userId = params.id
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }
    
    // Check if another user with this email exists (excluding current user)
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', userId)
      .single()
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Another user with this email already exists' },
        { status: 409 }
      )
    }
    
    // Update user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ 
        name, 
        email, 
        phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error in PUT /api/users/[id]:', error)
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
    const userId = params.id
    
    // First, delete all farms owned by this user
    const { error: farmsError } = await supabaseAdmin
      .from('farms')
      .delete()
      .eq('owner_id', userId)
    
    if (farmsError) {
      console.error('Error deleting user farms:', farmsError)
      return NextResponse.json(
        { error: 'Failed to delete user farms' },
        { status: 500 }
      )
    }
    
    // Then delete the user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      )
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'User and associated farms deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/users/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
