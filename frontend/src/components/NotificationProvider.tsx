'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export type Notification = {
  _id: string;
  recipient: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  createdAt: string;
};

interface NotificationContextProps {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextProps>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({
  children,
  userId = 'all', // In a real app, this comes from the auth context
}: {
  children: React.ReactNode;
  userId?: string;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Determine backend URL (fallback to localhost for development)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    const socketIo = io(backendUrl);
    setSocket(socketIo);

    socketIo.on('connect', () => {
      console.log('Connected to notification server');
      // Join the global room and personal user room
      socketIo.emit('join', 'all');
      if (userId && userId !== 'all') {
        socketIo.emit('join', userId);
      }
    });

    socketIo.on('newNotification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socketIo.disconnect();
    };
  }, [userId]);

  // Fetch initial notifications via REST API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const res = await fetch(`${backendUrl}/api/notifications?recipient=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };
    fetchNotifications();
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      await fetch(`${backendUrl}/api/notifications/${id}/read`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      await fetch(`${backendUrl}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipient: userId }),
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
