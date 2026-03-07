import axios from 'axios';

// Get token from local storage
const getToken = () => localStorage.getItem('smartbell_token');

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Pointing to local Laravel API
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Intercept requests to inject the token
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Intercept responses to handle auth errors (e.g. token expiration)
api.interceptors.response.use((response) => response, (error) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('smartbell_token');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default api;
