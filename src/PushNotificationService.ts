import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging, NotificationReceivedEvent } from '@capacitor-firebase/messaging';
import axiosInstance from './config/axios';

// Define interface for notification data
interface NotificationData {
    roomId?: string;
    [key: string]: any;
}

class PushNotificationService {
    private static currentChatRoomId: string | null = null;
    
    static setCurrentChatRoomId(roomId: string | null) {
        this.currentChatRoomId = roomId;
    }

    static async init() {
        // Check if we're on a native platform that supports notifications
        if (!Capacitor.isNativePlatform()) {
            console.log('Push notifications are only available on native platforms');
            return;
        }

        const isPlatformAndroid = Capacitor.getPlatform() === 'android';

        try {
            if (isPlatformAndroid) {
                // Android-specific implementation using Firebase
                await this.initAndroid();
            } else {
                // iOS implementation using Capacitor PushNotifications
                await this.initIOS();
            }
        } catch (error) {
            console.error('Error initializing push notifications:', error);
        }
    }

    // Send token to backend
    private static async sendTokenToServer(token: string) {
        try {
            const platform = Capacitor.getPlatform();
            console.log('Sending push token to server:', token, 'platform:', platform);
            await axiosInstance.post('/profile/register-device', { 
                pushToken: token,
                platform: platform 
            });
            console.log('Successfully registered push token with server');
        } catch (error) {
            console.error('Failed to register push token with server:', error);
        }
    }

    private static async initAndroid() {
        // Request permission for FCM
        const { receive } = await FirebaseMessaging.requestPermissions();
        
        if (receive === 'granted') {
            try {
                // Get FCM token
                const { token } = await FirebaseMessaging.getToken();
                console.log('FCM Token:', token);
                localStorage.setItem('pushToken', token);
                
                // Send the token to the server for registration
                await this.sendTokenToServer(token);

                // Listen for token refresh
                FirebaseMessaging.addListener('tokenReceived', async (event) => {
                    console.log('FCM token refreshed:', event.token);
                    localStorage.setItem('pushToken', event.token);
                    await this.sendTokenToServer(event.token);
                });

                // Handle foreground messages
                FirebaseMessaging.addListener('notificationReceived', 
                    (event: NotificationReceivedEvent) => {
                        console.log('Push notification received (Android):', event);
                        const notification = event.notification;
                        const data = notification.data as NotificationData || {};
                        const roomId = data.roomId;
                        
                        if (roomId !== this.currentChatRoomId) {
                            this.showLocalNotification(
                                notification.title || 'New Message',
                                notification.body || 'You received a new message',
                                data
                            );
                        }
                    }
                );

                // Handle notification open
                FirebaseMessaging.addListener('notificationActionPerformed', 
                    (event: any) => {
                        console.log('Push notification opened (Android):', event);
                        const notification = event.notification;
                        const data = notification.data as NotificationData || {};
                        const roomId = data.roomId;
                        
                        if (roomId) {
                            window.location.href = `/chat/conversation/${roomId}`;
                        }
                    }
                );
            } catch (error) {
                console.error('Error setting up Firebase Messaging:', error);
            }
        } else {
            console.error('FCM permission not granted');
        }
    }

    private static async initIOS() {
        // iOS implementation using Capacitor PushNotifications
        const permissionResult = await PushNotifications.requestPermissions();
        if (permissionResult.receive === 'granted') {
            // Register with Apple Push Notification service
            await PushNotifications.register();
        } else {
            console.error('Push notification permission not granted');
        }

        // Listen for registration success
        PushNotifications.addListener('registration', async (token) => {
            console.log('Push registration success (iOS), token: ' + token.value);
            localStorage.setItem('pushToken', token.value);
            
            // Send the token to the server for registration
            await this.sendTokenToServer(token.value);
        });

        // Listen for registration errors
        PushNotifications.addListener('registrationError', (error) => {
            console.error('Push registration error: ', error);
        });

        // Handle received notifications when app is in foreground
        PushNotifications.addListener('pushNotificationReceived', async (notification) => {
            console.log('Push notification received (iOS): ', notification);
            
            // Only show notification if we're not in the chat room of the sender
            const notificationData = notification.data || {};
            const roomId = notificationData.roomId as string;
            
            if (roomId !== this.currentChatRoomId) {
                this.showLocalNotification(
                    notification.title || 'New Message',
                    notification.body || 'You received a new message',
                    notificationData
                );
            }
        });

        // Handle when user taps on notification
        PushNotifications.addListener('pushNotificationActionPerformed', (actionPerformed) => {
            console.log('Push notification action performed (iOS): ', actionPerformed);
            
            // Navigate to the chat room when notification is tapped
            const data = actionPerformed.notification.data;
            const roomId = data.roomId;
            
            if (roomId) {
                // Use window.location for navigation
                window.location.href = `/chat/conversation/${roomId}`;
            }
        });
        
        // Setup local notification action handler for when app is in foreground
        LocalNotifications.addListener('localNotificationActionPerformed', (actionPerformed: any) => {
            console.log('Local notification action performed: ', actionPerformed);
            
            const data = actionPerformed.notification.extra;
            const roomId = data?.roomId;
            
            if (roomId) {
                // Use window.location for navigation
                window.location.href = `/chat/conversation/${roomId}`;
            }
        });
    }

    private static async showLocalNotification(title: string, body: string, data: any = {}) {
        await LocalNotifications.schedule({
            notifications: [
                {
                    id: new Date().getTime(),
                    title: title,
                    body: body,
                    smallIcon: 'ic_launcher_foreground',
                    largeIcon: 'ic_launcher',
                    sound: undefined,
                    extra: data
                }
            ]
        });
    }

    static async showNotification(title: string, body: string, data: any = {}) {
        // Don't show notification if we're already in the chat room
        if (data.roomId === this.currentChatRoomId) {
            return;
        }

        if (Capacitor.isNativePlatform()) {
            this.showLocalNotification(title, body, data);
        } else {
            // Fallback for web
            if ('Notification' in window) {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(title, { body });
                    }
                });
            }
        }
    }
}

export default PushNotificationService;