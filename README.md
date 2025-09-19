# CS Field Pulse - Next.js

A modern field engagement tracking and sentiment analysis platform built with Next.js, Supabase, and TypeScript.

## Features

- 🔐 **Authentication System** - Secure login with Supabase Auth
- 🎨 **Glass Morphism UI** - Modern design with animated particle backgrounds
- 📊 **Dashboard Analytics** - Track tours, engagements, and sentiment metrics
- 🎤 **Voice Recording** - Capture voice notes during engagements
- 📸 **Photo Upload** - Add visual context to engagement records
- 😊 **Sentiment Analysis** - Categorize feedback as Promoter/Passive/Detractor
- 📱 **Mobile Responsive** - Full functionality across all devices
- 🔄 **Real-time Updates** - Live data synchronization with Supabase
- 📥 **Export Capabilities** - Download data in CSV, PDF, and Excel formats

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Charts:** Recharts
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd CSFPNJS
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
OPENAI_API_KEY=your_openai_api_key_here (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up Supabase database:

Run the SQL commands in `supabase/schema.sql` in your Supabase SQL editor to create the necessary tables and policies.

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── login/             # Authentication pages
│   ├── dashboard/         # Main application pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── Navigation.tsx    # Main navigation
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client configuration
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript type definitions
└── supabase/             # Database schema and migrations
```

## User Roles

The application supports three user roles:

- **Admin** - Full access to all features and data
- **Field Rep** - Can create tours, add engagements, manage their own data
- **Viewer** - Read-only access to view reports and analytics

## Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Database Schema

The application uses the following main tables:

- **users** - User profiles linked to Supabase Auth
- **tours** - Field tour/event records
- **engagements** - Individual participant interactions
- **follow_ups** - Action items from engagements

## Security

- Row Level Security (RLS) policies enforce data access rules
- Authentication required for all application routes
- Secure file uploads to Supabase Storage
- Input sanitization and validation

## Deployment

The application can be deployed to:

- Vercel (recommended for Next.js)
- Netlify
- Any Node.js hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is proprietary software.

## Support

For issues or questions, please contact the development team.
