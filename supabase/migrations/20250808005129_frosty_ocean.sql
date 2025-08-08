/*
  # Create events table

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `title` (text, required)
      - `description` (text, required)
      - `event_date` (timestamp with time zone, required)
      - `location` (text, optional)
      - `image_url` (text, optional)
      - `created_at` (timestamp with time zone, default now)
      - `updated_at` (timestamp with time zone, default now)

  2. Security
    - Enable RLS on `events` table
    - Add policy for anyone to read events
    - Add policy for users to create their own events
    - Add policy for users to update their own events
    - Add policy for users to delete their own events
*/

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read events" 
    ON public.events 
    FOR SELECT 
    USING (true);

CREATE POLICY "Users can create events" 
    ON public.events 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" 
    ON public.events 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" 
    ON public.events 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at 
    BEFORE UPDATE ON public.events 
    FOR EACH ROW 
    EXECUTE FUNCTION handle_updated_at();