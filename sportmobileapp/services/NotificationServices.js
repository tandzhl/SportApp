// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import Constants from 'expo-constants';
// import { Platform } from 'react-native';
// import axios from 'axios';
// // import AsyncStorage from '@react-native-async-storage/async-storage';

// const api = axios.create({
//   baseURL: 'http://192.168.1.10:8000/',
//   headers: { 'Content-Type': 'application/json' },
// });

// api.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem('authToken');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export const setupNotifications = async () => {
//   if (Platform.OS !== 'android') {
//     console.log('This app currently supports notifications only on Android');
//     return;
//   }

//   if (!Device.isDevice) {
//     console.log('Notifications require a physical Android device');
//     return;
//   }

//   const { status } = await Notifications.requestPermissionsAsync();
//   if (status !== 'granted') {
//     console.log('Notification permission not granted');
//     return;
//   }

//   const projectId = Constants.expoConfig?.extra?.eas?.projectId;
//   if (!projectId) {
//     console.log('Project ID not found in app.json');
//     return;
//   }

//   try {
//     const token = await Notifications.getExpoPushTokenAsync({ projectId });
//     await api.post('/register-device/', {
//       token: token.data,
//       device_type: 'android',
//     });
//     console.log('Device registered:', token.data);
//   } catch (error) {
//     console.error('Failed to register device:', error);
//   }

//   Notifications.addNotificationReceivedListener((notification) => {
//     console.log('Notification received:', notification);
//   });

//   Notifications.addNotificationResponseReceivedListener((response) => {
//     console.log('Notification response:', response);
//     const { type, schedule_id, discount_id } = response.notification.request.content.data;
//     //điều hướng type === 'schedule' thì mở màn hình lịch học
//   });

//   Notifications.setNotificationChannelAsync('default', {
//     name: 'default',
//     importance: Notifications.AndroidImportance.MAX,
//     vibrationPattern: [0, 250, 250, 250],
//     lightColor: '#FF231F7C',
//   });
// };

// export const initializeNotifications = () => {
//   Notifications.getLastNotificationResponseAsync().then((response) => {
//     if (response) {
//       console.log('App opened from notification:', response);
//     }
//   });
// };

// export const sendPromotionNotification = async (discountId) => {
//   try {
//     const response = await api.post('/send-promotion-notification/', {
//       discount_id: discountId,
//     });
//     console.log('Promotion notification sent:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Failed to send promotion notification:', error);
//     throw error;
//   }
// };