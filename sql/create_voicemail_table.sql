-- Create voicemails table
CREATE TABLE IF NOT EXISTS public.voicemails (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    from_number TEXT NOT NULL,
    duration INTEGER NOT NULL,
    recording_url TEXT NOT NULL,
    transcription TEXT,
    is_new BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voicemails ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their voicemails"
    ON voicemails
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_voicemails_updated_at
    BEFORE UPDATE ON voicemails
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();