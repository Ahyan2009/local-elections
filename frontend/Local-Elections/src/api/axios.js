import axios from 'axios';

const API = axios.create({
  baseURL: 'https://candidate-system-api.ahyanmk3.workers.dev/api',
});

export default API;