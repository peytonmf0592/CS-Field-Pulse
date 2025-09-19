# CS Field Pulse Requirements

## Project Overview
- **Project Name:** CS Field Pulse
- **Purpose:** Web-based internal tool for SeekNow's Contractor Success Team
- **Core Function:** Log, track, and analyze field interactions with inspectors and adjusters
- **Coverage:** All U.S. markets
- **Key Requirements:** Mobile-friendly, highly visual, built for fast field use, front-end facing only (no WordPress admin access except for main admin)

## User Management

### Pre-configured Admin Accounts
1. **Kyle Gray**
   - Username: kgray
   - Role: Contractor Success Manager
   - Location: Cincinnati, OH

2. **Gino Lazio**
   - Username: glazio
   - Role: Contractor Success Liaison
   - Location: Phoenix, AZ

3. **Peyton Fowlkes**
   - Username: pfowlkes
   - Role: Contractor Success Liaison
   - Location: Richmond, VA

### Permissions (All Users)
- Create/edit/delete inspector and adjuster profiles
- Log engagement data, sentiment, and follow-ups
- Change sentiment with reason logging
- Add voice memos and photos
- Filter dashboards and export data
- View all markets and all user activity

## Database Structure

### Core Tables
1. **Inspectors/Adjusters** (csfp_inspectors)
   - name
   - role (Inspector/Adjuster)
   - city
   - market
   - rfm
   - cat_local (CAT/Local/Mentor)
   - is_mentor
   - carrier (for adjusters)
   - sentiment (Promoter/Passive/Detractor)
   - personal_notes

2. **Engagements** (csfp_engagements)
   - inspector_id
   - user_id
   - sentiment
   - notes
   - engagement_date
   - follow_up_needed
   - tour_id (for market tours)

3. **Sentiment Changes** (csfp_sentiment_changes)
   - inspector_id
   - user_id
   - old_sentiment
   - new_sentiment
   - reason
   - changed_at

4. **Media** (csfp_media)
   - inspector_id
   - user_id
   - media_type (photo/voice_memo)
   - media_url
   - caption

## Market Tour Feature

### New Tables Required
1. **Market Tours** (csfp_market_tours)
   - user_id
   - market_name
   - region
   - city
   - rfm_name
   - start_date
   - end_date
   - status (active/completed)

2. **Tour Engagements** (csfp_tour_engagements)
   - tour_id
   - engagement_id
   - engagement_type (inspector/adjuster)

3. **Tour Summaries** (csfp_tour_summaries)
   - tour_id
   - summary_type (market/inspectors/adjusters)
   - summary_content
   - key_insights
   - action_items

### Tour Functionality
- Start/end market tours
- Auto-link engagements to active tours
- Track common issues during tours
- Generate automated summaries
- Export tour reports

## UI/UX Requirements

### Design System
- **Visual Style:** Glassmorphism (frosted glass effect)
- **Background:** Black with frosted translucent panels
- **Colors:**
  - Primary: SeekNow Green
  - Secondary: SeekNow Orange
  - Sentiment: Red (Detractor), Yellow (Passive), Green (Promoter)
- **SeekNow Tesseract:** Animation on login, watermark on pages

### Key Pages (via shortcodes)
1. Dashboard - [csfp_dashboard]
2. Inspectors List - [csfp_inspectors]
3. Adjusters List - [csfp_adjusters]
4. Profile View - [csfp_profile]

### Mobile Requirements
- Touch-friendly buttons (44x44px minimum)
- Collapsible filters
- Swipe gestures
- No horizontal scrolling
- Optimized for iPhone

## Core Features

### Dashboard
- National vs Market view toggle
- Sentiment distribution charts
- Total inspectors/adjusters count
- Recent activity feed
- Clickable chart sections for filtered views

### List Views
- Filter by: City, Role, Sentiment, CS Liaison, Date Range
- Card-based layout showing:
  - Name, Role, City/Market
  - Sentiment status
  - Last engagement
  - Visual indicators (follow-up needed, no photo, etc.)

### Profile Management
- Edit all fields
- Sentiment change with history
- Engagement timeline
- Media uploads (photos, voice memos)
- Personal notes section

### Engagement Logging
- Quick sentiment selection
- Notes field
- Follow-up flag
- Common issues checkboxes (for tours)
- Auto-link to active tour

### Export Functionality
- PDF reports
- Excel/CSV data
- Filtered exports
- Tour summaries

## Implementation Priority
1. Core CRUD operations
2. Market tour functionality
3. Dashboard with statistics
4. Filtering system
5. Media uploads
6. Export features
7. Mobile optimization
8. Advanced analytics