'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Info, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useNotification, Notification } from './NotificationProvider';
import Link from 'next/link';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) {
      markAsRead(n._id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white transform translate-x-1/4 -translate-y-1/4">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
              >
                <Check className="w-3 h-3" />
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 flex flex-col items-center">
                <Bell className="w-8 h-8 text-gray-300 mb-2" />
                No notifications yet
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((n) => {
                  const content = (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">{getIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="flex-shrink-0">
                          <span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full mt-1.5"></span>
                        </div>
                      )}
                    </div>
                  );

                  return (
                    <li
                      key={n._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        !n.read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {n.link ? (
                        <Link
                          href={n.link}
                          onClick={() => handleNotificationClick(n)}
                          className="block px-4 py-3"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div
                          onClick={() => handleNotificationClick(n)}
                          className="block px-4 py-3 cursor-pointer"
                        >
                          {content}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-center">
            <button className="text-xs text-gray-500 hover:text-gray-700 font-medium">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
