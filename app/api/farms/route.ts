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
    
    // First, fetch all farms
    const { data: farms, error: farmsError } = await supabaseAdmin
      .from('farms')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (farmsError) {
      console.error('Error fetching farms:', farmsError)
      return NextResponse.json(
        { error: 'Failed to fetch farms' },
        { status: 500 }
      )
    }

    // Then fetch all users to match with farm owners
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, phone')
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      // Continue without user data if users table has issues
    }

    // Combine farms with their owner information
    const farmsWithOwners = farms?.map(farm => ({
      ...farm,
      owner: users?.find(user => user.id === farm.owner_id) || null
    })) || []
    
    return NextResponse.json({ farms: farmsWithOwners })
  } catch (error) {
    console.error('Error in GET /api/farms:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Farm name and email are required' },
        { status: 400 }
      )
    }
    
    // Check if farm with this email already exists
    const { data: existingFarm } = await supabaseAdmin
      .from('farms')
      .select('id')
      .eq('email', email)
      .single()
    
    if (existingFarm) {
      return NextResponse.json(
        { error: 'Farm with this email already exists' },
        { status: 409 }
      )
    }
    
    // Create new farm
    const { data: farm, error } = await supabaseAdmin
      .from('farms')
      .insert([{ 
        name, 
        description, 
        email, 
        phone, 
        website, 
        address, 
        owner_name, 
        owner_id: owner_id || null 
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating farm:', error)
      return NextResponse.json(
        { error: 'Failed to create farm' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ farm }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/farms:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
