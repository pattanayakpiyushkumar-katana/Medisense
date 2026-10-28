export const notificationHelper = {
  isSupported: (): boolean => {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  getPermission: (): NotificationPermission => {
    if (!notificationHelper.isSupported()) return 'denied';
    return Notification.permission;
  },

  requestPermission: async (): Promise<NotificationPermission> => {
    if (!notificationHelper.isSupported()) {
      alert('Browser notifications are not supported on this browser.');
      return 'denied';
    }
    return await Notification.requestPermission();
  },

  sendNotification: (title: string, options?: NotificationOptions): boolean => {
    if (!notificationHelper.isSupported() || Notification.permission !== 'granted') {
      return false;
    }
    try {
      new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options,
      });
      return true;
    } catch (e) {
      console.warn('Failed to dispatch notification:', e);
      return false;
    }
  },

  limitationsNote: 
    'Browser notifications rely on your browser running. When your browser is completely shut down or mobile device is asleep in low-power mode, reminders may be delayed or silenced. For critical medical schedules, use Medisense in combination with your phone’s system alarm.'
};

