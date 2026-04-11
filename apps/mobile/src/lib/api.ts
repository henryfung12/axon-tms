import axios from 'axios';

const API_URL = 'http://192.168.0.110:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};