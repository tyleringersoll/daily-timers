import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNotification } from './useNotification'

describe('useNotification', () => {
  beforeEach(() => {
    const NotificationMock = vi.fn()
    NotificationMock.permission = 'granted'
    NotificationMock.requestPermission = vi.fn().mockResolvedValue('granted')
    global.Notification = NotificationMock
  })

  it('requests permission when called and permission is default', async () => {
    global.Notification.permission = 'default'
    const { requestPermission } = useNotification()
    await requestPermission()
    expect(Notification.requestPermission).toHaveBeenCalled()
  })

  it('does not request permission when already granted', async () => {
    global.Notification.permission = 'granted'
    const { requestPermission } = useNotification()
    await requestPermission()
    expect(Notification.requestPermission).not.toHaveBeenCalled()
  })

  it('sends notification with default options', () => {
    const { sendNotification } = useNotification()
    sendNotification('Test Title')
    expect(Notification).toHaveBeenCalledWith('Test Title', {
      icon: '/timer.svg',
      requireInteraction: true,
    })
  })

  it('merges custom options, allowing icon override', () => {
    const { sendNotification } = useNotification()
    sendNotification('Test Title', { body: 'Test Body', icon: '/custom-icon.png' })
    expect(Notification).toHaveBeenCalledWith('Test Title', {
      icon: '/custom-icon.png',
      requireInteraction: true,
      body: 'Test Body',
    })
  })

  it('does not send notification when permission is denied', () => {
    global.Notification.permission = 'denied'
    const { sendNotification } = useNotification()
    sendNotification('Test Title')
    expect(Notification).not.toHaveBeenCalled()
  })

  it('does not throw when Notification API is unavailable', () => {
    const saved = global.Notification
    delete global.Notification
    expect(() => {
      const { sendNotification } = useNotification()
      sendNotification('Test Title')
    }).not.toThrow()
    global.Notification = saved
  })
})
