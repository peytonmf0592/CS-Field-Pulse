# CS Field Pulse - Deployment Guide

## 🚀 Quick Deployment Steps

### Step 1: Create GitHub Repository

Since GitHub CLI isn't installed, manually create the repository:

1. Go to https://github.com/new
2. Repository name: `cs-field-pulse`
3. Description: `Field engagement tracking platform with Next.js, Supabase, and TypeScript`
4. Set to **Public**
5. DO NOT initialize with README, .gitignore, or license
6. Click **Create repository**

### Step 2: Push to GitHub

After creating the repository, run these commands in your terminal:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/cs-field-pulse.git

# Push the code
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 3: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `OPENAI_API_KEY` - (Optional) OpenAI API key for voice transcription
4. Click **Deploy**

### Step 4: Set up Supabase

1. Create a project at https://supabase.com
2. Go to SQL Editor
3. Copy and run the entire contents of `/supabase/schema.sql`
4. Get your API keys from Settings > API
5. Update Vercel environment variables with your keys

## 📋 Environment Variables

Create these in Vercel Dashboard > Settings > Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key (optional)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 🔧 Local Development

To run locally:

```bash
npm install
npm run dev
```

## 📱 Features Included

- ✅ Glass morphism UI with dark theme
- ✅ Dashboard with real-time stats
- ✅ Sentiment analysis charts
- ✅ Field coverage map visualization
- ✅ Inspector and Adjuster management
- ✅ Voice recording capabilities
- ✅ Photo upload with preview
- ✅ Mobile responsive design
- ✅ Supabase authentication
- ✅ Row-level security

## 🎯 Production Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel account connected
- [ ] Environment variables configured
- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

## 🆘 Troubleshooting

### Build Errors
- Ensure Node.js 18+ is used
- Check all environment variables are set
- Verify Supabase URLs are correct

### Authentication Issues
- Confirm Supabase Auth is enabled
- Check redirect URLs in Supabase dashboard
- Verify API keys are correct

### Database Errors
- Ensure schema.sql was fully executed
- Check RLS policies are enabled
- Verify service role key has proper permissions

## 📞 Support

For issues, create a GitHub issue or contact the development team.

---

**Ready to deploy!** Follow the steps above to get CS Field Pulse live. 🚀