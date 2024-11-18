-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    recipient_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read) WHERE NOT is_read;

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own messages"
    ON messages
    FOR SELECT
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id
    );

CREATE POLICY "Users can send messages"
    ON messages
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read"
    ON messages
    FOR UPDATE
    USING (auth.uid() = recipient_id)
    WITH CHECK (
        auth.uid() = recipient_id AND
        OLD.is_read = false AND
        NEW.is_read = true AND
        OLD.content = NEW.content AND
        OLD.sender_id = NEW.sender_id AND
        OLD.recipient_id = NEW.recipient_id
    );

-- Grant permissions
GRANT ALL ON messages TO authenticated;