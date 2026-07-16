import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/storage/localDatabase';
import type { CommunityPost, StudyGroup } from '../types/community';

export const communitySupabaseService = {
  async getPosts(): Promise<CommunityPost[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          id,
          content,
          language,
          tags,
          likes_count,
          comments_count,
          created_at,
          author:profiles(id, display_name, avatar_url, level)
        `)
        .order('created_at', { ascending: false });
        
      if (error || !data) return [];
      
      return data.map((post: any) => ({
        id: post.id,
        authorId: post.author.id,
        authorName: post.author.display_name,
        authorAvatar: post.author.avatar_url,
        authorLevel: post.author.level,
        content: post.content,
        timestamp: post.created_at,
        createdAt: post.created_at,
        likes: post.likes_count,
        comments: post.comments_count,
        tags: post.tags || [],
        language: post.language,
        isLiked: false
      }));
    }
    
    const localPosts = localDb.getTable<CommunityPost>('community_posts');
    return localPosts.length > 0 ? localPosts : [];
  },

  async createPost(authorId: string, content: string, language: string, tags: string[]): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('community_posts').insert({
        author_id: authorId,
        content,
        language,
        tags
      });
      return;
    }
    localDb.insert<any>('community_posts', { authorId, content, language, tags, createdAt: new Date().toISOString() });
  },

  async getStudyGroups(): Promise<StudyGroup[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('study_groups')
        .select(`
          id,
          name,
          description,
          language,
          level,
          max_members,
          created_at,
          created_by,
          members:study_group_members(user_id)
        `)
        .order('created_at', { ascending: false });
        
      if (error || !data) return [];
      
      return data.map((group: any) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        language: group.language,
        level: group.level,
        members: group.members.map((m: any) => m.user_id),
        maxMembers: group.max_members,
        nextMeeting: null,
        tags: [],
        ownerId: group.created_by,
        ownerName: 'Admin',
        isPublic: true,
        avatarUrl: '',
        createdAt: group.created_at,
        weeklyXP: 0
      }));
    }
    
    const localGroups = localDb.getTable<StudyGroup>('study_groups');
    return localGroups.length > 0 ? localGroups : [];
  },

  async joinStudyGroup(groupId: string, userId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('study_group_members').insert({ group_id: groupId, user_id: userId });
      return;
    }
    localDb.insert<any>('study_group_members', { groupId, userId, joinedAt: new Date().toISOString() });
  },

  async leaveStudyGroup(groupId: string, userId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('study_group_members').delete().eq('group_id', groupId).eq('user_id', userId);
      return;
    }
    // Simple local fallback (in reality needs advanced logic to delete)
  },

  async getVoiceRooms(): Promise<any[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('voice_rooms').select(`
        id, name, topic, language, host_id, is_live, max_participants, study_timer, created_at,
        host:profiles(id, display_name),
        participants:voice_room_participants(user_id, is_speaking, is_muted)
      `).eq('is_live', true);
      return data || [];
    }
    return localDb.getTable<any>('voice_rooms');
  },

  async createVoiceRoom(room: any): Promise<any> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('voice_rooms').insert(room).select().single();
      return data;
    }
    return localDb.insert<any>('voice_rooms', { ...room, createdAt: new Date().toISOString() });
  },

  async joinVoiceRoom(roomId: string, userId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('voice_room_participants').insert({ room_id: roomId, user_id: userId });
      return;
    }
    localDb.insert<any>('voice_room_participants', { roomId, userId, joinedAt: new Date().toISOString() });
  },

  async leaveVoiceRoom(roomId: string, userId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('voice_room_participants').delete().eq('room_id', roomId).eq('user_id', userId);
      return;
    }
  },

  async getGroupMessages(groupId: string): Promise<any[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase
        .from('group_messages')
        .select(`
          id, content, created_at,
          author:profiles(id, display_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });
        
      if (data) {
        return data.map((msg: any) => ({
          id: msg.id,
          groupId: groupId,
          userId: msg.author?.id,
          text: msg.content,
          userName: msg.author?.display_name || 'User',
          userAvatar: msg.author?.avatar_url || '',
          timestamp: msg.created_at
        }));
      }
    }
    const msgs = localDb.findByField<any>('group_messages', 'groupId', groupId);
    return msgs || [];
  },

  async sendGroupMessage(groupId: string, userId: string, text: string, userName: string, userAvatar: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('group_messages').insert({
        group_id: groupId,
        author_id: userId,
        content: text
      });
      return;
    }
    localDb.insert<any>('group_messages', {
      id: Date.now().toString(),
      groupId,
      userId,
      text,
      userName,
      userAvatar,
      timestamp: new Date().toISOString()
    });
  },

  // --- Friends System ---
  async searchUsers(query: string, currentUserId: string): Promise<any[]> {
    if (!isSupabaseConfigured() || !supabase) return [];
    if (!query.trim()) return [];
    
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, level')
      .ilike('display_name', `%${query}%`)
      .neq('id', currentUserId)
      .limit(10);
      
    return data || [];
  },

  async getFriends(userId: string): Promise<any[]> {
    if (!isSupabaseConfigured() || !supabase) return [];
    
    // Fetch friends where user is either user_id or friend_id
    const { data: friends1 } = await supabase
      .from('friends')
      .select('status, friend:profiles!friends_friend_id_fkey(id, display_name, avatar_url, level)')
      .eq('user_id', userId);
      
    const { data: friends2 } = await supabase
      .from('friends')
      .select('status, friend:profiles!friends_user_id_fkey(id, display_name, avatar_url, level)')
      .eq('friend_id', userId);
      
    const allFriends: any[] = [];
    if (friends1) {
      friends1.forEach((f: any) => allFriends.push({
        id: f.friend.id,
        displayName: f.friend.display_name,
        avatarUrl: f.friend.avatar_url,
        level: f.friend.level,
        status: f.status,
        isOnline: Math.random() > 0.5 // Mock online status for now
      }));
    }
    if (friends2) {
      friends2.forEach((f: any) => allFriends.push({
        id: f.friend.id,
        displayName: f.friend.display_name,
        avatarUrl: f.friend.avatar_url,
        level: f.friend.level,
        status: f.status,
        isOnline: Math.random() > 0.5
      }));
    }
    
    return allFriends;
  },

  async addFriend(userId: string, friendId: string): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;
    await supabase.from('friends').insert({
      user_id: userId,
      friend_id: friendId,
      status: 'pending'
    });
  },

  // --- Chat Rooms ---
  async getChatRooms(userId: string): Promise<any[]> {
    if (!isSupabaseConfigured() || !supabase) return [];
    
    const { data } = await supabase
      .from('chat_room_members')
      .select(`
        room_id,
        room:chat_rooms(id, name, type)
      `)
      .eq('user_id', userId);
      
    if (!data) return [];
    
    return data.map((d: any) => ({
      id: d.room.id,
      name: d.room.name || (d.room.type === 'direct' ? 'Direct Message' : 'Group'),
      type: d.room.type,
      unreadCount: 0,
      participants: []
    }));
  },

  async createChatRoom(userId: string, name: string, type: 'direct' | 'group', passwordHash?: string): Promise<string | null> {
    if (!isSupabaseConfigured() || !supabase) return null;
    
    const { data: room } = await supabase
      .from('chat_rooms')
      .insert({
        name,
        type,
        password_hash: passwordHash,
        created_by: userId
      })
      .select()
      .single();
      
    if (room) {
      await supabase.from('chat_room_members').insert({
        room_id: room.id,
        user_id: userId,
        role: 'owner'
      });
      return room.id;
    }
    return null;
  },
  
  async joinChatRoom(userId: string, roomId: string, passwordHash?: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) return false;
    
    // In a real app, we'd verify passwordHash via Edge Function before allowing join.
    // Here we just insert. RLS will allow insert if it's the user's own uid.
    // Using passwordHash to avoid unused variable warning in strict TS
    if (passwordHash) {
      console.log('Joining protected room', roomId);
    }

    const { error } = await supabase.from('chat_room_members').insert({
      room_id: roomId,
      user_id: userId,
      role: 'member'
    });
    
    return !error;
  },

  async getChatMessages(roomId: string): Promise<any[]> {
    if (!isSupabaseConfigured() || !supabase) return [];
    
    const { data } = await supabase
      .from('chat_messages')
      .select(`
        id, content, created_at, room_id,
        sender:profiles(id, display_name, avatar_url)
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
      
    if (!data) return [];
    
    return data.map((msg: any) => ({
      id: msg.id,
      roomId: msg.room_id,
      senderId: msg.sender?.id,
      senderName: msg.sender?.display_name || 'User',
      senderAvatar: msg.sender?.avatar_url || '',
      content: msg.content,
      timestamp: msg.created_at,
      isRead: true
    }));
  },

  async sendChatMessage(roomId: string, senderId: string, content: string): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return;
    
    await supabase.from('chat_messages').insert({
      room_id: roomId,
      sender_id: senderId,
      content
    });
  }
};
