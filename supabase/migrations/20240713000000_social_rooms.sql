-- Social & Rooms Schema Migration

-- 1. Friends System
CREATE TABLE IF NOT EXISTS public.friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, friend_id)
);

-- RLS for friends
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own friends" ON public.friends;
CREATE POLICY "Users can view their own friends"
    ON public.friends FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can add friends" ON public.friends;
CREATE POLICY "Users can add friends"
    ON public.friends FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their friend status" ON public.friends;
CREATE POLICY "Users can update their friend status"
    ON public.friends FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can remove friends" ON public.friends;
CREATE POLICY "Users can remove friends"
    ON public.friends FOR DELETE
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 2. Chat Rooms & Messages
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
    password_hash TEXT, -- For protected group rooms
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.chat_room_members (
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.message_reads (
    message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (message_id, user_id)
);

-- RLS for chat_rooms
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view rooms they are in" ON public.chat_rooms;
CREATE POLICY "Users can view rooms they are in"
    ON public.chat_rooms FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.chat_room_members
        WHERE room_id = public.chat_rooms.id AND user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create rooms" ON public.chat_rooms;
CREATE POLICY "Users can create rooms"
    ON public.chat_rooms FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- RLS for chat_room_members
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view members of their rooms" ON public.chat_room_members;
CREATE POLICY "Users can view members of their rooms"
    ON public.chat_room_members FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.chat_room_members as m
        WHERE m.room_id = public.chat_room_members.room_id AND m.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can join rooms" ON public.chat_room_members;
CREATE POLICY "Users can join rooms"
    ON public.chat_room_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their rooms" ON public.chat_messages;
CREATE POLICY "Users can view messages in their rooms"
    ON public.chat_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.chat_room_members
        WHERE room_id = public.chat_messages.room_id AND user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can send messages to their rooms" ON public.chat_messages;
CREATE POLICY "Users can send messages to their rooms"
    ON public.chat_messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.chat_room_members
            WHERE room_id = public.chat_messages.room_id AND user_id = auth.uid()
        )
    );
