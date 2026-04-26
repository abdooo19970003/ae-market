import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can add a client-side interceptor here to handle 401s 
// or automatically attach tokens if you store them in LocalStorage 
// (though you are using Cookies, which are sent automatically).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error handling
    const message = error.response?.data?.message || 'Something went wrong';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default api;
