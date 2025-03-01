export const requestNotificationPermission = () => {
  if ('Notification' in window) {
    Notification.requestPermission();
  }
};

export const sendNotification = (message: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Dining Philosophers', { body: message });
  }
};

