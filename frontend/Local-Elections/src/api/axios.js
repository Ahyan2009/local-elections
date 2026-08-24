import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://candidate-system-api.ahyanmk3.workers.dev/api',
});

export default API;