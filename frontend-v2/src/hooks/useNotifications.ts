import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './useAuth';

export interface Notification {
  id: number;
  userId: number;
  email: string;
  eventName: string;
  message: string;
  sentAt: string;
}

export function useNotifications() {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!session?.userId) return;
    
    setIsLoading(true);
    try {
      const data = await api.get<Notification[]>(`/notifications/user/${session.userId}`);
      
      const lastSeen = parseInt(localStorage.getItem(`notifSeen_${session.userId}`) || "0");
      const unread = data.filter(n => new Date(n.sentAt).getTime() > lastSeen).length;
      
      setNotifications(data.reverse());
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Optional: Could set up a polling interval here to check for new notifications automatically
  }, [session?.userId]);

  const markAllAsRead = () => {
    if (!session?.userId) return;
    localStorage.setItem(`notifSeen_${session.userId}`, Date.now().toString());
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAllAsRead
  };
}
