import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Appointment Confirmed',
      message: 'Your dental checkup with Dr. Mane is confirmed for tomorrow at 10:00 AM.',
      date: '10 mins ago',
      read: false,
      type: 'appointment',
    },
    {
      id: '2',
      title: 'AI Diagnostic Report Ready',
      message: 'Your panoramic dental X-ray analysis report has been published.',
      date: '2 hours ago',
      read: false,
      type: 'report',
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (notif) => {
    setNotifications((prev) => [
      { id: Date.now().toString(), read: false, date: 'Just now', ...notif },
      ...prev,
    ]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
