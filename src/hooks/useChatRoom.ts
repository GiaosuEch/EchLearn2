import { useState, useEffect, useCallback } from 'react';
import { ChatRepository } from '../repositories/ChatRepository';
import { useAuthStore } from '../stores/authStore';
import { toast } from '../components/ui/Toast';

export function useChatRoom() {
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const user = useAuthStore(s => s.user);
  const userId = user?.id;

  const fetchRooms = useCallback(async () => {
    if (!userId) return;
    const rooms = await ChatRepository.getChatRooms(userId);
    setChatRooms(rooms);
    return rooms;
  }, [userId]);

  useEffect(() => {
    fetchRooms().then(rooms => {
      // setActiveChat to a function to ensure we get the latest state safely and don't overwrite if they just picked one
      if (rooms) {
        setActiveChat(currentChat => currentChat ?? rooms[0]?.id);
      }
    });
  }, [fetchRooms]);

  useEffect(() => {
    if (activeChat) {
      ChatRepository.getChatMessages(activeChat).then(setMessages);
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !activeChat || !user) return false;
    
    // Optimistic UI
    const optimisticId = `pending-${Date.now()}`;
    const newMsg = {
      id: optimisticId,
      roomId: activeChat,
      senderId: user.id,
      senderName: user.displayName,
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    setMessages(prev => [...prev, newMsg]);
    
    try {
      await ChatRepository.sendChatMessage(activeChat, user.id, content);
      // Reload from server to get proper ID and timestamp
      const updatedMessages = await ChatRepository.getChatMessages(activeChat);
      setMessages(updatedMessages);
      return true;
    } catch {
      setMessages(prev => prev.filter(message => message.id !== optimisticId));
      toast('Chưa thể gửi tin nhắn. Vui lòng thử lại.', 'error');
      return false;
    }
  };

  const createRoom = async (name: string, password?: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const roomId = await ChatRepository.createChatRoom(user.id, name, 'group', password);
      if (roomId) {
        const updated = await fetchRooms();
        if (updated) setActiveChat(roomId);
        return true;
      }
    } catch {
      toast('Chưa thể tạo phòng. Vui lòng thử lại.', 'error');
    }
    return false;
  };

  const joinRoom = async (roomId: string, password?: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const success = await ChatRepository.joinChatRoom(roomId, user.id, password);
      if (success) {
        toast('Joined room successfully', 'success');
        await fetchRooms();
        setActiveChat(roomId);
        return true;
      } else {
        toast('Failed to join room. Check ID and password.', 'error');
      }
    } catch {
      toast('Error joining room', 'error');
    }
    return false;
  };

  return {
    chatRooms,
    activeChat,
    setActiveChat,
    messages,
    sendMessage,
    createRoom,
    joinRoom,
    user
  };
}
