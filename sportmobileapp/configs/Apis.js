import axios from "axios"

const BASE_URL = 'http://192.168.10.113:8000';

export const endpoints = {
    'categories': '/categories/',
    'sportclasses': '/sportclasses/',
    'schedules': (classId) => `/sportclasses/${classId}/schedules/`,
    'register': '/users/',
    'login': '/o/token/',
    'current-user': '/users/current-user'
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