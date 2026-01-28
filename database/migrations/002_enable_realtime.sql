-- Enable Realtime for all tables
-- This must be executed in Supabase SQL Editor

-- Enable realtime on sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;

-- Enable realtime on items table
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;

-- Enable realtime on responses table
ALTER PUBLICATION supabase_realtime ADD TABLE public.responses;

-- Enable realtime on participants table
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;

-- Verify realtime is enabled
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
