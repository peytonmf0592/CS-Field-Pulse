-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'field_rep', 'viewer');
CREATE TYPE tour_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE sentiment_type AS ENUM ('promoter', 'passive', 'detractor');
CREATE TYPE follow_up_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE participant_type AS ENUM ('inspector', 'adjuster', 'other');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tours table
CREATE TABLE public.tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  field_rep_id UUID NOT NULL REFERENCES public.users(id),
  location TEXT,
  description TEXT,
  status tour_status DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Engagements table
CREATE TABLE public.engagements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  participant_email TEXT,
  participant_phone TEXT,
  sentiment sentiment_type NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  participant_type participant_type NOT NULL DEFAULT 'inspector',
  notes TEXT,
  voice_recording_url TEXT,
  photo_url TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follow-ups table
CREATE TABLE public.follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engagement_id UUID NOT NULL REFERENCES public.engagements(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES public.users(id),
  status follow_up_status DEFAULT 'pending',
  notes TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tours_field_rep ON public.tours(field_rep_id);
CREATE INDEX idx_tours_date ON public.tours(date);
CREATE INDEX idx_tours_status ON public.tours(status);
CREATE INDEX idx_engagements_tour ON public.engagements(tour_id);
CREATE INDEX idx_engagements_sentiment ON public.engagements(sentiment);
CREATE INDEX idx_follow_ups_engagement ON public.follow_ups(engagement_id);
CREATE INDEX idx_follow_ups_assigned ON public.follow_ups(assigned_to);
CREATE INDEX idx_follow_ups_status ON public.follow_ups(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON public.tours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engagements_updated_at BEFORE UPDATE ON public.engagements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follow_ups_updated_at BEFORE UPDATE ON public.follow_ups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Tours policies
CREATE POLICY "Field reps can view their own tours" ON public.tours
  FOR SELECT USING (
    field_rep_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'viewer')
    )
  );

CREATE POLICY "Field reps can create tours" ON public.tours
  FOR INSERT WITH CHECK (
    field_rep_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Field reps can update their own tours" ON public.tours
  FOR UPDATE USING (
    field_rep_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Engagements policies
CREATE POLICY "Users can view engagements for accessible tours" ON public.engagements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tours
      WHERE tours.id = engagements.tour_id
      AND (
        tours.field_rep_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid() AND role IN ('admin', 'viewer')
        )
      )
    )
  );

CREATE POLICY "Field reps can create engagements for their tours" ON public.engagements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tours
      WHERE tours.id = tour_id
      AND (
        tours.field_rep_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Field reps can update engagements for their tours" ON public.engagements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tours
      WHERE tours.id = tour_id
      AND (
        tours.field_rep_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- Follow-ups policies
CREATE POLICY "Users can view follow-ups assigned to them or created by them" ON public.follow_ups
  FOR SELECT USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'viewer')
    )
  );

CREATE POLICY "Users can create follow-ups" ON public.follow_ups
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'field_rep')
    )
  );

CREATE POLICY "Users can update follow-ups assigned to them" ON public.follow_ups
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Aggregated sentiment summary helper
CREATE OR REPLACE FUNCTION public.get_sentiment_summary()
RETURNS TABLE (
  participant_type participant_type,
  sentiment sentiment_type,
  total BIGINT
)
LANGUAGE sql
AS $$
  SELECT participant_type, sentiment, COUNT(*)::BIGINT AS total
  FROM public.engagements
  GROUP BY participant_type, sentiment
  ORDER BY participant_type, sentiment;
$$;

-- Create a function to automatically create a user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
