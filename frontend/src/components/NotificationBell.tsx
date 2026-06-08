'use client';

import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import type { Notification } from '@/lib/types';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    socket?.on('application:status_changed', () => load());
    return () => {
      socket?.off('application:status_changed');
    };
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const handleRead = async (id: string) => {
    await markNotificationRead(id);
    load();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md bg-slate-100 px-3 py-1.5 hover:bg-slate-200"
      >
        Notifications
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-500">No notifications</p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n._id}
                  className={`rounded-md p-2 text-sm ${n.read ? 'bg-white' : 'bg-indigo-50'}`}
                >
                  <p className="font-medium">{n.title}</p>
                  <p className="text-slate-600">{n.message}</p>
                  {!n.read && (
                    <button
                      onClick={() => handleRead(n._id)}
                      className="mt-1 text-xs text-indigo-600 hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
