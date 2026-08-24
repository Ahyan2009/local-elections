import axios from 'axios';

const API = axios.create({
<<<<<<< HEAD
  baseURL: 'https://candidate-system-api.ahyanmk3.workers.dev/api',
=======
  baseURL: import.meta.env.VITE_API_URL || 'https://candidate-system-api.ahyanmk3.workers.dev/api',
>>>>>>> bfa7733bc1ca36379340e1bb17b4c79b26470854
});

export default API;
