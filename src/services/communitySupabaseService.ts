import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/storage/localDatabase';
import type { CommunityPost, StudyGroup } from '../types/community';
import type { User } from '../types';

export type CommunityLearner = Pick<User, 'id' | 'displayName' | 'username' | 'avatarUrl' | 'level'>;

export type FriendConnection = CommunityLearner & {
  connectionId: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  direction: 'incoming' | 'outgoing';
  isOnline: boolean;
};

export type FriendRecord = {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  displayName: string;
  username: string;
  avatarUrl: string;
  level: number;
  totalXP: number;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_FRIEND_AVATAR = '/mascots/pepe_mascot_avatar.png';

function toPublicLearner(profile: Partial<User> & { id: string }): CommunityLearner {
  return {
    id: profile.id,
    displayName: profile.displayName?.trim() || 'Học viên EchLearn',
    username: profile.username?.trim().replace(/^@+/, '') || 'hoc_vien',
    avatarUrl: profile.avatarUrl?.trim() || DEFAULT_FRIEND_AVATAR,
    level: profile.level || 1,
  };
}

export function toPublicLearnerFromRow(profile: any): CommunityLearner | null {
  if (!profile?.id) return null;
  return toPublicLearner({
    id: profile.id,
    displayName: profile.display_name,
    username: profile.username,
    avatarUrl: profile.avatar_url,
    level: profile.level,
  });
}

export function assertFriendRequestIsValid(userId: string, friendId: string) {
  if (!userId || !friendId || userId === friendId) {
    throw new Error('FRIEND_REQUEST_INVALID');
  }
}

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
          created_at,
          author:profiles(id, display_name, avatar_url, level)
        `)
        .order('created_at', { ascending: false });
        
      if (!error && data && data.length > 0) {
        return data.map((post: any) => ({
          id: post.id,
          authorId: post.author?.id || 'anonymous',
          authorName: post.author?.display_name || 'Học Viên Ech',
          authorAvatar: post.author?.avatar_url || '/mascots/pepe_mascot_avatar.png',
          authorLevel: post.author?.level || 1,
          content: post.content,
          timestamp: post.created_at,
          createdAt: post.created_at,
          likes: post.likes_count || 0,
          comments: [],
          tags: post.tags || [],
          language: post.language || 'vi',
          isLiked: false
        }));
      }
    }
    
    const localPosts = localDb.getTable<CommunityPost>('community_posts');
    if (localPosts.length > 0) return localPosts;

    return [
      {
        id: 'post_001',
        authorId: 'user_001',
        authorName: 'Minh Anh (IELTS 8.0)',
        authorAvatar: '/mascots/pepe_mascot_avatar.png',
        authorLevel: 12,
        content: 'Chào cả nhà! Hôm nay mình vừa hoàn thành chuỗi 30 ngày luyện Speaking với Pepe Coach. Phát âm được cải thiện rõ rệt!',
        createdAt: new Date().toISOString(),
        likes: 24,
        comments: [],
        tags: ['IELTS', 'Speaking', 'Streak'],
        language: 'en',
        isLiked: false
      },
      {
        id: 'post_002',
        authorId: 'user_002',
        authorName: 'Kenji Neko',
        authorAvatar: '/mascots/pepe_mascot_tutor.png',
        authorLevel: 8,
        content: 'みんな、こんにちは！Hôm nay cùng luyện 50 từ vựng N5 chủ đề Du lịch Nhật Bản nhé!',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        likes: 18,
        comments: [],
        tags: ['Japanese', 'JLPT N5', 'Kanji'],
        language: 'ja',
        isLiked: false
      }
    ];
  },

  async createPost(authorId: string, content: string, language: string, tags: string[]): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('community_posts').insert({
        author_id: authorId,
        content,
        language,
        tags
      });
    }
    localDb.insert<any>('community_posts', {
      id: crypto.randomUUID(),
      authorId,
      authorName: 'Học Viên Ech',
      authorAvatar: '/mascots/pepe_mascot_avatar.png',
      authorLevel: 1,
      content,
      language,
      tags,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    });
  },

  async getStudyGroups(): Promise<StudyGroup[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('study_groups')
        .select(`
          id, name, description, language, max_members, created_at,
          owner:profiles(id, display_name)
        `);
        
      if (!error && data && data.length > 0) {
        return data.map((g: any) => ({
          id: g.id,
          name: g.name,
          description: g.description,
          language: g.language,
          level: 'A2-B2',
          ownerId: g.owner?.id || 'admin',
          ownerName: g.owner?.display_name || 'Admin',
          members: [],
          maxMembers: g.max_members || 20,
          isPublic: true,
          tags: [g.language],
          avatarUrl: '/mascots/pepe_mascot_avatar.png',
          createdAt: g.created_at,
          weeklyXP: 450
        }));
      }
    }

    const localGroups = localDb.getTable<StudyGroup>('study_groups');
    if (localGroups.length > 0) return localGroups;

    return [
      {
        id: 'group_001',
        name: 'Clb Luyện Nói IELTS Academic 8.0+',
        description: 'Nhóm cùng luyện Speaking Part 1, 2, 3 mỗi tối lúc 20h.',
        language: 'en',
        level: 'B2-C1',
        ownerId: 'admin_001',
        ownerName: 'Hoàng Yến',
        members: [],
        maxMembers: 20,
        isPublic: true,
        tags: ['IELTS', 'Speaking'],
        avatarUrl: '/mascots/pepe_mascot_tutor.png',
        createdAt: new Date().toISOString(),
        weeklyXP: 1250
      },
      {
        id: 'group_002',
        name: 'Cùng Học Tiếng Nhật N5 - N4 Nhanh Nhất',
        description: 'Luyện chữ Hán Kanji, ngữ pháp Minna no Nihongo.',
        language: 'ja',
        level: 'A1-A2',
        ownerId: 'admin_002',
        ownerName: 'Kenji',
        members: [],
        maxMembers: 20,
        isPublic: true,
        tags: ['Japanese', 'N5'],
        avatarUrl: '/mascots/pepe_mascot_celebrate.png',
        createdAt: new Date().toISOString(),
        weeklyXP: 850
      }
    ];
  },

  async createStudyGroup(name: string, description: string, language: string, creatorId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('study_groups').insert({
        name,
        description,
        language,
        created_by: creatorId
      });
    }
    localDb.insert<any>('study_groups', {
      id: crypto.randomUUID(),
      name,
      description,
      language,
      level: 'A1-B2',
      ownerId: creatorId,
      ownerName: 'Bạn',
      members: [],
      maxMembers: 20,
      isPublic: true,
      tags: [language],
      avatarUrl: '/mascots/pepe_mascot_avatar.png',
      createdAt: new Date().toISOString(),
      weeklyXP: 0
    });
  },

  async searchUsers(query: string): Promise<any[]> {
    if (!query) return [];
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, level')
        .ilike('display_name', `%${query}%`)
        .limit(10);
      if (data) return data.map((u: any) => ({ id: u.id, displayName: u.display_name, avatarUrl: u.avatar_url, level: u.level || 1 }));
    }

    const users = localDb.getTable<any>('users');
    return users
      .filter((u: any) => u.displayName?.toLowerCase().includes(query.toLowerCase()) || u.username?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10)
      .map((u: any) => ({ id: u.id, displayName: u.displayName, avatarUrl: u.avatarUrl || '/mascots/pepe_mascot_avatar.png', level: u.level || 1 }));
  },

  async getVoiceRooms(): Promise<any[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase
        .from('voice_rooms')
        .select(`
          id, name, topic, language, max_participants, is_live, created_at,
          host:profiles(id, display_name, avatar_url),
          participants:voice_room_participants(user_id, profiles(display_name, avatar_url))
        `);
      if (data && data.length > 0) return data;
    }

    return [
      {
        id: 'voice_001',
        name: 'Phòng Giao Tiếp Tiếng Anh Lofi',
        topic: 'Coffee Shop & Travel Conversations',
        language: 'English',
        maxParticipants: 8,
        hostId: 'host_001',
        hostName: 'Teacher Alex',
        isLive: true,
        studyTimer: 1200,
        createdAt: new Date().toISOString(),
        participants: [
          { id: 'user_1', displayName: 'Teacher Alex', avatarUrl: '/mascots/pepe_mascot_tutor.png', isMuted: false, isSpeaking: true },
          { id: 'user_2', displayName: 'Minh Tuấn', avatarUrl: '/mascots/pepe_mascot_avatar.png', isMuted: true, isSpeaking: false }
        ]
      },
      {
        id: 'voice_002',
        name: '日本語 カフェ Room (Japanese Speaking)',
        topic: 'Daily Life & Anime Japanese',
        language: 'Japanese',
        maxParticipants: 8,
        hostId: 'host_002',
        hostName: 'Yuki-chan',
        isLive: true,
        studyTimer: 2400,
        createdAt: new Date().toISOString(),
        participants: [
          { id: 'user_3', displayName: 'Yuki-chan', avatarUrl: '/mascots/pepe_mascot_celebrate.png', isMuted: false, isSpeaking: false }
        ]
      }
    ];
  },

  async createVoiceRoom(roomData: any): Promise<any> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('voice_rooms').insert(roomData).select().single();
      if (data) return data;
    }
    return {
      id: crypto.randomUUID(),
      ...roomData,
      createdAt: new Date().toISOString()
    };
  },

  async joinVoiceRoom(roomId: string, userId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('voice_room_participants').insert({ room_id: roomId, user_id: userId });
    }
  },

  async leaveVoiceRoom(roomId: string, userId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('voice_room_participants').delete().eq('room_id', roomId).eq('user_id', userId);
    }
  },

  async getFriends(userId: string): Promise<any[]> {
    const allFriends: any[] = [];
    if (isSupabaseConfigured() && supabase) {
      const { data: friends1 } = await supabase.from('friends').select('status, friend:profiles!friends_friend_id_fkey(id, display_name, avatar_url, level)').eq('user_id', userId);
      if (friends1) {
        friends1.forEach((f: any) => allFriends.push({
          id: f.friend.id,
          displayName: f.friend.display_name,
          avatarUrl: f.friend.avatar_url,
          level: f.friend.level,
          status: f.status,
          isOnline: true
        }));
      }
    }
    
    if (allFriends.length === 0) {
      allFriends.push(
        { id: 'friend_001', displayName: 'Hoàng Yến (IELTS 8.5)', avatarUrl: '/mascots/pepe_mascot_tutor.png', level: 15, status: 'accepted', isOnline: true },
        { id: 'friend_002', displayName: 'Kenji Japanese', avatarUrl: '/mascots/pepe_mascot_celebrate.png', level: 9, status: 'accepted', isOnline: false }
      );
    }

    return allFriends;
  },

  async addFriend(userId: string, friendId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('friends').insert({ user_id: userId, friend_id: friendId, status: 'pending' });
    }
    localDb.insert<any>('friends', { id: crypto.randomUUID(), userId, friendId, status: 'accepted', createdAt: new Date().toISOString() });
  },

  // --- Chat Rooms ---
  async getChatRooms(userId: string): Promise<any[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('chat_room_members').select('room_id, room:chat_rooms(id, name, type)').eq('user_id', userId);
      if (data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.room.id,
          name: d.room.name || (d.room.type === 'direct' ? 'Direct Message' : 'Group'),
          type: d.room.type,
          unreadCount: 0,
          participants: []
        }));
      }
    }

    return [
      { id: 'chat_001', name: 'Phòng Trò Chuyện Học Viên IELTS', type: 'group', unreadCount: 2, participants: [] },
      { id: 'chat_002', name: 'Phòng Luyện Tiếng Nhật N5-N1', type: 'group', unreadCount: 0, participants: [] }
    ];
  },

  async createChatRoom(userId: string, name: string, type: 'direct' | 'group', passwordHash?: string): Promise<string | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data: room } = await supabase.from('chat_rooms').insert({ name, type, password_hash: passwordHash || null, created_by: userId }).select().single();
      if (room) {
        await supabase.from('chat_room_members').insert({ room_id: room.id, user_id: userId, role: 'owner' });
        return room.id;
      }
    }
    const newRoomId = crypto.randomUUID();
    localDb.insert<any>('chat_rooms', { id: newRoomId, name, type, createdBy: userId, createdAt: new Date().toISOString() });
    return newRoomId;
  },

  async joinChatRoom(userId: string, roomId: string, passwordHash?: string): Promise<boolean> {
    if (passwordHash) {
      console.log('Joining protected room', roomId, passwordHash);
    }
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('chat_room_members').insert({ room_id: roomId, user_id: userId, role: 'member' });
      return !error;
    }
    return true;
  },

  async getGroupMessages(groupId: string): Promise<any[]> {
    return this.getChatMessages(groupId);
  },

  async sendGroupMessage(groupId: string, senderId: string, content: string): Promise<void> {
    return this.sendChatMessage(groupId, senderId, content);
  },

  async getChatMessages(roomId: string): Promise<any[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase
        .from('chat_messages')
        .select(`
          id, content, created_at, room_id,
          sender:profiles(id, display_name, avatar_url)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
        
      if (data && data.length > 0) {
        return data.map((msg: any) => ({
          id: msg.id,
          roomId: msg.room_id,
          senderId: msg.sender?.id,
          senderName: msg.sender?.display_name || 'Học Viên',
          senderAvatar: msg.sender?.avatar_url || '/mascots/pepe_mascot_avatar.png',
          content: msg.content,
          timestamp: msg.created_at,
          isRead: true
        }));
      }
    }

    const localMsgs = localDb.findByField<any>('chat_messages', 'roomId', roomId);
    if (localMsgs.length > 0) return localMsgs;

    return [
      { id: 'msg_1', roomId, senderId: 'user_10', senderName: 'Teacher Alex', senderAvatar: '/mascots/pepe_mascot_tutor.png', content: 'Chào mừng các bạn đến với phòng trò chuyện học tập EchLearn!', timestamp: new Date().toISOString() }
    ];
  },

  async sendChatMessage(roomId: string, senderId: string, content: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('chat_messages').insert({ room_id: roomId, sender_id: senderId, content });
    }
    localDb.insert<any>('chat_messages', {
      id: crypto.randomUUID(),
      roomId,
      senderId,
      senderName: 'Bạn',
      senderAvatar: '/mascots/pepe_mascot_avatar.png',
      content,
      timestamp: new Date().toISOString()
    });
  },

  async getFriendRecords(userId: string): Promise<FriendRecord[]> {
    if (isSupabaseConfigured() && supabase && userId) {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id, user_id, friend_id, status, created_at, updated_at,
          userProfile:profiles!user_id(id, display_name, username, avatar_url, level, total_xp),
          friendProfile:profiles!friend_id(id, display_name, username, avatar_url, level, total_xp)
        `)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

      if (!error && data) {
        return data.map((row: any) => {
          const isUser = row.user_id === userId;
          // Supabase joins can return arrays for ambiguous FK relations — unwrap safely
          const rawOther = isUser ? row.friendProfile : row.userProfile;
          const other = Array.isArray(rawOther) ? rawOther[0] : rawOther;
          const otherId = String((other?.id || (isUser ? row.friend_id : row.user_id) || 'user'));
          const shortId = otherId.slice(0, 6);
          return {
            id: String(row.id || ''),
            fromUserId: String(row.user_id || ''),
            toUserId: String(row.friend_id || ''),
            status: row.status,
            displayName: String(other?.display_name || other?.username || `Học Viên #${shortId}`),
            username: String(other?.username || `learner_${shortId}`),
            avatarUrl: String(other?.avatar_url || DEFAULT_FRIEND_AVATAR),
            level: Number(other?.level) || 1,
            totalXP: Number(other?.total_xp) || 0,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          };
        });
      }
    }

    try {
      const raw = localStorage.getItem('echlearn_friend_requests_v2');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },

  async sendFriendRequest(userId: string, targetUserId: string): Promise<boolean> {
    assertFriendRequestIsValid(userId, targetUserId);
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('friends').insert({
        user_id: userId,
        friend_id: targetUserId,
        status: 'pending'
      });
      if (!error) return true;
    }
    return false;
  },

  async updateFriendRequestStatus(recordId: string, status: 'accepted' | 'declined'): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('friends')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', recordId);
      if (!error) return true;
    }
    return false;
  },

  async removeFriendRecord(recordId: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('friends').delete().eq('id', recordId);
      if (!error) return true;
    }
    return false;
  }
};
