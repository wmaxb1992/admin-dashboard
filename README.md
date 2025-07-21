# Master Catalog Admin Dashboard

A Next.js admin dashboard for managing and searching the master catalog of varieties.

## Features

- 🔍 **Search Varieties**: Full-text search across all 832+ varieties
- 📊 **Statistics**: Real-time stats on variety counts by category
- 🏷️ **Category Filtering**: Filter search results by category (Vegetables, Herbs, Flowers)
- 📋 **Detailed View**: See variety details including Baker Creek metadata
- 🎯 **Autocomplete**: Type-ahead search suggestions
- 📱 **Responsive**: Works on desktop and mobile

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Visit [http://localhost:3001](http://localhost:3001)

## Database Requirements

Make sure your Supabase database has:
- The master catalog imported (832+ varieties)
- Search indexing set up (`19-setup-search-indexing.sql`)
- Search functions available (`search_varieties`, `get_variety_suggestions`)

## Usage

### Search Varieties
- Enter search terms like "tomato", "basil", "Cherokee Purple"
- Use category filters to narrow results
- View detailed information including growing requirements

### View Statistics
- See total variety count
- View breakdown by category (Vegetables, Herbs, Flowers)
- Monitor catalog growth over time

## API Functions

The app uses these Supabase functions:
- `search_varieties(search_term, category_filter)` - Full-text search
- `get_variety_suggestions(search_term, limit)` - Autocomplete
- Standard table queries for categories, subcategories, varieties

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Search**: PostgreSQL full-text search with GIN indexes

## Development

The admin dashboard runs on port 3001 to avoid conflicts with the main farm dashboard (port 3000).

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

```
admin-dashboard/
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main dashboard page
├── lib/
│   └── supabase.ts      # Database client and API functions
├── .env.example         # Environment variables template
└── package.json         # Dependencies and scripts
```

## Contributing

1. Make sure the master catalog is properly set up
2. Test search functionality thoroughly
3. Ensure responsive design works on all devices
4. Add new features as needed for catalog management
