/*
  # Create marketplace items table

  1. New Tables
    - `marketplace_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `title` (text, required)
      - `description` (text, required)
      - `price` (numeric, required)
      - `category` (text, optional)
      - `condition` (text, optional - new, used, like new)
      - `image_url` (text, optional)
      - `location` (text, optional)
      - `status` (text, default 'available' - available, sold, pending)
      - `created_at` (timestamp with time zone, default now)
      - `updated_at` (timestamp with time zone, default now)

  2. Security
    - Enable RLS on `marketplace_items` table
    - Add policy for anyone to read marketplace items
    - Add policy for users to create their own marketplace items
    - Add policy for users to update their own marketplace items
    - Add policy for users to delete their own marketplace items

  3. Constraints
    - Add check constraint for condition values
    - Add check constraint for status values
*/

-- Create marketplace_items table
CREATE TABLE IF NOT EXISTS public.marketplace_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    category TEXT,
    condition TEXT,
    image_url TEXT,
    location TEXT,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read marketplace items" 
    ON public.marketplace_items 
    FOR SELECT 
    USING (true);

CREATE POLICY "Users can create marketplace items" 
    ON public.marketplace_items 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own marketplace items" 
    ON public.marketplace_items 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own marketplace items" 
    ON public.marketplace_items 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Add check constraints
ALTER TABLE public.marketplace_items 
ADD CONSTRAINT marketplace_items_condition_check 
CHECK (condition IN ('new', 'used', 'like new'));

ALTER TABLE public.marketplace_items 
ADD CONSTRAINT marketplace_items_status_check 
CHECK (status IN ('available', 'sold', 'pending'));

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at 
    BEFORE UPDATE ON public.marketplace_items 
    FOR EACH ROW 
    EXECUTE FUNCTION handle_updated_at();