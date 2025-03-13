// components/Notification.js
import { useEffect, useState } from 'react';

type NotificationType = 'info' | 'warning' | 'error' | 'success';

type NotificationInfo = {
  id: number;
  message: string;
  type: NotificationType;
  onClose?: () => void;
};

type NotificationProps = Omit<NotificationInfo, 'id'>;

const Notification = ({ message, type, onClose = () => undefined }: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getColorClass = () => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 border-blue-500';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500';
      case 'error':
        return 'bg-red-100 border-red-500';
      case 'success':
        return 'bg-green-100 border-green-500';
      default:
        return 'bg-gray-100 border-gray-500';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 border-l-4 rounded-lg shadow-lg ${getColorClass()}`}
    >
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button onClick={() => setIsVisible(false)} className="ml-4">
          &times;
        </button>
      </div>
    </div>
  );
};

const NotificationQueue = () => {
  const [notifications, setNotifications] = useState<NotificationInfo[]>([]);

  const addNotification = (message: string, type: NotificationType) => {
    const newNotification = { id: Date.now(), message, type };
    setNotifications((prev) => [...prev, newNotification]);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationQueue;