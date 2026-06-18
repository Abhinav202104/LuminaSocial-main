export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
import axios from 'axios';
import { API_URL } from './config.js';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export default axiosInstance;