import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// --------------------------------------------------
// API BASE URL
// --------------------------------------------------

let API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL;

if (!API_BASE_URL) {
  if (Platform.OS === 'web') {
    // Expo Web
    API_BASE_URL = 'http://localhost:5000/api';
  } else {
    // Android/iOS physical device
    API_BASE_URL = 'http://192.168.1.14:5000/api';
  }
}

console.info('[axios] API Base URL:', API_BASE_URL);

// --------------------------------------------------
// AXIOS INSTANCE
// --------------------------------------------------

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// --------------------------------------------------
// REQUEST INTERCEPTOR
// --------------------------------------------------

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Make sure headers exist
      config.headers = config.headers || {};

      // ----------------------------------------------
      // JWT TOKEN
      // ----------------------------------------------

      const token = await AsyncStorage.getItem('userToken');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // ----------------------------------------------
      // FORM DATA / FILE UPLOAD
      // ----------------------------------------------

      // IMPORTANT:
      // Do NOT force application/json for FormData.
      // Axios will automatically create:
      //
      // multipart/form-data; boundary=...
      //
      // This is required for multer to populate req.file.

      if (
        typeof FormData !== 'undefined' &&
        config.data instanceof FormData
      ) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];

        console.info(
          '[axios] FormData request detected - Content-Type will be generated automatically'
        );
      }

      // ----------------------------------------------
      // DEBUG
      // ----------------------------------------------

      console.info(
        '[axios] Request:',
        config.method?.toUpperCase(),
        config.baseURL + config.url
      );

      return config;
    } catch (error) {
      console.error(
        '[axios] Request interceptor error:',
        error
      );

      return Promise.reject(error);
    }
  },

  (error) => {
    return Promise.reject(error);
  }
);

// --------------------------------------------------
// RESPONSE INTERCEPTOR
// --------------------------------------------------

axiosInstance.interceptors.response.use(
  (response) => {
    console.info(
      '[axios] Response:',
      response.status,
      response.config?.url
    );

    return response;
  },

  async (error) => {
    if (error.response) {
      console.error(
        '[axios] API Error:',
        error.response.status,
        error.response.config?.url,
        error.response.data
      );

      if (error.response.status === 401) {
        // Authentication expired.
        // You can clear token / navigate to login here later.
      }
    } else if (error.request) {
      console.error(
        '[axios] Network Error:',
        error.message
      );
    } else {
      console.error(
        '[axios] Request Error:',
        error.message
      );
    }

    return Promise.reject(error);
  }
);

// --------------------------------------------------
// EXPORT
// --------------------------------------------------

export default axiosInstance;