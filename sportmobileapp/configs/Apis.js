import axios from "axios"

const BASE_URL = 'http://192.168.1.130:8000/';

export const endpoints = {
    'categories': '/categories/',
    'sportclasses': '/sportclasses/',
    'sportclass-detail': (classId) => `/sportclasses/${classId}/`,
    'schedules': (classId) => `/sportclasses/${classId}/schedules/`,
    'register': '/users/',
    'login': '/auth/token/',
    'current-user': '/users/current-user/',
    'coach': (classId) => `/sportclasses/${classId}/coach/`,
    'classes-of-coach': (coachId) => `/users/${coachId}/sportclasses`,
    'students': (classId) => `/sportclasses/${classId}/students/`,
    'add-schedule': '/schedules/add/',
    'update-schedule': (scheduleId) => `/schedules/${scheduleId}/update/`,
    'delete-schedule': (scheduleId) => `/schedules/${scheduleId}/delete/`,
    'list-users': '/users/list-users/',
    'manage-user-by-admin': (userId) => `/users/${userId}/admin-manage/`,
    'register-class': '/joined-sportclass/',
    'create-order': '/orders/add/',
    'pay-order': (orderId) => `/orders/${orderId}/pay/`,
    'get-order': (orderId) => `/orders/${orderId}/`,

}

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL, 
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export default axios.create({
    baseURL: BASE_URL
});

