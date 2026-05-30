export function useNotification() {
  // Permission request is deferred — call requestPermission() from onMounted
  // in the root component, not at import time.
  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const sendNotification = (title, options = {}) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    new Notification(title, { icon: '/timer.svg', requireInteraction: true, ...options })
  }

  return { requestPermission, sendNotification }
}
