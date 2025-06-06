import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const BASE_URL = 'http://192.168.1.136:8000/';

export const endpoints = {
    'newfeed': '/newfeed/',
    'newfeed-details': (newfeedId) => `/newfeed/${newfeedId}`,
    'newfeed-like': (newfeedId) => `/newfeed/${newfeedId}/like/`,
    'comments': (newfeedId) => `/newfeed/${newfeedId}/comments/`,
    'comment-detail': (id) => `/comments/${id}/`,
    'current-user': '/users/current-user/',
    'login': '/auth/token/',
    'users-by-role': '/users/by-role/',
    'categories': '/categories/',
    'schedules': '/schedules/',
    'sport-class': '/sportclasses/',
    'schedules-update': (scheduleId) => `/schedules/${scheduleId}/update/`,
    'schedules-delete': (scheduleId) => `schedules/${scheduleId}/delete/`,
    'schedules-add': '/schedules/add/',
    'user-joined-classes': '/joined-sportclass/get_joined/',
    'class-detail': (classId) => `/sportclasses/${classId}/`,
    'orders': '/orders/list_orders/',
    'order-update-paid': (orderId) => `/orders/${orderId}/update-paid/`,
    'stats': '/stats/',

    'notifications': '/notifications',
    'discounts': '/discounts',
}

export const authApis = (token, navigate = null) => {
    const api = axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const refresh = await AsyncStorage.getItem("refresh_token");
                    if (!refresh) {
                        throw new Error("No refresh token available");
                    }
                    const res = await api.post('/auth/token/refresh/', { refresh });
                    await AsyncStorage.setItem('access_token', res.data.access);
                    originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    console.error("Refresh failed:", refreshError);
                    if (navigate) {
                        navigate('login');
                    }
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );

    return api;
};

export default axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
});

// export let endpoints = {
//     'newfeed': '/newfeed/',
//     'newfeed-details': (newfeedId) => `/newfeed/${newfeedId}`,
//     'newfeed-like': (newfeedId) => `/newfeed/${newfeedId}/like/`,
//     'comments': (newfeedId) => `/newfeed/${newfeedId}/comments/`,
//     'comment-detail': (id) => `/comments/${id}/`,
//     'current-user': '/users/current-user/',
//     'login': '/auth/token/',
// }

// const api = axios.create({
//     baseURL: BASE_URL,
//     headers: {'Content-Type': 'application/json',},
// });

// api.interceptors.request.use(async (config) => {
//     const token = await AsyncStorage.getItem('access_token');
//     if(token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });

// api.interceptors.response.use(
//     (response) => response, 
//     async (error) => {
//         const originalRequest = error.config;

//         if(error.response?.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true;

//             const refresh_token = await AsyncStorage.getItem('refresh_token');
//             if(refresh_token){
//                 try{
//                     const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
//                         refresh: refresh_token,
//                     });

//                     const newAccess = res.data.access;
//                     await AsyncStorage.setItem('access_token', newAccess);

//                     originalRequest.headers.Authorization = `Bearer ${newAccess}`;
//                     return api(originalRequest);
//                 }catch(err) {
//                     console.error('Refresh token failed');
//                 }
//             }
//         }
//         return Promise.reject(error);
//     }
// );

// export default api;
